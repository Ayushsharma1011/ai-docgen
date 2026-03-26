import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { htmlToSlides, htmlToStructuredDocument, htmlToWorkbook } from "@/lib/document-content";
import { normalizeGeneratedContent } from "@/lib/format-content";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, topic, docType, structuredContent } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const pythonUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
    const structuredDocument = htmlToStructuredDocument(content, topic || "Document");
    const normalizedContent =
      structuredContent && typeof structuredContent === "object"
        ? normalizeGeneratedContent(docType, structuredContent, topic || "Document")
        : null;

    const payload =
      normalizedContent?.docType === "pptx"
        ? normalizedContent
        : normalizedContent?.docType === "xlsx"
          ? normalizedContent
          : docType === "pptx"
            ? htmlToSlides(content, topic || "Presentation")
            : docType === "xlsx"
              ? htmlToWorkbook(content, topic || "Spreadsheet")
              : {
                  title: structuredDocument.title,
                  sections: structuredDocument.sections,
                  docType,
                };

    let response: Response;

    try {
      response = await fetch(`${pythonUrl}/generate/${docType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(45_000),
      });
    } catch (error) {
      const message =
        error instanceof Error && error.name === "TimeoutError"
          ? "The document service took too long to respond. Please try again."
          : `The document service is unavailable at ${pythonUrl}. Start the Python service and try again.`;

      return NextResponse.json({ error: message }, { status: 503 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Python service error: ${errorText}` }, { status: 500 });
    }

    const fileBuffer = await response.arrayBuffer();
    const fileBytes = Buffer.from(fileBuffer);
    const fileName = `${user.id}/${Date.now()}-${slugify(structuredDocument.title || topic || "document")}.${docType}`;

    const contentTypeMap: Record<string, string> = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, fileBytes, {
      contentType: contentTypeMap[docType] || "application/octet-stream",
      upsert: true,
    });

    if (uploadError) {
      return NextResponse.json(
        { error: "Storage not configured. Ensure the 'documents' bucket exists in Supabase Storage." },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl, fileName });
  } catch (error: unknown) {
    console.error("Download error:", error);
    const message = error instanceof Error ? error.message : "Download failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
}
