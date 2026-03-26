import OpenAI from "openai";
import type { DocumentType, DocumentTone } from "@/types";

const providerName = process.env.OPENROUTER_API_KEY ? "OpenRouter" : "OpenAI";
const defaultFallbackModel = process.env.OPENROUTER_API_KEY ? "openai/gpt-4o-mini" : "gpt-4o-mini";
const primaryModel =
  process.env.OPENROUTER_MODEL ||
  process.env.OPENAI_MODEL ||
  (process.env.OPENROUTER_API_KEY ? "openai/gpt-4o-mini" : "gpt-4.1-mini");
const fallbackModels = [primaryModel, defaultFallbackModel].filter(
  (model, index, models) => models.indexOf(model) === index,
);

export class AIRequestError extends Error {
  readonly status: number;
  readonly retryAfter?: number;

  constructor(message: string, status = 500, retryAfter?: number) {
    super(message);
    this.name = "AIRequestError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function getClient() {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AIRequestError(
      "No AI provider is configured on the server. Add OPENROUTER_API_KEY or OPENAI_API_KEY to continue.",
      500,
    );
  }

  const isOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);

  return new OpenAI({
    apiKey,
    baseURL: isOpenRouter ? process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1" : undefined,
    defaultHeaders: isOpenRouter
      ? {
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "DocGenius AI",
        }
      : undefined,
    timeout: 45_000,
    maxRetries: 0,
  });
}

const TONE_DESCRIPTIONS: Record<DocumentTone, string> = {
  professional: "professional, clear, and business-appropriate",
  casual: "casual, friendly, and conversational",
  academic: "academic, formal, and research-oriented",
  creative: "creative, engaging, and imaginative",
  formal: "formal, structured, and official",
};

export function buildDocumentPrompt(
  topic: string,
  instructions: string,
  tone: DocumentTone,
  docType: DocumentType,
  requirements?: string,
) {
  const allContext = [topic, instructions, requirements].filter(Boolean).join(" ").toLowerCase();

  if (docType === "docx" && (allContext.includes("resume") || allContext.includes("ats"))) {
    return buildResumePrompt(topic, instructions, requirements || "", `Target job or field: ${topic || instructions}`);
  }

  const toneDesc = TONE_DESCRIPTIONS[tone];

  if (docType === "pptx") {
    return `You are an expert presentation designer.
Create a professional PowerPoint presentation about "${topic}".
Instructions: ${instructions}
${requirements ? `Requirements: ${requirements}` : ""}
Tone: ${toneDesc}

Return only valid JSON in this shape:
{
  "title": "Presentation Title",
  "subtitle": "Optional subtitle",
  "slides": [
    {
      "title": "Slide Title",
      "content": "Main content paragraph",
      "bullets": ["Point 1", "Point 2"],
      "slideType": "title|content|bullets|conclusion"
    }
  ]
}

Include 8 to 12 slides. Make the first slide "title" and the final slide "conclusion".`;
  }

  if (docType === "xlsx") {
    return `You are a data analyst.
Create a structured spreadsheet about "${topic}".
Instructions: ${instructions}
${requirements ? `Requirements: ${requirements}` : ""}
Tone: ${toneDesc}

Return only valid JSON in this shape:
{
  "title": "Spreadsheet Title",
  "sheets": [
    {
      "name": "Sheet Name",
      "headers": ["Column 1", "Column 2", "Column 3"],
      "rows": [["Value 1", 10, 20], ["Value 2", 30, 40]],
      "chartType": "bar|pie|line",
      "chartTitle": "Chart Title"
    }
  ]
}

Include 2 to 3 sheets with realistic, meaningful data that is suitable for charting.`;
  }

  return `You are an expert ${tone} document writer.
Create a high-quality ${docType === "docx" ? "Word document" : "PDF report"} about "${topic}".
Instructions: ${instructions}
${requirements ? `Requirements: ${requirements}` : ""}
Tone: ${toneDesc}

Return only valid JSON in this shape:
{
  "title": "Document Title",
  "docType": "${docType}",
  "sections": [
    {
      "heading": "Section Heading",
      "body": "Detailed paragraph content",
      "bullets": ["Optional bullet 1", "Optional bullet 2"]
    }
  ],
  "metadata": {
    "author": "DocGenius AI",
    "subject": "${topic}"
  }
}

Include 5 to 8 well-developed sections with substantial content.`;
}

