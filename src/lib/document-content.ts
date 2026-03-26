import { htmlToText } from "html-to-text";

type StructuredSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

type StructuredDocument = {
  title: string;
  sections: StructuredSection[];
};

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toPlainText(content: string) {
  const plain = htmlToText(content, {
    selectors: [{ selector: "a", options: { ignoreHref: true } }],
    wordwrap: false,
  }).trim();

  return plain || stripTags(content) || "No content provided.";
}

export function htmlToStructuredSections(content: string): StructuredSection[] {
  const headingPattern = /<h[2-6][^>]*>([\s\S]*?)<\/h[2-6]>/gi;
  const parts = content.split(headingPattern);
  const sections: StructuredSection[] = [];

  if (parts.length === 1) {
    return [{ heading: "Content", body: toPlainText(content) }];
  }

  const intro = toPlainText(parts[0] || "");
  if (intro && intro !== "No content provided.") {
    sections.push({ heading: "Introduction", body: intro });
  }

  for (let index = 1; index < parts.length; index += 2) {
    const heading = stripTags(parts[index]) || "Section";
    const bodyHtml = parts[index + 1] || "";
    const bullets = Array.from(bodyHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
      .map((match) => stripTags(match[1]))
      .filter(Boolean);
    const body = toPlainText(bodyHtml).replace(/\n{3,}/g, "\n\n").trim();

    sections.push({
      heading,
      body: body || " ",
      bullets: bullets.length ? bullets : undefined,
    });
  }

  return sections.length ? sections : [{ heading: "Content", body: stripTags(content) || "No content provided." }];
}

export function htmlToStructuredDocument(content: string, fallbackTitle = "Document"): StructuredDocument {
  const titleMatch = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = stripTags(titleMatch?.[1] || "") || fallbackTitle;
  const contentWithoutTitle = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "").trim();

  return {
    title,
    sections: htmlToStructuredSections(contentWithoutTitle || content),
  };
}
