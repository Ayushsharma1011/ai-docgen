import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

// POST /api/documents/[id]/share — generate a shareable link token
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Generate a unique share token
    const shareToken = crypto.randomBytes(16).toString("hex");

    const { data, error } = await supabase
      .from("documents")
      .update({ share_token: shareToken, is_public: true })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("share_token")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Failed to generate share link" }, { status: 400 });
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/share/${data.share_token}`;
    return NextResponse.json({ shareUrl, token: data.share_token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to share document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/documents/[id]/share — revoke share link
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("documents")
      .update({ share_token: null, is_public: false })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to revoke share link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