export function buildResumePrompt(
  name: string,
  experience: string,
  skills: string,
  jobDescription: string,
) {
  return `You are an expert resume writer. Create a professional, ATS-optimized resume.
Name: ${name}
Experience: ${experience}
Skills: ${skills}
Target Job: ${jobDescription}

Return only valid JSON:
{
  "title": "${name} - Resume",
  "docType": "docx",
  "sections": [
    { "heading": "Professional Summary", "body": "..." },
    { "heading": "Work Experience", "body": "...", "bullets": ["achievement 1", "achievement 2"] },
    { "heading": "Skills", "bullets": ["skill 1", "skill 2"] },
    { "heading": "Education", "body": "..." }
  ],
  "ats_score": 85,
  "keywords_used": ["keyword 1", "keyword 2"],
  "improvements": ["suggestion 1", "suggestion 2"]
}`;
}

export function buildRewritePrompt(
  text: string,
  action: "rewrite" | "expand" | "summarize" | "simplify" | "improve",
) {
  const actions = {
    rewrite: "Rewrite the following text to be clearer and more engaging.",
    expand: "Expand the following text with more detail and useful specifics.",
    summarize: "Summarize the following text concisely.",
    simplify: "Simplify the following text for a general audience.",
    improve: "Improve the writing quality, grammar, and flow of the following text.",
  };

  return `${actions[action]} Return only the transformed text with no explanation.\n\n${text}`;
}

function sanitizeJsonResponse(raw: string) {
  return raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
}

async function withRetry<T>(operation: () => Promise<T>, retries = 2): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new AIRequestError(
          "The AI request took too long. Please try again with a shorter prompt or try again in a moment.",
          408,
        );
      }

      const status =
        typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 500;
      const headers =
        typeof error === "object" && error !== null && "headers" in error
          ? (error.headers as Headers | undefined)
          : undefined;
      const retryAfterHeader = headers?.get?.("retry-after");
      const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;

      if (attempt < retries && (status === 429 || status >= 500)) {
        const delay = retryAfter && Number.isFinite(retryAfter) ? retryAfter * 1000 : 1000 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt += 1;
        continue;
      }

      if (status === 429) {
        throw new AIRequestError(
          `${providerName} is temporarily rate limited. Please try again in a moment.`,
          429,
          retryAfter,
        );
      }

      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "OpenAI request failed.";

      if (message.toLowerCase().includes("timeout")) {
        throw new AIRequestError(
          `The ${providerName} request timed out. Please try again with a shorter prompt or try again in a moment.`,
          408,
        );
      }

      throw new AIRequestError(message, status || 500, retryAfter);
    }
  }
}

export async function generateContent(prompt: string) {
  const client = getClient();

  let lastRateLimitError: AIRequestError | null = null;

  for (const model of fallbackModels) {
    try {
      const response = await withRetry(() =>
        client.responses.create({
          model,
          input: prompt,
          temperature: 0.7,
        }),
      );

      const text = response.output_text?.trim();

      if (!text) {
        throw new AIRequestError(`${providerName} returned an empty response.`, 502);
      }

      return text;
    } catch (error) {
      if (error instanceof AIRequestError && error.status === 429) {
        lastRateLimitError = error;
        continue;
      }

      throw error;
    }
  }

  throw (
    lastRateLimitError ||
    new AIRequestError(
      `${providerName} is temporarily rate limited on the current account. Check your API usage, billing, or try again shortly.`,
      429,
    )
  );
}

export async function generateStructuredContent(
  topic: string,
  instructions: string,
  tone: DocumentTone,
  docType: DocumentType,
  requirements?: string,
) {
  const prompt = buildDocumentPrompt(topic, instructions, tone, docType, requirements);
  const raw = await generateContent(prompt);

  try {
    return JSON.parse(sanitizeJsonResponse(raw));
  } catch {
    throw new AIRequestError("The AI response could not be parsed. Please try again.", 502);
  }
}
