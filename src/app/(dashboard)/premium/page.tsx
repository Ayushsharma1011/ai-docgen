"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Coins, Copy, Crown, ExternalLink, Shield, Star, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { requestJson } from "@/lib/client-api";

type PaymentSheet = {
  label: string;
  paymentType: "plan" | "tokens";
  plan: "free" | "pro" | "premium" | null;
  tokenAmount: number | null;
  amount: number;
  amountDisplay: string;
  usdAmount: number;
  usdAmountDisplay: string;
  exchangeRate: number;
  payee: string;
  upiId: string;
  upiName: string;
  paymentUrl: string;
  qrUrl: string;
  note: string;
};

const DEFAULT_USD_TO_INR_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_INR_RATE ?? 83);

function formatUsdFromInr(inr: number) {
  const rate = Number.isFinite(DEFAULT_USD_TO_INR_RATE) && DEFAULT_USD_TO_INR_RATE > 0 ? DEFAULT_USD_TO_INR_RATE : 83;
  return `$${(inr / rate).toFixed(2)}`;
}

const PLANS = [
  {
    name: "Free",
    price: "$0",
    amount: 0,
    period: "/month",
    tokens: "10 tokens",
    grad: "linear-gradient(135deg,#64748b,#475569)",
    popular: false,
    icon: Zap,
    features: [
      "10 AI generations per month",
      "PDF and Word exports",
      "Core templates",
      "Rich text editor",
      "7-day document history",
    ],
    disabled: ["PowerPoint generation", "Excel generation", "Share links", "Priority AI"],
    cta: "Current plan",
    action: { type: "plan" as const, plan: "free" as const },
  },
  {
    name: "Pro",
    price: formatUsdFromInr(500),
    amount: 500,
    period: "/month",
    tokens: "100 tokens",
    grad: "linear-gradient(135deg,#2563eb,#7c3aed)",
    popular: true,
    icon: Star,
    features: [
      "100 AI generations per month",
      "All 4 formats",
      "All templates",
      "AI rewrite actions",
      "Version history",
      "Share links",
      "Better export workflow",
    ],
    disabled: [],
    cta: "Pay for Pro",
    action: { type: "plan" as const, plan: "pro" as const },
  },
  {
    name: "Premium",
    price: formatUsdFromInr(1000),
    amount: 1000,
    period: "/month",
    tokens: "Unlimited",
    grad: "linear-gradient(135deg,#f59e0b,#f97316)",
    popular: false,
    icon: Crown,
    features: [
      "Unlimited generations",
      "All 4 formats",
      "Advanced templates",
      "Priority AI processing",
      "Custom branding",
      "API-ready architecture",
      "Dedicated support",
    ],
    disabled: [],
    cta: "Pay for Premium",
    action: { type: "plan" as const, plan: "premium" as const },
  },
];

const TOKEN_PACKS = [
  { amount: 20, price: formatUsdFromInr(99), rupeeAmount: 99, label: "Starter Pack" },
  { amount: 60, price: formatUsdFromInr(299), rupeeAmount: 299, label: "Value Pack", popular: true },
  { amount: 150, price: formatUsdFromInr(699), rupeeAmount: 699, label: "Power Pack" },
];

