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
    <div className="min-h-screen bg-[#070710] text-white selection:bg-brand-500/30">
      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full z-50 bg-[#070710]/80 backdrop-blur-xl border-b border-white/[0.08] transition-all"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">DocGenius <span className="text-brand-400">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-white text-black text-sm px-6 py-2.5 rounded-full font-bold hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none opacity-50" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(92,124,250,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(92,124,250,0.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px"
          }}
        />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-medium text-brand-300 mb-10 border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-brand-400" />
            Powered by GPT-4o — Generate docs in &lt;30 seconds
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.1] mb-8"
          >
            Create Professional
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-violet-400 to-pink-400">
              Documents with AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Generate high-quality PDFs, Word documents, PowerPoint presentations, and Excel
            spreadsheets in seconds. Just describe what you need.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link
              href="/signup"
              className="bg-white text-black px-10 py-4 rounded-full font-bold flex items-center gap-3 text-lg hover:bg-white/90 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            >
              Start Generating Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 rounded-full font-bold text-white/80 hover:text-white hover:bg-white/5 transition-all border border-white/10"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Doc type badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {DOC_TYPES.map((type, i) => (
              <motion.div
                key={type.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-[#12121a]/80 backdrop-blur-sm rounded-3xl p-8 text-center hover:bg-[#1a1a24] transition-all duration-300 border border-white/5 hover:border-white/10 flex flex-col items-center group shadow-2xl shadow-black/50"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <type.icon className="w-7 h-7 text-white" />
                </div>
                <div className="font-bold text-xl mb-3">{type.label}</div>
                <div className="text-base text-white/50 leading-relaxed font-medium">{type.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 relative border-t border-white/5 bg-[#0a0a14]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Everything You Need to <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-violet-400">Create Better Docs</span>
            </h2>
            <p className="text-white/50 text-xl font-medium max-w-2xl mx-auto">
              A complete AI-powered document suite right in your browser.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-[#12121a]/50 backdrop-blur-sm rounded-3xl p-10 border border-white/5 hover:border-white/10 hover:bg-[#1a1a24]/80 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 ${f.color}`}>
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-2xl mb-4">{f.title}</h3>
                <p className="text-white/50 text-lg leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Three Steps to a <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Perfect Document</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-16">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center group"
              >
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-600/20 to-violet-600/20 border border-white/10 flex items-center justify-center mx-auto mb-10 group-hover:scale-110 group-hover:bg-brand-500/20 transition-all duration-300">
                  <span className="text-4xl font-black text-brand-400">{s.n}</span>
                </div>
                <h3 className="text-3xl font-bold mb-5">{s.title}</h3>
                <p className="text-white/50 text-xl leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 border-t border-white/5 bg-[#0a0a14]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Simple, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Transparent Pricing</span>
            </h2>
            <p className="text-white/50 text-xl font-medium">Start free, upgrade when you need more power</p>
          </motion.div>
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className={`bg-[#12121a] rounded-[2rem] p-10 relative border flex flex-col transition-all duration-300 ${plan.popular ? "border-brand-500 shadow-[0_0_40px_rgba(92,124,250,0.2)] lg:scale-105 z-10 lg:-mx-4" : "border-white/5 h-full"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-500 px-6 py-2 rounded-full text-xs font-bold text-white tracking-widest uppercase shadow-lg shadow-brand-500/25">MOST POPULAR</span>
                  </div>
                )}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-8 shadow-lg`}>
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-6xl font-black">{plan.price}</span>
                  <span className="text-xl text-white/40 font-medium">/mo</span>
                </div>
                <div className="text-base font-bold text-brand-400 mb-10">{plan.tokenCount}</div>
                <ul className="space-y-5 mb-12 flex-grow">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-4 text-white/70 font-medium">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-lg">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`w-full block text-center py-5 rounded-xl font-bold transition-all duration-300 text-lg ${
                    plan.popular ? "bg-white text-black hover:bg-white/90 shadow-xl" : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
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
      <section className="py-32 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center bg-[#12121a]/80 backdrop-blur-xl rounded-[3rem] p-16 border border-brand-500/20 shadow-[0_0_80px_rgba(92,124,250,0.15)] relative z-10"
        >
          <Sparkles className="w-16 h-16 text-brand-400 mx-auto mb-6" />
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">Ready to Create?</h2>
          <p className="text-white/50 mb-10 text-2xl max-w-2xl mx-auto font-medium">Join thousands of professionals using AI to create better documents, faster.</p>
          <Link href="/signup" className="bg-white text-black inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-xl hover:bg-white/90 hover:scale-105 transition-all shadow-2xl shadow-white/10">
            Start for Free <ArrowRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 text-center text-white/40 text-sm bg-[#070710]">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <span className="font-extrabold text-white/60 text-lg tracking-tight">DocGenius AI</span>
        </div>
        <p className="font-medium">© 2026 DocGenius AI. Built with Next.js + GPT-4o.</p>
      </footer>
    </div>
  );
}
