import { NextResponse } from "next/server";
import { AIRequestError, generateContent } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      topic?: string;
      focus?: string;
      audience?: string;
      deliverable?: string;
    };

    if (!body.topic?.trim()) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const deliverable = body.deliverable || "Research brief";
    const isFullReport = deliverable.toLowerCase() === "full research report";

    const prompt = isFullReport
      ? `You are a senior research strategist and analyst.
Create a detailed full research report for the topic "${body.topic}".
Focus: ${body.focus || "General market and product understanding"}
Audience: ${body.audience || "Internal product team"}
Deliverable: ${deliverable}

Return plain text with clear section headings in this order:
1. Executive Summary
2. Research Objective
3. Topic Background
4. Market Landscape
5. Audience Or User Insights
6. Competitor Analysis
7. Key Trends And Opportunities
8. Risks And Constraints
9. Recommended Strategy
10. Action Plan
11. Suggested Sources And Data To Validate

For each section, write substantial, useful content, not one-liners.
Be practical, clear, structured, and startup-friendly.`
      : `You are a senior research strategist.
Create a concise research workspace brief for the topic "${body.topic}".
Focus: ${body.focus || "General market and product understanding"}
Audience: ${body.audience || "Internal product team"}
Deliverable: ${deliverable}

Return plain text with these sections:
1. Research Goal
2. Core Questions
3. Key Angles To Investigate
4. Suggested Source Types
5. Important Data Points To Collect
6. Risks And Assumptions
7. Actionable Next Steps

Be practical, clear, and startup-friendly.`;

    const content = await generateContent(prompt);
    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof AIRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Research generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
