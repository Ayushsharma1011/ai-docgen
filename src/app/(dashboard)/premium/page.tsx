"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Coins, Crown, Shield, Star, Zap } from "lucide-react";
import { requestJson } from "@/lib/client-api";

const PLANS = [
  {
    name: "Free",
    price: "\u20b90",
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
    price: "\u20b9500",
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
    cta: "Upgrade to Pro",
    action: { type: "plan" as const, plan: "pro" as const },
  },
  {
    name: "Premium",
    price: "\u20b91000",
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
    cta: "Go Premium",
    action: { type: "plan" as const, plan: "premium" as const },
  },
];

const TOKEN_PACKS = [
  { amount: 20, price: "$3", label: "Starter Pack" },
  { amount: 60, price: "$8", label: "Value Pack", popular: true },
  { amount: 150, price: "$18", label: "Power Pack" },
];

export default function PremiumPage() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  async function startCheckout(payload: { type: "tokens" | "plan"; amount?: number; plan?: "free" | "pro" | "premium" }) {
    const key = `${payload.type}-${payload.plan || payload.amount}`;
    setLoadingKey(key);

    try {
      const data = await requestJson<{ message?: string }>("/api/stripe/checkout", {
        method: "POST",
        json: payload,
      });

      toast.info(data.message || "Checkout is not configured yet.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start checkout.";
      toast.error(message);
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
        <div className="glass-panel mb-6 inline-flex items-center gap-2 rounded-full border-amber-500/25 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300">
          <Crown className="h-4 w-4" /> Upgrade your workspace
        </div>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Choose the right plan for your team</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-white/45">
          Unlock better exports, more AI capacity, and collaboration-friendly workflows as your document volume grows.
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
                : "bg-[linear-gradient(180deg,rgba(18,24,39,0.88),rgba(10,14,28,0.94))] border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
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
                    void startCheckout(plan.action);
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
                  {loadingKey === `plan-${plan.action.plan}` ? "Preparing checkout..." : plan.cta}
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
                onClick={() => void startCheckout({ type: "tokens", amount: pack.amount })}
                className="glass-button mt-4 w-full rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/[0.08]"
                disabled={loadingKey === `tokens-${pack.amount}`}
              >
                {loadingKey === `tokens-${pack.amount}` ? "Preparing..." : "Buy tokens"}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-white/28">
          <Shield className="mr-1 inline h-3 w-3" />
          Stripe checkout can be enabled later by adding `STRIPE_SECRET_KEY` and the webhook configuration.
        </p>
      </motion.div>
    </div>
  );
}
