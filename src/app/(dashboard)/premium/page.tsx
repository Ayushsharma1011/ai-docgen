"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Coins, Crown, Shield, Star, Zap } from "lucide-react";
import { requestJson } from "@/lib/client-api";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
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
    price: "₹500",
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
    price: "₹1000",
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
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300">
          <Crown className="h-4 w-4" /> Upgrade your workspace
        </div>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Choose the right plan for your team</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-white/45">
          Unlock better exports, more AI capacity, and collaboration-friendly workflows as your document volume grows.
        </p>
      </motion.div>

      <div className="mb-16 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`relative rounded-[28px] border p-8 ${
              plan.popular
                ? "border-blue-500/45 bg-[#10172b] shadow-[0_0_30px_rgba(37,99,235,0.25)]"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
                Most Popular
              </div>
            )}

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: plan.grad }}>
              <plan.icon className="h-5 w-5 text-white" />
            </div>

            <h2 className="text-2xl font-semibold">{plan.name}</h2>
            <div className="mt-2">
              <span className="text-5xl font-semibold">{plan.price}</span>
              <span className="ml-1 text-sm text-white/35">{plan.period}</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-300">
              <Coins className="h-4 w-4" />
              {plan.tokens}
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-white/72">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check className="h-3 w-3 text-emerald-300" />
                  </span>
                  {feature}
                </li>
              ))}
              {plan.disabled.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-white/28 line-through">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.05]">
                    <Check className="h-3 w-3 text-white/25" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => {
                if (plan.action.plan === "free") {
                  toast.info("You are already on the free plan.");
                  return;
                }
                void startCheckout(plan.action);
              }}
              className={`mt-8 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-opacity ${
                plan.popular ? "border border-white/70 bg-white text-[#020617] hover:opacity-90" : "border border-white/12 bg-white/[0.04] text-white hover:bg-white/[0.07]"
              }`}
              style={plan.popular ? { color: "#020617" } : undefined}
              disabled={loadingKey === `plan-${plan.action.plan}`}
            >
              {loadingKey === `plan-${plan.action.plan}` ? "Preparing checkout..." : plan.cta}
            </button>
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
              className={`rounded-[24px] border p-5 text-center ${pack.popular ? "border-blue-500/35 bg-blue-500/[0.06]" : "border-white/10 bg-white/[0.03]"}`}
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
                className="mt-4 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/[0.08]"
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
