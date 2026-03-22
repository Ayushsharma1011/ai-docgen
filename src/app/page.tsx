"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Presentation,
  Sheet,
  File,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Download,
  Star,
  ArrowRight,
  Check,
} from "lucide-react";

const DOC_TYPES = [
  { icon: File, label: "PDF Reports", color: "from-red-500 to-orange-500", desc: "Professional reports with rich formatting" },
  { icon: FileText, label: "Word Docs", color: "from-blue-500 to-cyan-500", desc: "Editable documents with styling" },
  { icon: Presentation, label: "PowerPoint", color: "from-violet-500 to-purple-500", desc: "Stunning slide decks" },
  { icon: Sheet, label: "Excel Sheets", color: "from-emerald-500 to-teal-500", desc: "Data-rich spreadsheets with charts" },
];

const FEATURES = [
  { icon: Sparkles, title: "AI-Powered", desc: "GPT-4o generates publication-ready content in seconds", color: "text-brand-400" },
  { icon: Zap, title: "Instant Generation", desc: "From idea to download in under 30 seconds", color: "text-yellow-400" },
  { icon: Shield, title: "ATS Optimizer", desc: "Resume scoring and keyword optimization built-in", color: "text-emerald-400" },
  { icon: Globe, title: "12+ Templates", desc: "Business, academic, career, and creative templates", color: "text-violet-400" },
  { icon: Download, title: "4 File Formats", desc: "PDF, Word, PowerPoint, and Excel — all from one prompt", color: "text-pink-400" },
  { icon: Star, title: "Version History", desc: "Never lose work — restore any previous version", color: "text-orange-400" },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    tokenCount: "10 tokens/mo",
    color: "from-slate-500 to-slate-600",
    features: ["10 generations/month", "PDF & Word only", "5 templates", "Basic editor"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    tokenCount: "100 tokens/mo",
    color: "from-brand-600 to-violet-600",
    features: ["100 generations/month", "All 4 formats", "All templates", "Advanced editor", "Version history", "AI suggestions"],
    cta: "Start Pro",
    popular: true,
  },
  {
    name: "Premium",
    price: "$49",
    tokenCount: "Unlimited",
    color: "from-yellow-500 to-orange-500",
    features: ["Unlimited generations", "All 4 formats", "Custom templates", "AI Slides Designer", "ATS Optimizer", "Excel Charts", "Priority AI", "Share links"],
    cta: "Go Premium",
    popular: false,
  },
];

const STEPS = [
  { n: "01", title: "Describe Your Document", desc: "Enter your topic, tone, and any specific requirements." },
  { n: "02", title: "AI Generates Content", desc: "GPT-4o crafts structured, high-quality content instantly." },
  { n: "03", title: "Edit & Download", desc: "Refine in the rich editor, then download in your chosen format." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white overflow-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full z-50 glass border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg btn-glow flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">DocGenius <span className="gradient-text">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="btn-glow text-sm px-4 py-2 rounded-lg font-medium text-white"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 aurora-bg">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(92,124,250,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(92,124,250,0.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px"
          }}
        />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-brand-300 mb-8 border border-brand-500/30"
          >
            <Sparkles className="w-4 h-4" />
            Powered by GPT-4o — Generate docs in &lt;30 seconds
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-tight mb-6"
          >
            Create Professional
            <br />
            <span className="gradient-text">Documents with AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-10"
          >
            Generate high-quality PDFs, Word documents, PowerPoint presentations, and Excel
            spreadsheets in seconds. Just describe what you need.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="btn-glow px-8 py-4 rounded-xl font-semibold text-white flex items-center gap-2 text-lg"
            >
              Start Generating Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="glass px-8 py-4 rounded-xl font-semibold text-white/80 hover:text-white transition-colors border border-white/10"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Doc type badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {DOC_TYPES.map((type, i) => (
              <motion.div
                key={type.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="glass rounded-2xl p-5 text-center hover:border-brand-500/30 transition-all duration-300 border border-white/5"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center mx-auto mb-3`}>
                  <type.icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold text-sm mb-1">{type.label}</div>
                <div className="text-xs text-white/50">{type.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Create Better Docs</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              A complete AI-powered document suite in your browser
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 aurora-bg">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Three Steps to a <span className="gradient-text">Perfect Document</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl btn-glow flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-black">{s.n}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-white/60">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, <span className="gradient-text">Transparent Pricing</span></h2>
            <p className="text-white/60 text-lg">Start free, upgrade when you need more power</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className={`glass rounded-2xl p-8 relative border ${plan.popular ? "border-brand-500/50 shadow-glow" : "border-white/5"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="btn-glow px-4 py-1 rounded-full text-xs font-bold text-white">MOST POPULAR</span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                <div className="text-3xl font-black mb-1">
                  {plan.price}<span className="text-base font-normal text-white/50">/mo</span>
                </div>
                <div className="text-sm text-brand-400 mb-6">{plan.tokenCount}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`w-full block text-center py-3 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular ? "btn-glow text-white" : "glass border border-white/10 text-white/80 hover:text-white hover:border-white/20"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-brand-500/20 shadow-glow"
        >
          <Sparkles className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="text-4xl font-black mb-4">Ready to Create?</h2>
          <p className="text-white/60 mb-8 text-lg">Join thousands of professionals using AI to create better documents, faster.</p>
          <Link href="/signup" className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-lg">
            Start for Free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/40 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span className="font-bold text-white/60">DocGenius AI</span>
        </div>
        <p>© 2026 DocGenius AI. Built with Next.js + GPT-4o.</p>
      </footer>
    </div>
  );
}