export default function PremiumPage() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [paymentSheet, setPaymentSheet] = useState<PaymentSheet | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [referenceNote, setReferenceNote] = useState("");

  const appLinks = useMemo(() => {
    if (!paymentSheet) return [];
    return [
      { label: "Open UPI App", href: paymentSheet.paymentUrl },
      { label: "Google Pay", href: paymentSheet.paymentUrl },
      { label: "PhonePe", href: paymentSheet.paymentUrl },
      { label: "Paytm", href: paymentSheet.paymentUrl },
    ];
  }, [paymentSheet]);

  async function openPaymentSheet(payload: { type: "tokens" | "plan"; amount?: number; plan?: "free" | "pro" | "premium" }) {
    const key = `${payload.type}-${payload.plan || payload.amount}`;
    setLoadingKey(key);

    try {
      const data = await requestJson<PaymentSheet>("/api/payments/upi", {
        method: "POST",
        json: payload,
      });

      setPaymentSheet(data);
      toast.success("UPI payment details ready.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create payment link.";
      toast.error(message);
    } finally {
      setLoadingKey(null);
    }
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch {
      toast.error(`Unable to copy ${label.toLowerCase()}.`);
    }
  }

  async function submitPaymentClaim() {
    if (!paymentSheet) return;

    setSubmittingPayment(true);

    try {
      const data = await requestJson<{ message: string }>("/api/payments/submit", {
        method: "POST",
        json: {
          payment_type: paymentSheet.paymentType,
          plan: paymentSheet.plan,
          token_amount: paymentSheet.tokenAmount,
          rupee_amount: paymentSheet.amount,
          upi_id: paymentSheet.upiId,
          upi_name: paymentSheet.upiName,
          reference_note: referenceNote,
        },
      });

      toast.success(data.message);
      setPaymentSheet(null);
      setReferenceNote("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit payment claim.";
      toast.error(message);
    } finally {
      setSubmittingPayment(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
        <div className="glass-panel mb-6 inline-flex items-center gap-2 rounded-full border-amber-500/25 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300">
          <Crown className="h-4 w-4" /> UPI payments enabled
        </div>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Choose the right plan for your team</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-white/45">
          Prices are shown in USD for clarity. At payment time, we show the INR amount to pay through UPI along with the conversion.
        </p>
      </motion.div>

      <div className="mb-16 grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`relative flex min-h-[720px] flex-col rounded-[30px] border p-8 ${
              plan.popular
                ? "border-blue-400/45 bg-[linear-gradient(180deg,rgba(21,33,64,0.92),rgba(10,16,31,0.96))] shadow-[0_28px_80px_rgba(37,99,235,0.2)]"
                : "border-white/10 bg-[linear-gradient(180deg,rgba(18,24,39,0.88),rgba(10,14,28,0.94))] shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
            }`}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[30px] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),transparent_26%)]" />
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]" />

            {plan.popular && (
              <div className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-full border border-blue-300/35 bg-[linear-gradient(180deg,rgba(59,130,246,0.95),rgba(37,99,235,0.85))] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)]">
                Most Popular
              </div>
            )}

            <div className={`relative z-10 flex h-full flex-col ${plan.popular ? "pt-7" : ""}`}>
              <div className="mb-6">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] shadow-[0_18px_40px_rgba(0,0,0,0.18)]" style={{ background: plan.grad }}>
                  <plan.icon className="h-5 w-5 text-white" />
                </div>

                <h2 className="text-[2rem] font-semibold tracking-tight text-white">{plan.name}</h2>
                <div className="mt-3 flex items-end gap-1.5">
                  <span className="text-6xl font-semibold leading-none tracking-tight">{plan.price}</span>
                  <span className="mb-2 text-base text-white/38">{plan.period}</span>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-blue-400/16 bg-blue-400/8 px-3 py-1.5 text-sm font-semibold text-blue-300">
                  <Coins className="h-4 w-4" />
                  {plan.tokens}
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[15px] leading-7 text-white/78">
                    <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                      <Check className="h-3 w-3 text-emerald-300" />
                    </span>
                    {feature}
                  </li>
                ))}
                {plan.disabled.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[15px] leading-7 text-white/24 line-through">
                    <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.05]">
                      <Check className="h-3 w-3 text-white/25" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <div className="mb-5 h-px bg-white/8" />
                <button
                  type="button"
                  onClick={() => {
                    if (plan.action.plan === "free") {
                      toast.info("You are already on the free plan.");
                      return;
                    }
                    void openPaymentSheet(plan.action);
                  }}
                  className={`w-full rounded-[18px] px-4 py-4 text-base font-semibold ${
                    plan.action.plan === "free"
                      ? "glass-button border-white/12 text-white/90"
                      : plan.popular
                        ? "glass-button glass-button-primary text-[#020617]"
                        : "glass-button text-white"
                  }`}
                  style={plan.popular ? { color: "#020617" } : undefined}
                  disabled={loadingKey === `plan-${plan.action.plan}`}
                >
                  {loadingKey === `plan-${plan.action.plan}` ? "Preparing payment..." : plan.cta}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Need a one-time token top-up?</h2>
          <p className="mt-2 text-white/45">Useful when you only need extra generations without changing plans.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TOKEN_PACKS.map((pack) => (
            <div
              key={pack.label}
              className={`glass-panel rounded-[24px] p-5 text-center ${pack.popular ? "border-blue-500/35 bg-blue-500/[0.06]" : ""}`}
            >
              {pack.popular && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300">Best value</p>}
              <div className="flex items-center justify-center gap-2">
                <Coins className="h-4 w-4 text-amber-300" />
                <span className="text-3xl font-semibold">{pack.amount}</span>
              </div>
              <p className="mt-2 text-sm text-white/45">{pack.label}</p>
              <p className="mt-3 text-2xl font-semibold text-blue-300">{pack.price}</p>
              <button
                type="button"
                onClick={() => void openPaymentSheet({ type: "tokens", amount: pack.amount })}
                className="glass-button mt-4 w-full rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
                disabled={loadingKey === `tokens-${pack.amount}`}
              >
                {loadingKey === `tokens-${pack.amount}` ? "Preparing..." : "Pay with UPI"}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-white/28">
          <Shield className="mr-1 inline h-3 w-3" />
          After receiving payment, the admin can confirm and update tokens or plans from the admin payment panel.
        </p>
      </motion.div>

      {paymentSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="glass-shell relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px]">
            <button
              type="button"
              onClick={() => setPaymentSheet(null)}
              className="glass-button absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white"
              aria-label="Close payment sheet"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-white/8 px-6 pb-5 pt-6 md:px-8">
              <div className="pr-14">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200/80">UPI Payment</p>
                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-white md:text-3xl">{paymentSheet.label}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-white/55">
                      Scan the QR or open your preferred UPI app. Prices are shown in USD across the product, and here you can see the converted INR amount you need to pay through UPI. After payment, submit the note below so the admin can verify and confirm it from the payment panel.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left md:min-w-[220px] md:text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">USD Price</p>
                    <p className="mt-1 text-3xl font-semibold text-white">{paymentSheet.usdAmountDisplay}</p>
                    <p className="mt-2 text-sm font-medium text-blue-200">Pay via UPI: {paymentSheet.amountDisplay}</p>
                    <p className="mt-1 text-xs text-white/40">1 USD = Rs.{paymentSheet.exchangeRate}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-6 md:px-8">
              <div className="grid gap-6 md:grid-cols-[0.92fr_1.08fr]">
                <div className="space-y-4">
                  <div className="glass-panel rounded-[26px] p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200/80">Scan and pay</p>
                    <p className="mt-2 text-sm leading-7 text-white/50">Best for desktop or when the UPI app is on another phone.</p>
                    <div className="mt-4 rounded-2xl border border-blue-400/15 bg-blue-400/[0.05] px-4 py-3 text-sm text-white/70">
                      USD price: <span className="font-semibold text-white">{paymentSheet.usdAmountDisplay}</span>
                      {" "} | {" "}
                      UPI payment amount: <span className="font-semibold text-white">{paymentSheet.amountDisplay}</span>
                    </div>

                    <div className="mt-5 rounded-[24px] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                      <img
                        src={paymentSheet.qrUrl}
                        alt={`UPI QR for ${paymentSheet.label}`}
                        className="mx-auto aspect-square w-full max-w-[280px] rounded-2xl object-contain"
                      />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/40">Payee</p>
                        <p className="mt-2 text-sm font-medium text-white">{paymentSheet.payee}</p>
                      </div>
                      <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/40">UPI ID</p>
                        <p className="mt-2 break-all text-sm font-medium text-white">{paymentSheet.upiId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="glass-panel rounded-[26px] p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">Direct payment</p>
                    <h3 className="mt-3 text-xl font-semibold text-white">Open your UPI app</h3>
                    <p className="mt-2 text-sm leading-7 text-white/50">On mobile, tap one of these to continue in Google Pay, PhonePe, Paytm, or any default UPI app.</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {appLinks.map((app) => (
                        <a
                          key={app.label}
                          href={app.href}
                          className="glass-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                        >
                          {app.label}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel rounded-[26px] p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/80">Copy details</p>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.18em] text-white/40">UPI ID</p>
                            <p className="mt-2 break-all text-sm font-medium text-white">{paymentSheet.upiId}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void copyText(paymentSheet.upiId, "UPI ID")}
                            className="glass-button inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Payment Link</p>
                            <p className="mt-2 break-all text-sm font-medium text-white/80">
                              Use this if you want to paste the UPI payment link manually into another app or device.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void copyText(paymentSheet.paymentUrl, "payment link")}
                            className="glass-button inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-[26px] p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200/80">Payment Confirmation</p>
                    <p className="mt-3 text-sm leading-7 text-white/55">
                      After payment, submit a short note so the transaction can be checked and your plan or tokens can be activated.
                    </p>
                    <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                      Optional note
                    </label>
                    <textarea
                      value={referenceNote}
                      onChange={(event) => setReferenceNote(event.target.value)}
                      placeholder="Add payer name, last 4 digits, screenshot note, or any payment reference"
                      className="mt-2 min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/28"
                    />
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => void submitPaymentClaim()}
                        className="glass-button glass-button-primary flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-[#020617]"
                        style={{ color: "#020617" }}
                        disabled={submittingPayment}
                      >
                        {submittingPayment ? "Submitting..." : "I have paid"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentSheet(null)}
                        className="glass-button flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                      >
                        Close
                      </button>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-white/35">
                      {paymentSheet.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
