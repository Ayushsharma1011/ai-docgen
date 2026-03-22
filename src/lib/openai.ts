import OpenAI from 'openai';
import { DocumentType, DocumentTone, StructuredContent, SlideContent, ExcelContent } from '@/types';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
});

const TONE_DESCRIPTIONS: Record<DocumentTone, string> = {
  professional: 'professional, clear, and business-appropriate',
  casual: 'casual, friendly, and conversational',
  academic: 'academic, formal, and research-oriented',
  creative: 'creative, engaging, and imaginative',
  formal: 'formal, structured, and official',
};

export function buildDocumentPrompt(
  topic: string,
  instructions: string,
  tone: DocumentTone,
  docType: DocumentType,
  requirements?: string
): string {
  if (docType === 'docx' && (topic.toLowerCase().includes('resume') || instructions.toLowerCase().includes('resume') || requirements?.toLowerCase().includes('resume') || requirements?.toLowerCase().includes('ats'))) {
    return buildResumePrompt(topic, instructions, requirements || '', 'Target job or field: ' + (topic || instructions));
  }

  const toneDesc = TONE_DESCRIPTIONS[tone];

  if (docType === 'pptx') {
    return `You are an expert presentation designer. Create a professional PowerPoint presentation about: "${topic}".
Instructions: ${instructions}
${requirements ? `Requirements: ${requirements}` : ''}
Tone: ${toneDesc}

Return ONLY valid JSON in this exact format:
{
  "title": "Presentation Title",
  "subtitle": "Optional subtitle",
  "slides": [
    {
      "title": "Slide Title",
      "content": "Main content paragraph",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "slideType": "title|content|bullets|conclusion"
    }
  ]
}
Include 8-12 slides. First slide must be slideType "title", last must be "conclusion".`;
  }

  if (docType === 'xlsx') {
    return `You are a data analyst. Create a structured Excel spreadsheet about: "${topic}".
Instructions: ${instructions}
${requirements ? `Requirements: ${requirements}` : ''}

Return ONLY valid JSON in this exact format:
{
  "title": "Spreadsheet Title",
  "sheets": [
    {
      "name": "Sheet Name",
      "headers": ["Column1", "Column2", "Column3"],
      "rows": [["val1", "val2", "val3"], ["val4", "val5", "val6"]],
      "chartType": "bar|pie|line",
      "chartTitle": "Chart Title"
    }
  ]
}
Include 2-3 sheets with realistic, meaningful data. Include numeric data suitable for charting.`;
  }

  return `You are an expert ${tone} document writer. Create a high-quality ${docType === 'docx' ? 'Word document' : 'PDF report'} about: "${topic}".
Instructions: ${instructions}
${requirements ? `Requirements: ${requirements}` : ''}
Tone: ${toneDesc}

Return ONLY valid JSON in this exact format:
{
  "title": "Document Title",
  "docType": "${docType}",
  "sections": [
    {
      "heading": "Section Heading",
      "body": "Detailed paragraph content for this section",
      "bullets": ["Optional bullet point 1", "Optional bullet point 2"]
    }
  ],
  "metadata": {
    "author": "AI Document Generator",
    "subject": "${topic}"
  }
}
Include 5-8 well-developed sections with substantial content.`;
}

export function buildResumePrompt(
  name: string,
  experience: string,
  skills: string,
  jobDescription: string
): string {
  return `You are an expert resume writer. Create a professional, ATS-optimized resume.
Name: ${name}
Experience: ${experience}
Skills: ${skills}
Target Job: ${jobDescription}

Return ONLY valid JSON:
{
  "title": "${name} - Resume",
  "docType": "docx",
  "sections": [
    {"heading": "Professional Summary", "body": "..."},
    {"heading": "Work Experience", "body": "...", "bullets": ["achievement 1", "achievement 2"]},
    {"heading": "Skills", "bullets": ["skill1", "skill2"]},
    {"heading": "Education", "body": "..."}
  ],
  "ats_score": 85,
  "keywords_used": ["keyword1", "keyword2"],
  "improvements": ["suggestion1", "suggestion2"]
}`;
}

export function buildRewritePrompt(
  text: string,
  action: 'rewrite' | 'expand' | 'summarize' | 'simplify' | 'improve'
): string {
  const actions = {
    rewrite: 'Rewrite the following text to be clearer and more engaging',
    expand: 'Expand the following text with more detail and examples',
    summarize: 'Summarize the following text concisely',
    simplify: 'Simplify the following text for a general audience',
    improve: 'Improve the writing quality, grammar, and flow of the following text',
  };
  return `${actions[action]}. Return ONLY the improved text, no explanation:\n\n${text}`;
}

export async function generateContent(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4000,
  });
  return response.choices[0].message.content || '';
}

export async function generateStructuredContent(
  topic: string,
  instructions: string,
  tone: DocumentTone,
  docType: DocumentType,
  requirements?: string
): Promise<StructuredContent | SlideContent | ExcelContent> {
  const prompt = buildDocumentPrompt(topic, instructions, tone, docType, requirements);
  const raw = await generateContent(prompt);
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
