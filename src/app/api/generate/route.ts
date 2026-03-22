import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStructuredContent } from "@/lib/openai";
import { DocumentType, DocumentTone } from "@/types";
import { TOKEN_COSTS } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topic, instructions, docType, tone, requirements } = await req.json() as {
      topic: string;
      instructions: string;
      docType: DocumentType;
      tone: DocumentTone;
      requirements?: string;
    };

    if (!topic || !instructions || !docType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check token balance
    const { data: tokenData } = await supabase
      .from("tokens")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    const cost = TOKEN_COSTS[docType] ?? 2;
    if (!tokenData || tokenData.balance < cost) {
      return NextResponse.json({ error: "Insufficient tokens. Please upgrade your plan." }, { status: 402 });
    }

    // Generate content
    const content = await generateStructuredContent(topic, instructions, tone, docType, requirements);

    // Deduct tokens
    await supabase
      .from("tokens")
      .update({ balance: tokenData.balance - cost })
      .eq("user_id", user.id);

    return NextResponse.json({ content, tokensRemaining: tokenData.balance - cost });
  } catch (err: any) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
  }
}
