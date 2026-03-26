import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AIRequestError, generateContent, buildRewritePrompt } from "@/lib/openai";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    enforceRateLimit(`rewrite:${user.id}`, 8, 60_000);

    const { text, action } = await req.json();
    if (!text || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const prompt = buildRewritePrompt(text, action);
    const result = await generateContent(prompt);

    return NextResponse.json({ result });
  } catch (err: unknown) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: err.message },
        { status: 429, headers: { "Retry-After": err.retryAfter.toString() } },
      );
    }

    if (err instanceof AIRequestError) {
      return NextResponse.json(
        { error: err.message },
        {
          status: err.status,
          headers: err.retryAfter ? { "Retry-After": err.retryAfter.toString() } : undefined,
        },
      );
    }

    const message = err instanceof Error ? err.message : "Rewrite failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
