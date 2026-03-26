import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_USD_TO_INR_RATE = 83;

const PLAN_PRICING = {
  pro: { amount: 500, label: "Pro Plan" },
  premium: { amount: 1000, label: "Premium Plan" },
} as const;

const TOKEN_PACK_PRICING: Record<number, { amount: number; label: string }> = {
  20: { amount: 99, label: "Starter Token Pack" },
  60: { amount: 299, label: "Value Token Pack" },
  150: { amount: 699, label: "Power Token Pack" },
};

function buildPaymentDetails(payload: { type: "tokens" | "plan"; amount?: number; plan?: "free" | "pro" | "premium" }) {
  if (payload.type === "plan") {
    if (!payload.plan || payload.plan === "free") {
      throw new Error("Only paid plans can generate a UPI payment.");
    }

    const selectedPlan = PLAN_PRICING[payload.plan];
    if (!selectedPlan) {
      throw new Error("Unsupported plan.");
    }

    return {
      label: selectedPlan.label,
      amount: selectedPlan.amount,
      note: `DocGenius AI ${selectedPlan.label}`,
    };
  }

  if (!payload.amount) {
    throw new Error("Token amount is required.");
  }

  const selectedPack = TOKEN_PACK_PRICING[payload.amount];
  if (!selectedPack) {
    throw new Error("Unsupported token pack.");
  }

  return {
    label: selectedPack.label,
    amount: selectedPack.amount,
    note: `DocGenius AI ${selectedPack.label}`,
  };
}

function getUsdToInrRate() {
  const value = Number(process.env.NEXT_PUBLIC_USD_TO_INR_RATE ?? process.env.USD_TO_INR_RATE ?? DEFAULT_USD_TO_INR_RATE);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_USD_TO_INR_RATE;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, amount, plan } = body as {
      type?: "tokens" | "plan";
      amount?: number;
      plan?: "free" | "pro" | "premium";
    };

    if (!type) {
      return NextResponse.json({ error: "type is required (tokens | plan)" }, { status: 400 });
    }

    const upiId = process.env.NEXT_PUBLIC_UPI_ID || process.env.UPI_ID;
    const payee = process.env.NEXT_PUBLIC_UPI_NAME || process.env.UPI_NAME || "DocGenius AI";

    if (!upiId) {
      return NextResponse.json(
        { error: "UPI is not configured. Add NEXT_PUBLIC_UPI_ID to .env.local." },
        { status: 500 },
      );
    }

    const details = buildPaymentDetails({ type, amount, plan });
    const usdToInrRate = getUsdToInrRate();
    const usdAmount = Number((details.amount / usdToInrRate).toFixed(2));
    const txNote = `${details.note} - ${user.id.slice(0, 8)}`;

    const params = new URLSearchParams({
      pa: upiId,
      pn: payee,
      am: details.amount.toString(),
      cu: "INR",
      tn: txNote,
    });

    const paymentUrl = `upi://pay?${params.toString()}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(paymentUrl)}`;

    return NextResponse.json({
      label: details.label,
      paymentType: type,
      plan: type === "plan" ? plan ?? null : null,
      tokenAmount: type === "tokens" ? amount ?? null : null,
      amount: details.amount,
      amountDisplay: `\u20b9${details.amount}`,
      usdAmount,
      usdAmountDisplay: `$${usdAmount.toFixed(2)}`,
      exchangeRate: usdToInrRate,
      payee,
      upiId,
      upiName: payee,
      paymentUrl,
      qrUrl,
      note: "After the payment reaches your UPI account, the admin can confirm the plan or token credit from the in-app payment review panel.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate UPI payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
