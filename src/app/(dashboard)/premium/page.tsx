"use client";

import { motion } from "framer-motion";
import { Crown, Check, Zap, Star, Shield, Coins } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    tokens: "10 tokens",
    color: "border-white/10",
    badge: "",
    icon: Zap,
    iconColor: "text-white/60",
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
    color: "border-brand-500/50 shadow-glow",
    badge: "MOST POPULAR",
    icon: Star,
    iconColor: "text-brand-400",
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
    color: "border-yellow-500/30",
    badge: "BEST VALUE",
    icon: Crown,
    iconColor: "text-yellow-400",
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
        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-yellow-400 mb-6 border border-yellow-500/30">
          <Crown className="w-4 h-4" /> Upgrade your plan
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-3">Choose Your Plan</h1>
        <p className="text-white/50 text-lg">Unlock the full power of AI document generation</p>
      </motion.div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass rounded-2xl p-6 border ${plan.color} relative`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="btn-glow px-4 py-1 rounded-full text-xs font-bold text-white">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <plan.icon className={`w-5 h-5 ${plan.iconColor}`} />
              <span className="font-bold text-lg">{plan.name}</span>
            </div>

            <div className="mb-1">
              <span className="text-4xl font-black">{plan.price}</span>
              <span className="text-white/40 text-sm">{plan.period}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-brand-400 mb-6">
              <Coins className="w-3.5 h-3.5" />
              {plan.tokens}
            </div>

            <ul className="space-y-2.5 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
              {plan.disabled.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/25 line-through">
                  <Check className="w-4 h-4 text-white/20 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                plan.name === "Pro"
                  ? "btn-glow text-white"
                  : plan.name === "Free"
                  ? "glass border border-white/10 text-white/40 cursor-default"
                  : "glass border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              }`}
              disabled={plan.name === "Free"}
            >
              {plan.cta}
            </button>
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
        <h2 className="text-2xl font-bold text-center mb-6">Just Need More Tokens?</h2>
        <div className="grid grid-cols-3 gap-4">
          {TOKEN_PACKS.map((pack) => (
            <div
              key={pack.label}
              className={`glass rounded-2xl p-5 text-center border transition-all duration-200 hover:scale-105 cursor-pointer ${
                pack.popular ? "border-brand-500/40 shadow-glow" : "border-white/10"
              }`}
            >
              {pack.popular && (
                <div className="text-xs text-brand-400 font-bold mb-2">BEST VALUE</div>
              )}
              <div className="flex items-center justify-center gap-1 mb-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-2xl font-black">{pack.amount}</span>
              </div>
              <div className="text-sm text-white/50 mb-3">{pack.label}</div>
              <div className="text-2xl font-black text-brand-400 mb-3">{pack.price}</div>
              <button className="w-full glass py-2 rounded-lg text-sm font-semibold border border-white/10 hover:border-brand-500/40 transition-colors">
                Buy Tokens
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-white/30 mt-4">
          <Shield className="inline w-3 h-3 mr-1" />
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </motion.div>
    </div>
  );
}
