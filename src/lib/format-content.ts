import type { DocumentType } from "@/types";

type Section = {
  heading: string;
  body: string;
  bullets?: string[];
};

type Slide = {
  title: string;
  content: string;
  bullets?: string[];
  notes?: string;
  slideType: "title" | "content" | "bullets" | "conclusion";
};

type Sheet = {
  name: string;
  headers: string[];
  rows: (string | number)[][];
  chartType?: "bar" | "pie" | "line";
  chartTitle?: string;
};

export type NormalizedGeneratedContent =
  | {
      title: string;
      docType: "docx" | "pdf";
      sections: Section[];
      metadata?: Record<string, string>;
    }
  | {
      title: string;
      docType: "pptx";
      subtitle?: string;
      slides: Slide[];
    }
  | {
      title: string;
      docType: "xlsx";
      sheets: Sheet[];
    };

export function normalizeGeneratedContent(
  docType: DocumentType,
  raw: unknown,
  fallbackTitle: string,
): NormalizedGeneratedContent {
  const source = isRecord(raw) ? raw : {};
  const title = getString(source.title) || fallbackTitle;

  if (docType === "pptx") {
    const slides = toSlides(source, title);
    return {
      title,
      docType,
      subtitle: getString(source.subtitle) || undefined,
      slides,
    };
  }

  if (docType === "xlsx") {
    return {
      title,
      docType,
      sheets: toSheets(source, title),
    };
  }

  return {
    title,
    docType,
    sections: toSections(source, fallbackTitle),
    metadata: isRecord(source.metadata) ? stringifyRecord(source.metadata) : undefined,
  };
}

export function renderGeneratedContent(content: NormalizedGeneratedContent): string {
  if (content.docType === "pptx") {
    return [
      `<h1>${escapeHtml(content.title)}</h1>`,
      content.subtitle ? `<p>${escapeHtml(content.subtitle)}</p>` : "",
      ...content.slides.map((slide, index) =>
        [
          `<h2>Slide ${index + 1}: ${escapeHtml(slide.title)}</h2>`,
          slide.content ? `<p>${escapeHtml(slide.content)}</p>` : "",
          slide.bullets?.length
            ? `<ul>${slide.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`
            : "",
          slide.notes ? `<blockquote>Speaker notes: ${escapeHtml(slide.notes)}</blockquote>` : "",
        ].join(""),
      ),
    ].join("");
  }

  if (content.docType === "xlsx") {
    return [
      `<h1>${escapeHtml(content.title)}</h1>`,
      ...content.sheets.map((sheet) =>
        [
          `<h2>${escapeHtml(sheet.name)}</h2>`,
          `<p>Columns: ${sheet.headers.map(escapeHtml).join(", ")}</p>`,
          ...sheet.rows.slice(0, 12).map(
            (row, rowIndex) => `<p>Row ${rowIndex + 1}: ${row.map((value) => escapeHtml(String(value))).join(" | ")}</p>`,
          ),
        ].join(""),
      ),
    ].join("");
  }

  return [
    `<h1>${escapeHtml(content.title)}</h1>`,
    ...content.sections.flatMap((section) => [
      `<h2>${escapeHtml(section.heading)}</h2>`,
      `<p>${escapeHtml(section.body)}</p>`,
      ...(section.bullets?.length
        ? [`<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`]
        : []),
    ]),
  ].join("");
}

function toSections(source: Record<string, unknown>, fallbackTitle: string): Section[] {
  if (Array.isArray(source.sections) && source.sections.length > 0) {
    return source.sections.map((item, index) => normalizeSection(item, index));
  }

  if (Array.isArray(source.slides) && source.slides.length > 0) {
    return source.slides.map((item, index) => {
      const slide = normalizeSlide(item, index, fallbackTitle);
      return {
        heading: slide.title,
        body: slide.content || `Key takeaways for ${slide.title}.`,
        bullets: slide.bullets,
      };
    });
  }

  if (Array.isArray(source.sheets) && source.sheets.length > 0) {
    return source.sheets.map((item, index) => {
      const sheet = normalizeSheet(item, index, fallbackTitle);
      return {
        heading: sheet.name,
        body: `Columns: ${sheet.headers.join(", ")}`,
        bullets: sheet.rows.slice(0, 8).map((row) => row.join(" | ")),
      };
    });
  }

  return [
    {
      heading: "Overview",
      body: getString(source.summary) || `Professional content about ${fallbackTitle}.`,
      bullets: undefined,
    },
  ];
}

