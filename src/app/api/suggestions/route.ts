import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AIRequestError, generateContent } from "@/lib/openai";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    enforceRateLimit(`suggestions:${user.id}`, 10, 60_000);

    const { content, docType } = await req.json();
    if (!content || !docType) {
      return NextResponse.json({ error: "Content and document type are required." }, { status: 400 });
    }

    const prompt = `You are a professional ${docType} document assistant. Based on this document topic or content: "${content}", suggest 4 smart improvements or additional ideas the author should consider. Return ONLY a JSON array of 4 short suggestion strings. Example: ["Add a financial summary", "Include case studies", "Add charts for data", "Expand the conclusion"]`;

    const raw = await generateContent(prompt);
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const suggestions = JSON.parse(cleaned);

    return NextResponse.json({ suggestions });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: err.message },
        { status: 429, headers: { "Retry-After": err.retryAfter.toString() } },
      );
    }

    if (err instanceof AIRequestError) {
      return NextResponse.json(
        { error: err.message, suggestions: [] },
        {
          status: err.status,
          headers: err.retryAfter ? { "Retry-After": err.retryAfter.toString() } : undefined,
        },
      );
    }

    return NextResponse.json({ error: "Suggestions are unavailable right now.", suggestions: [] }, { status: 500 });
  }
}
