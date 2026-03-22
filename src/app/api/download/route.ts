import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { content, topic, docType } = body;

    if (!content) return NextResponse.json({ error: "No content provided" }, { status: 400 });

    const pythonUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

    // Parse HTML content into structured format for Python service
    const structuredContent = {
      title: topic || "Document",
      sections: [{ heading: "Content", body: content }],
      docType,
    };

    const res = await fetch(`${pythonUrl}/generate/${docType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(structuredContent),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Python service error: ${errText}` }, { status: 500 });
    }

    // Get the file bytes
    const fileBuffer = await res.arrayBuffer();
    const fileBytes = Buffer.from(fileBuffer);

    // Upload to Supabase storage
    const fileName = `${user.id}/${Date.now()}-${slugify(topic || "document")}.${docType}`;
    const contentTypeMap: Record<string, string> = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, fileBytes, {
        contentType: contentTypeMap[docType] || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      // If storage not set up, return direct download
      return NextResponse.json({ error: "Storage not configured — ensure 'documents' bucket exists in Supabase Storage." }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl, fileName });
  } catch (err: any) {
    console.error("Download error:", err);
    return NextResponse.json({ error: err.message || "Download failed" }, { status: 500 });
  }
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
}