function toSlides(source: Record<string, unknown>, fallbackTitle: string): Slide[] {
  const rawSlides = Array.isArray(source.slides) ? source.slides : null;
  const slides =
    rawSlides?.length
      ? rawSlides.map((item, index) => normalizeSlide(item, index, fallbackTitle))
      : toSections(source, fallbackTitle).map((section, index, sections) => ({
          title: section.heading,
          content: section.body,
          bullets: section.bullets,
          slideType: (
            index === 0 ? "title" : index === sections.length - 1 ? "conclusion" : section.bullets?.length ? "bullets" : "content"
          ) as Slide["slideType"],
        }));

  if (slides.length === 0) {
    return [
      {
        title: fallbackTitle,
        content: `Presentation about ${fallbackTitle}.`,
        slideType: "title",
      },
    ];
  }

  slides[0] = {
    ...slides[0],
    title: slides[0].title || fallbackTitle,
    slideType: "title",
  };

  if (slides.length > 1) {
    slides[slides.length - 1] = {
      ...slides[slides.length - 1],
      slideType: "conclusion",
    };
  }

  return slides;
}

function toSheets(source: Record<string, unknown>, fallbackTitle: string): Sheet[] {
  const rawSheets = Array.isArray(source.sheets) ? source.sheets : null;
  if (rawSheets?.length) {
    return rawSheets.map((item, index) => normalizeSheet(item, index, fallbackTitle));
  }

  return toSections(source, fallbackTitle).map((section, index) => ({
    name: section.heading || `Sheet ${index + 1}`,
    headers: ["Metric", "Details"],
    rows: [
      [section.heading || `Item ${index + 1}`, section.body],
      ...(section.bullets?.map((bullet, bulletIndex) => [`Point ${bulletIndex + 1}`, bullet]) ?? []),
    ],
    chartType: section.bullets?.length ? "bar" : undefined,
    chartTitle: section.heading ? `${section.heading} Summary` : undefined,
  }));
}

function normalizeSection(item: unknown, index: number): Section {
  const source = isRecord(item) ? item : {};
  return {
    heading: getString(source.heading) || `Section ${index + 1}`,
    body: getString(source.body) || "No content provided.",
    bullets: toStringArray(source.bullets),
  };
}

function normalizeSlide(item: unknown, index: number, fallbackTitle: string): Slide {
  const source = isRecord(item) ? item : {};
  const validTypes = new Set(["title", "content", "bullets", "conclusion"]);
  const rawType = getString(source.slideType);
    return {
      title: getString(source.title) || (index === 0 ? fallbackTitle : `Slide ${index + 1}`),
      content: getString(source.content) || "",
      bullets: toStringArray(source.bullets),
      notes: getString((source as Record<string, unknown>).notes) || undefined,
      slideType: validTypes.has(rawType || "") ? (rawType as Slide["slideType"]) : index === 0 ? "title" : "content",
    };
}

function normalizeSheet(item: unknown, index: number, fallbackTitle: string): Sheet {
  const source = isRecord(item) ? item : {};
  const headers = toStringArray(source.headers) ?? [];
  const rows = Array.isArray(source.rows)
    ? source.rows
        .map((row) => (Array.isArray(row) ? row.map((cell) => normalizeCell(cell)) : null))
        .filter((row): row is (string | number)[][][number] => Array.isArray(row) && row.length > 0)
    : [];

  return {
    name: getString(source.name) || `${fallbackTitle} ${index + 1}`,
    headers: headers.length ? headers : ["Column 1", "Column 2"],
    rows: rows.length ? rows : [[`Item ${index + 1}`, "No data provided"]],
    chartType: toChartType(source.chartType),
    chartTitle: getString(source.chartTitle) || undefined,
  };
}

function normalizeCell(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }
    const numericValue = Number(trimmed.replace(/,/g, ""));
    return Number.isFinite(numericValue) && /^-?\d+(\.\d+)?$/.test(trimmed.replace(/,/g, "")) ? numericValue : trimmed;
  }

  return String(value ?? "");
}

function toChartType(value: unknown): Sheet["chartType"] | undefined {
  return value === "bar" || value === "pie" || value === "line" ? value : undefined;
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((item) => getString(item))
        .filter((item): item is string => Boolean(item))
    : undefined;
}

function stringifyRecord(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, entry]) => [key, String(entry)])
      .filter(([, entry]) => entry.trim().length > 0),
  );
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
