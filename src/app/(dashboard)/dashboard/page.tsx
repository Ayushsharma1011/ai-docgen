"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Coins,
  Crown,
  File,
  FilePlus,
  FileText,
  Presentation,
  Sheet,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/types";
import { DOC_TYPE_ICONS, DOC_TYPE_LABELS, formatDate } from "@/lib/utils";

const QUICK_CREATE = [
  { label: "PDF Report", icon: File, grad: "linear-gradient(135deg,#ef4444,#f97316)", type: "pdf" },
  { label: "Word Doc", icon: FileText, grad: "linear-gradient(135deg,#3b82f6,#06b6d4)", type: "docx" },
  { label: "PowerPoint", icon: Presentation, grad: "linear-gradient(135deg,#8b5cf6,#a855f7)", type: "pptx" },
  { label: "Excel Sheet", icon: Sheet, grad: "linear-gradient(135deg,#10b981,#14b8a6)", type: "xlsx" },
];

export default function DashboardPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [dashboardLoadedAt] = useState(() => Date.now());

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [docsResult, tokenResult, profileResult] = await Promise.all([
        supabase.from("documents").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(6),
        supabase.from("tokens").select("balance").eq("user_id", user.id).single(),
        supabase.from("users").select("full_name, plan").eq("id", user.id).single(),
      ]);

      setDocs(docsResult.data || []);
      setTokens(tokenResult.data?.balance ?? 0);
      setUserName(profileResult.data?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there");
      setLoading(false);
    }

    load();
  }, []);

  const documentsThisMonth = useMemo(() => {
    const thirtyDaysAgo = new Date(dashboardLoadedAt - 30 * 86400000);
    return docs.filter((doc) => new Date(doc.created_at) > thirtyDaysAgo).length;
  }, [dashboardLoadedAt, docs]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_30%),linear-gradient(135deg,#111827_0%,#0b1220_55%,#07070f_100%)] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                <Sparkles className="h-3.5 w-3.5" />
                Workspace overview
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Welcome back, {userName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 md:text-base">
                Your dashboard is ready. Start a new document, continue recent work, or jump into templates to move faster.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
              <Link
                href="/editor"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm font-semibold text-[#020617] transition-opacity hover:opacity-90"
                style={{ color: "#020617" }}
              >
                <FilePlus className="h-4 w-4" />
                New document
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]"
              >
                Browse templates
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: "Total documents", value: docs.length, icon: FileText, iconBg: "rgba(59,130,246,0.12)", iconColor: "#60a5fa" },
          { label: "Token balance", value: tokens, icon: Coins, iconBg: "rgba(234,179,8,0.12)", iconColor: "#facc15" },
          { label: "Created this month", value: documentsThisMonth, icon: TrendingUp, iconBg: "rgba(16,185,129,0.12)", iconColor: "#34d399" },
          { label: "Upgrade options", value: "Pro", icon: Crown, iconBg: "rgba(245,158,11,0.12)", iconColor: "#fbbf24" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: stat.iconBg }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
            </div>
            <div className="text-2xl font-semibold">{stat.value}</div>
            <div className="mt-1 text-sm text-white/45">{stat.label}</div>
          </div>
        ))}
      </motion.section>

      <div className="mb-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Quick create</h2>
              <p className="mt-1 text-sm text-white/45">Start a new file in the format you need most.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {QUICK_CREATE.map((item) => (
              <motion.div key={item.type} whileHover={{ y: -4 }}>
                <Link
                  href={`/editor?type=${item.type}`}
                  className="flex h-full flex-col rounded-[24px] border border-white/10 bg-[#0f1726] p-5 transition-colors hover:border-white/20"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[18px]" style={{ background: item.grad }}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-blue-300">
                    Start now <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6"
        >
          <h2 className="text-xl font-semibold">Next best actions</h2>
          <div className="mt-5 space-y-3">
            <Link href="/history" className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
              <p className="text-sm font-semibold">Review saved drafts</p>
              <p className="mt-1 text-sm text-white/45">Re-open recent documents and continue editing.</p>
            </Link>
            <Link href="/premium" className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
              <p className="text-sm font-semibold">Get more tokens</p>
              <p className="mt-1 text-sm text-white/45">Unlock PowerPoint, Excel, and more AI capacity.</p>
            </Link>
            <Link href="/templates" className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
              <p className="text-sm font-semibold">Use a template</p>
              <p className="mt-1 text-sm text-white/45">Start with a structured prompt instead of a blank page.</p>
            </Link>
          </div>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent documents</h2>
            <p className="mt-1 text-sm text-white/45">Pick up where you left off.</p>
          </div>
          <Link href="/history" className="inline-flex items-center gap-1 text-sm font-medium text-blue-300 transition-colors hover:text-blue-200">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,18,28,0.92),rgba(28,39,63,0.78))]" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-white/20" />
            <h3 className="text-lg font-semibold">No documents yet</h3>
            <p className="mt-2 text-sm text-white/45">Create your first AI-powered document to see it here.</p>
            <Link
              href="/editor"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm font-semibold text-[#020617] transition-opacity hover:opacity-90"
              style={{ color: "#020617" }}
            >
              <FilePlus className="h-4 w-4" />
              Create document
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {docs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 + index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={`/editor/${doc.id}`}
                  className="block rounded-[24px] border border-white/10 bg-[#101522] p-5 transition-colors hover:border-blue-500/25"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="text-2xl">{DOC_TYPE_ICONS[doc.doc_type]}</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-white/45">
                      {DOC_TYPE_LABELS[doc.doc_type]}
                    </span>
                  </div>
                  <h3 className="line-clamp-1 text-base font-semibold">{doc.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-white/45">{doc.topic}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-white/30">
                    <Clock className="h-3.5 w-3.5" />
                    Updated {formatDate(doc.updated_at)}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
