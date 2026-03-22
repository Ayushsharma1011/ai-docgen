import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateContent } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, docType } = await req.json();

    const prompt = `You are a professional ${docType} document assistant. Based on this document topic or content: "${content}", suggest 4 smart improvements or additional ideas the author should consider. Return ONLY a JSON array of 4 short suggestion strings. Example: ["Add a financial summary", "Include case studies", "Add charts for data", "Expand the conclusion"]`;

    const raw = await generateContent(prompt);
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const suggestions = JSON.parse(cleaned);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
