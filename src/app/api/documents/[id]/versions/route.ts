import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // First verify user owns the document
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Document not found or unauthorized" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", id)
    .order("version_number", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ versions: data });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user owns the document
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Document not found or unauthorized" }, { status: 404 });
  }

  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Get latest version number
  const { data: latestVersion } = await supabase
    .from("document_versions")
    .select("version_number")
    .eq("document_id", id)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  const nextVersionNum = (latestVersion?.version_number || 0) + 1;

  const { data, error } = await supabase
    .from("document_versions")
    .insert({
      document_id: id,
      content,
      version_number: nextVersionNum,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ version: data });
}
