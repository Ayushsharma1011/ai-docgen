import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateContent, buildRewritePrompt } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text, action } = await req.json();
    if (!text || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const prompt = buildRewritePrompt(text, action);
    const result = await generateContent(prompt);

    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
