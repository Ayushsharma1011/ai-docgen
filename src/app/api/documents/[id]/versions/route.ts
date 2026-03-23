import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/documents/[id]/versions — list all versions for a document
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const { data: doc } = await supabase
      .from("documents")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const { data: versions, error } = await supabase
      .from("document_versions")
      .select("id, version_number, created_at")
      .eq("document_id", id)
      .order("version_number", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ versions: versions || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list versions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/documents/[id]/versions — save a new version snapshot
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const { data: doc } = await supabase
      .from("documents")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

    // Get current max version number
    const { data: latest } = await supabase
      .from("document_versions")
      .select("version_number")
      .eq("document_id", id)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const nextVersion = (latest?.version_number ?? 0) + 1;

    const { data: version, error } = await supabase
      .from("document_versions")
      .insert({ document_id: id, content, version_number: nextVersion })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ version });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save version";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
