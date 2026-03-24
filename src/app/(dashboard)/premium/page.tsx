"use client";

import { motion } from "framer-motion";
import { Crown, Check, Zap, Star, Shield, Coins } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    tokens: "10 tokens",
    grad: "linear-gradient(135deg,#64748b,#475569)",
    popular: false,
    icon: Zap,
    features: [
      "10 AI generations/month",
      "PDF & Word (.docx) only",
      "5 basic templates",
      "Rich text editor",
      "Document history (7 days)",
    ],
    disabled: ["PowerPoint generation", "Excel generation", "ATS Optimizer", "AI Slides Designer", "Priority AI", "Unlimited history"],
    cta: "Current Plan",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    tokens: "100 tokens",
    grad: "linear-gradient(135deg,#2563eb,#7c3aed)",
    popular: true,
    icon: Star,
    features: [
      "100 AI generations/month",
      "All 4 formats (PDF, Word, PPT, Excel)",
      "All 12 templates",
      "Rich text editor + AI actions",
      "Full document history",
      "AI Smart Suggestions",
      "Share links",
      "Version history",
    ],
    disabled: [],
    cta: "Upgrade to Pro",
  },
  {
    name: "Premium",
    price: "$49",
    period: "/month",
    tokens: "Unlimited",
    grad: "linear-gradient(135deg,#f59e0b,#f97316)",
    popular: false,
    icon: Crown,
    features: [
      "Unlimited generations",
      "All 4 formats",
      "All templates + custom",
      "AI Slides Designer",
      "ATS Resume Optimizer",
      "Excel Smart Charts",
      "Priority GPT-4o",
      "Custom branding",
      "API access",
      "Dedicated support",
    ],
    disabled: [],
    cta: "Go Premium",
  },
];

const TOKEN_PACKS = [
  { amount: 20, price: "$3", label: "Starter Pack" },
  { amount: 60, price: "$8", label: "Value Pack", popular: true },
  { amount: 150, price: "$18", label: "Power Pack" },
];

export default function PremiumPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-yellow-400 mb-6 border border-yellow-500/25 font-medium"
          style={{ background: "rgba(234,179,8,0.08)" }}
        >
          <Crown className="w-4 h-4" /> Upgrade your plan
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">Choose Your Plan</h1>
        <p className="text-white/45 text-lg">Unlock the full power of AI document generation</p>
      </motion.div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-0 mb-16">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-[#2563eb] text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  MOST POPULAR
                </span>
              </div>
            )}
            <div
              className={`rounded-[22px] p-8 border flex flex-col h-full transition-all duration-200 hover:-translate-y-1.5 ${
                plan.popular
                  ? "border-2 border-blue-500/50 shadow-glow scale-y-[1.025] z-10"
                  : "border-white/7"
              }`}
              style={{
                background: plan.popular ? "#13132b" : "rgba(18,18,28,0.85)",
              }}
            >
              <div
                className="w-11 h-11 rounded-[13px] flex items-center justify-center mb-5"
                style={{ background: plan.grad }}
              >
                <plan.icon style={{ width: 20, height: 20, color: "#fff" }} />
              </div>

              <div className="text-[26px] font-extrabold mb-1">{plan.name}</div>
              <div className="mb-1">
                <span className="text-[52px] font-extrabold leading-none">{plan.price}</span>
                <span className="text-white/35 text-sm">{plan.period}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#60a5fa] font-bold mb-6">
                <Coins className="w-3.5 h-3.5" />
                {plan.tokens}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/65">
                    <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.12)" }}>
                      <Check style={{ width: 10, height: 10, color: "#34d399" }} />
                    </div>
                    {f}
                  </li>
                ))}
                {plan.disabled.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/20 line-through">
                    <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <Check style={{ width: 10, height: 10, color: "rgba(255,255,255,0.15)" }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3.5 rounded-[13px] font-bold text-sm transition-all duration-200 ${
                  plan.popular
                    ? "bg-white text-black hover:opacity-90"
                    : plan.name === "Free"
                    ? "border border-white/7 text-white/35 cursor-default"
                    : "border border-white/10 text-white hover:bg-white/[0.06]"
                }`}
                style={!plan.popular && plan.name !== "Free" ? { background: "rgba(255,255,255,0.04)" } : plan.name === "Free" ? { background: "rgba(255,255,255,0.03)" } : {}}
                disabled={plan.name === "Free"}
              >
                {plan.cta}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Token packs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto"
      >
        <h2 className="text-2xl font-extrabold text-center mb-6 tracking-tight">Just Need More Tokens?</h2>
        <div className="grid grid-cols-3 gap-4">
          {TOKEN_PACKS.map((pack) => (
            <div
              key={pack.label}
              className={`rounded-2xl p-5 text-center border transition-all duration-200 hover:scale-105 hover:-translate-y-1 cursor-pointer ${
                pack.popular ? "border-blue-500/35 shadow-glow" : "border-white/7"
              }`}
              style={{ background: "rgba(18,18,28,0.85)" }}
            >
              {pack.popular && (
                <div className="text-xs text-[#60a5fa] font-bold mb-2">BEST VALUE</div>
              )}
              <div className="flex items-center justify-center gap-1 mb-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-2xl font-extrabold">{pack.amount}</span>
              </div>
              <div className="text-sm text-white/42 mb-3">{pack.label}</div>
              <div className="text-2xl font-extrabold text-[#60a5fa] mb-3">{pack.price}</div>
              <button
                className="w-full py-2 rounded-lg text-sm font-bold border border-white/10 hover:border-blue-500/35 transition-colors"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                Buy Tokens
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-white/25 mt-4">
          <Shield className="inline w-3 h-3 mr-1" />
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </motion.div>
    </div>
  );
}
