"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  sideTitle: string;
  sideCopy: string;
};

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  sideTitle,
  sideCopy,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070f] px-4 py-6 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(92,124,250,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(92,124,250,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(37,99,235,0.12)_0%,transparent_68%)]" />
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative hidden overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(9,14,24,0.96))] p-10 lg:block"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.14),transparent_22%)]" />
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#7c3aed)] shadow-[0_10px_30px_rgba(37,99,235,0.35)]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-base font-semibold">DocGenius AI</p>
                <p className="text-sm text-white/40">Modern document workflow</p>
              </div>
            </Link>

            <div className="mt-16 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200/80">Welcome</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">{sideTitle}</h2>
              <p className="mt-5 text-base leading-8 text-white/55">{sideCopy}</p>
            </div>

            <div className="mt-12 space-y-4">
              {[
                "Clean editor with save, share, and export actions",
                "Template-driven workflows for faster starts",
                "AI-powered generation with safer backend handling",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm leading-7 text-white/70">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative z-10 mx-auto w-full max-w-xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,32,0.96),rgba(10,14,24,0.98))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)] md:p-8"
        >
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#7c3aed)] shadow-[0_10px_30px_rgba(37,99,235,0.35)]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight">DocGenius AI</span>
            </Link>
            <h1 className="mt-8 text-3xl font-semibold tracking-tight text-white">{title}</h1>
            <p className="mt-3 text-sm leading-7 text-white/45">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 text-center text-sm text-white/45">{footer}</div>
        </motion.div>
      </div>
    </div>
  );
}
