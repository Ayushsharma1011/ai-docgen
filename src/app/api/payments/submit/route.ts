import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_PLANS = new Set(["free", "pro", "premium"]);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      payment_type?: "plan" | "tokens";
      plan?: "free" | "pro" | "premium" | null;
      token_amount?: number | null;
      rupee_amount?: number;
      upi_id?: string;
      upi_name?: string | null;
      reference_note?: string | null;
    };

    if (!body.payment_type || !["plan", "tokens"].includes(body.payment_type)) {
      return NextResponse.json({ error: "payment_type must be plan or tokens" }, { status: 400 });
    }

    if (!body.rupee_amount || body.rupee_amount <= 0) {
      return NextResponse.json({ error: "rupee_amount must be greater than 0" }, { status: 400 });
    }

    if (!body.upi_id?.trim()) {
      return NextResponse.json({ error: "upi_id is required" }, { status: 400 });
    }

    if (body.payment_type === "plan") {
      if (!body.plan || !VALID_PLANS.has(body.plan) || body.plan === "free") {
        return NextResponse.json({ error: "A paid plan is required" }, { status: 400 });
      }
    }

    if (body.payment_type === "tokens" && (!body.token_amount || body.token_amount <= 0)) {
      return NextResponse.json({ error: "token_amount is required for token payments" }, { status: 400 });
    }

    const { error } = await supabase.from("payment_submissions").insert({
      user_id: user.id,
      payment_type: body.payment_type,
      plan: body.payment_type === "plan" ? body.plan : null,
      token_amount: body.payment_type === "tokens" ? body.token_amount : null,
      rupee_amount: body.rupee_amount,
      upi_id: body.upi_id.trim(),
      upi_name: body.upi_name?.trim() || null,
      reference_note: body.reference_note?.trim() || null,
      status: "pending",
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Payment submission recorded. The admin can now review and confirm it from the payment panel.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save payment submission.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
