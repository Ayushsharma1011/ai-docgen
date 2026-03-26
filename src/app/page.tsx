"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Download,
  File,
  FileText,
  Globe,
  Presentation,
  Shield,
  Sheet,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import AuthStatus from "@/components/AuthStatus";

const documentTypes = [
  {
    icon: File,
    title: "PDF reports",
    description: "Executive-ready reports with clean structure and strong formatting.",
    gradient: "from-rose-500 to-orange-400",
  },
  {
    icon: FileText,
    title: "Word docs",
    description: "Editable proposals, resumes, letters, and polished internal docs.",
    gradient: "from-sky-500 to-cyan-400",
  },
  {
    icon: Presentation,
    title: "Slide decks",
    description: "Presentation-ready outlines and talking points for your next pitch.",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: Sheet,
    title: "Excel sheets",
    description: "Structured spreadsheets with tables and chart-friendly data.",
    gradient: "from-emerald-500 to-teal-400",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "Prompt to first draft",
    description: "Turn a rough idea into a usable document in seconds, not hours.",
  },
  {
    icon: Zap,
    title: "Fast editing workflow",
    description: "Generate, refine, rewrite, and export from one focused workspace.",
  },
  {
    icon: Shield,
    title: "Server-side AI calls",
    description: "Sensitive keys stay on the backend with clearer failure handling.",
  },
  {
    icon: Globe,
    title: "Template-first flows",
    description: "Start from proven document structures instead of a blank page.",
  },
  {
    icon: Download,
    title: "Multi-format export",
    description: "Download as PDF, Word, PowerPoint, or Excel from the same content.",
  },
  {
    icon: Star,
    title: "History and sharing",
    description: "Keep versions, continue drafts, and share work without losing context.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose the output",
    description: "Start with a document type or a template that fits your workflow.",
  },
  {
    number: "02",
    title: "Describe what you need",
    description: "Add the topic, instructions, tone, and any extra requirements.",
  },
  {
    number: "03",
    title: "Refine and export",
    description: "Edit the draft, apply AI actions, save it, then export the final file.",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Best for trying the workflow and creating a few core documents.",
    cta: "Start free",
    featured: false,
    features: ["10 generations each month", "PDF and Word exports", "Core templates", "Document history"],
  },
  {
    name: "Pro",
    price: "₹500",
    description: "For professionals who need more formats, more AI, and faster output.",
    cta: "Upgrade to Pro",
    featured: true,
    features: ["100 generations each month", "All 4 file formats", "AI rewrite actions", "Share links and versions"],
  },
  {
    name: "Premium",
    price: "₹1000",
    description: "For teams or high-volume creators who want the most flexibility.",
    cta: "Go Premium",
    featured: false,
    features: ["Unlimited generations", "Advanced templates", "Priority processing", "Custom workflows"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.12),transparent_22%)]" />

      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#07070f]/45 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#7c3aed)] shadow-[0_12px_40px_rgba(37,99,235,0.35)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">DocGenius AI</p>
              <p className="text-xs text-white/40">AI document workspace</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-white/55 lg:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#workflow" className="transition-colors hover:text-white">Workflow</a>
            <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <AuthStatus variant="landing" />
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-6 pb-20 pt-16 md:px-8 md:pt-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Better docs, less busywork
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.04]"
              >
                Create polished documents with an interface that actually feels usable.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 max-w-2xl text-base leading-7 text-white/55 md:text-lg"
              >
                Go from prompt to draft, refine with AI, save versions, and export in multiple formats from one clean workflow.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/signup"
                  className="glass-button glass-button-primary inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-[#020617]"
                  style={{ color: "#020617" }}
                >
                  <Sparkles className="h-4 w-4 text-[#020617]" />
                  Start for free
                  <ArrowRight className="h-4 w-4 text-[#020617]" />
                </Link>
                <Link
                  href="/dashboard"
                  className="glass-button inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white"
                >
                  View dashboard
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-10 grid gap-3 sm:grid-cols-3"
              >
                {[
                  { value: "4", label: "export formats" },
                  { value: "AI", label: "rewrite actions" },
                  { value: "Fast", label: "editor workflow" },
                ].map((item) => (
                  <div key={item.label} className="glass-panel rounded-2xl p-4">
                    <p className="text-2xl font-semibold">{item.value}</p>
                    <p className="mt-1 text-sm text-white/45">{item.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-[34px] bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(124,58,237,0.12))] blur-2xl" />
              <div className="glass-shell relative rounded-[34px] p-5">
                <div className="glass-panel mb-5 flex items-center justify-between rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Document workspace</p>
                    <p className="text-xs text-white/40">Prompt, edit, save, export</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Live workflow
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="glass-panel rounded-[26px] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Generator</p>
                    <div className="mt-4 space-y-3">
                      {["Format: Word", "Tone: Professional", "Topic: Investor update"].map((row) => (
                        <div key={row} className="glass-panel rounded-2xl px-4 py-3 text-sm text-white/70">
                          {row}
                        </div>
                      ))}
                      <div className="glass-panel rounded-2xl border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
                        Generate with AI
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-[26px] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Q2 Investor Update</p>
                        <p className="text-xs text-white/40">Ready to edit and export</p>
                      </div>
                      <span className="glass-panel rounded-full px-3 py-1 text-xs text-white/55">
                        Word
                      </span>
                    </div>
                    <div className="glass-panel mt-4 space-y-3 rounded-[22px] p-4">
                      <p className="text-lg font-semibold">Executive Summary</p>
                      <p className="text-sm leading-7 text-white/55">
                        Revenue grew steadily this quarter, led by stronger retention, faster onboarding, and improved operating efficiency.
                      </p>
                      <ul className="space-y-2 text-sm text-white/60">
                        <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-blue-300" /> Revenue up 18% quarter over quarter</li>
                        <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-blue-300" /> New enterprise pipeline ahead of plan</li>
                        <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-blue-300" /> Hiring focused on product and customer success</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-white/8 bg-white/[0.02] px-6 py-6 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 text-sm text-white/45">
            <span className="font-medium text-white/65">Built for:</span>
            {["Reports", "Resumes", "Decks", "Proposals", "Internal docs", "Spreadsheets"].map((item) => (
              <span key={item} className="glass-panel rounded-full px-3 py-2">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section id="features" className="px-6 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200/80">Features</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">A cleaner product flow from idea to finished file.</h2>
              <p className="mt-4 text-base leading-7 text-white/50">
                The app should help you move quickly, not force you to wrestle with the interface.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-panel rounded-[28px] p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-200">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/50">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 md:px-8">
          <div className="glass-shell mx-auto max-w-7xl rounded-[34px] p-6 md:p-8">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/80">Formats</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">One interface, four output types.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {documentTypes.map((type) => (
                <div key={type.title} className="glass-panel rounded-[26px] p-5">
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br ${type.gradient}`}>
                    <type.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{type.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/50">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="px-6 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200/80">Workflow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Simple enough to learn fast, strong enough to use daily.</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="glass-panel rounded-[28px] p-6"
                >
                  <p className="text-4xl font-semibold text-white/18">{step.number}</p>
                  <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/50">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-6 pb-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200/80">Pricing</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Start small and upgrade when the workflow clicks.</h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`glass-panel rounded-[30px] p-6 ${
                    plan.featured
                      ? "border-blue-500/35 bg-[linear-gradient(180deg,rgba(37,99,235,0.16),rgba(12,18,34,0.95))] shadow-[0_24px_60px_rgba(37,99,235,0.18)]"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/50">{plan.description}</p>
                    </div>
                    {plan.featured && (
                      <span className="glass-panel rounded-full border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="mt-6 text-4xl font-semibold">{plan.price}<span className="ml-1 text-sm text-white/35">/mo</span></div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-white/65">
                        <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`glass-button mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
                      plan.featured
                        ? "glass-button-primary text-[#020617]"
                        : "text-white"
                    }`}
                    style={plan.featured ? { color: "#020617" } : undefined}
                  >
                    {plan.featured && <Sparkles className="h-4 w-4 text-[#020617]" />}
                    {plan.cta}
                    <ArrowRight className={`h-4 w-4 ${plan.featured ? "text-[#020617]" : "text-white"}`} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/8 px-6 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#7c3aed)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-white/75">DocGenius AI</p>
              <p>AI-powered document workspace</p>
            </div>
          </div>
          <p>Built for cleaner document creation, editing, and export.</p>
        </div>
      </footer>
    </div>
  );
}
