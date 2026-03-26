"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Lock, FileText, Presentation, Sheet, File, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Template } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  Business: "rgba(59,130,246,0.12)",
  Academic: "rgba(139,92,246,0.12)",
  Career: "rgba(16,185,129,0.12)",
  Finance: "rgba(234,179,8,0.12)",
  Analytics: "rgba(236,72,153,0.12)",
  HR: "rgba(99,102,241,0.12)",
  Marketing: "rgba(249,115,22,0.12)",
};

const CATEGORY_COLOR_TEXT: Record<string, string> = {
  Business: "#60a5fa",
  Academic: "#a78bfa",
  Career: "#34d399",
  Finance: "#facc15",
  Analytics: "#f472b6",
  HR: "#818cf8",
  Marketing: "#fb923c",
};

const DOC_ICONS: Record<string, React.ElementType> = {
  pdf: File,
  docx: FileText,
  pptx: Presentation,
  xlsx: Sheet,
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [userPlan, setUserPlan] = useState("free");

  const categories = ["All", "Business", "Academic", "Career", "Finance", "Analytics", "HR", "Marketing"];

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: tData }, { data: { user } }] = await Promise.all([
        supabase.from("templates").select("*").order("name"),
        supabase.auth.getUser(),
      ]);
      setTemplates(tData || []);
      if (user) {
        const { data } = await supabase.from("users").select("plan").eq("id", user.id).single();
        if (data) setUserPlan(data.plan);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === "All" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_28%),linear-gradient(135deg,#101827_0%,#0b1220_55%,#07070f_100%)] p-6 md:p-8">
        <h1 className="mb-1 text-3xl font-extrabold tracking-tight">Templates</h1>
        <p className="max-w-2xl text-white/45">Skip the blank-page feeling with ready-made structures for business docs, academic work, reports, and presentations.</p>
      </motion.div>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
              filter === cat
                ? "bg-blue-600/15 border-blue-500/30 text-[#60a5fa]"
                : "border-white/7 text-white/50 hover:border-white/14 hover:text-white"
            }`}
            style={filter !== cat ? { background: "rgba(18,18,28,0.7)" } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-white/7 bg-[linear-gradient(135deg,rgba(18,18,28,0.92),rgba(28,39,63,0.78))]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tpl, i) => {
            const Icon = DOC_ICONS[tpl.doc_type] || FileText;
            const locked = tpl.is_premium && userPlan === "free";
            const catBg = CATEGORY_COLORS[tpl.category] || "rgba(100,116,139,0.12)";
            const catColor = CATEGORY_COLOR_TEXT[tpl.category] || "#94a3b8";

            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: locked ? 1 : 1.02, y: locked ? 0 : -4 }}
                className="group relative rounded-[24px] border border-white/7 bg-[linear-gradient(135deg,rgba(18,18,28,0.92),rgba(15,23,38,0.95))] p-5 transition-all duration-200 hover:border-white/14"
              >
                {locked && (
                  <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center z-10 backdrop-blur-[2px]">
                    <div className="text-center">
                      <Lock className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                      <span className="text-xs text-yellow-400 font-bold">Pro / Premium</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: catBg }}>
                      <Icon style={{ width: 16, height: 16, color: catColor }} />
                    </div>
                    <span className="text-xs uppercase tracking-wide text-white/35 font-medium">{tpl.doc_type}</span>
                  </div>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full border border-white/7 text-white/35 font-medium"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    {tpl.category}
                  </span>
                </div>

                <h3 className="font-bold text-base mb-2">{tpl.name}</h3>
                <p className="text-sm text-white/42 mb-4 line-clamp-2">{tpl.description}</p>

                <Link
                  href={locked ? "/premium" : `/editor?type=${tpl.doc_type}&template=${tpl.id}`}
                  className="flex items-center gap-1 text-sm text-[#60a5fa] hover:text-[#93c5fd] transition-colors font-semibold"
                >
                  {locked ? "Upgrade to use" : "Use template"} <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-white/35">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No templates in this category yet.</p>
        </div>
      )}
    </div>
  );
}
