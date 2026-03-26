import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_TOKEN_LIMITS } from "@/lib/utils";

const VALID_PLANS = new Set(["free", "pro", "premium"]);

async function applySubmissionBenefits(
  supabase: ReturnType<typeof createAdminClient>,
  submission: {
    user_id: string;
    payment_type: "plan" | "tokens";
    plan: "free" | "pro" | "premium" | null;
    token_amount: number | null;
  },
  body: {
    plan?: "free" | "pro" | "premium" | null;
    token_amount?: number | null;
  },
) {
  if (submission.payment_type === "plan") {
    const targetPlan = body.plan ?? submission.plan;
    if (!targetPlan || !VALID_PLANS.has(targetPlan) || targetPlan === "free") {
      return NextResponse.json({ error: "A paid plan is required to confirm this submission." }, { status: 400 });
    }

    const [{ data: tokenRow, error: tokenError }, { error: planError }] = await Promise.all([
      supabase
        .from("tokens")
        .select("balance, total_used")
        .eq("user_id", submission.user_id)
        .maybeSingle(),
      supabase.from("users").update({ plan: targetPlan }).eq("id", submission.user_id),
    ]);

    if (tokenError) {
      throw tokenError;
    }

    if (planError) {
      throw planError;
    }

    const tokenFloor = PLAN_TOKEN_LIMITS[targetPlan];
    const nextBalance = Math.max(tokenRow?.balance ?? 0, tokenFloor);
    const { error: balanceError } = await supabase.from("tokens").upsert(
      {
        user_id: submission.user_id,
        balance: nextBalance,
        total_used: tokenRow?.total_used ?? 0,
      },
      {
        onConflict: "user_id",
      },
    );

    if (balanceError) {
      throw balanceError;
    }

    return null;
  }

  const creditAmount = body.token_amount ?? submission.token_amount;
  if (!creditAmount || creditAmount <= 0) {
    return NextResponse.json({ error: "A positive token amount is required to confirm this submission." }, { status: 400 });
  }

  const { data: tokenRow, error: tokenError } = await supabase
    .from("tokens")
    .select("balance, total_used")
    .eq("user_id", submission.user_id)
    .maybeSingle();

  if (tokenError) {
    throw tokenError;
  }

  const nextBalance = (tokenRow?.balance ?? 0) + creditAmount;
  const { error } = await supabase.from("tokens").upsert(
    {
      user_id: submission.user_id,
      balance: nextBalance,
      total_used: tokenRow?.total_used ?? 0,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw error;
  }

  return null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await requireAdminUser();
    const { id } = await params;
    const body = (await req.json()) as {
      action?: "confirm" | "reject";
      plan?: "free" | "pro" | "premium" | null;
      token_amount?: number | null;
      admin_note?: string | null;
    };

    if (!body.action || !["confirm", "reject"].includes(body.action)) {
      return NextResponse.json({ error: "action must be confirm or reject" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: submission, error: submissionError } = await supabase
      .from("payment_submissions")
      .select("id, user_id, payment_type, plan, token_amount, status")
      .eq("id", id)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({ error: "Payment submission not found." }, { status: 404 });
    }

    if (submission.status === "rejected" && body.action === "reject") {
      return NextResponse.json({ error: "This payment has already been rejected." }, { status: 409 });
    }

    if (body.action === "confirm") {
      const benefitError = await applySubmissionBenefits(supabase, submission, body);
      if (benefitError) {
        return benefitError;
      }
    }

    const { error: reviewError } = await supabase
      .from("payment_submissions")
      .update({
        plan: submission.payment_type === "plan" ? body.plan ?? submission.plan : submission.plan,
        status: body.action === "confirm" ? "confirmed" : "rejected",
        token_amount: submission.payment_type === "tokens" ? body.token_amount ?? submission.token_amount : submission.token_amount,
        admin_note: body.admin_note?.trim() || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUser.id,
      })
      .eq("id", submission.id);

    if (reviewError) {
      throw reviewError;
    }

    return NextResponse.json({
      message:
        body.action === "confirm"
          ? submission.status === "confirmed"
            ? "Payment benefits synced successfully."
            : "Payment confirmed successfully."
          : "Payment rejected successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update payment submission.";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
