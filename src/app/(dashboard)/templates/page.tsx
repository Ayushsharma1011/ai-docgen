"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Lock, FileText, Presentation, Sheet, File, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Template } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  Business: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  Academic: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  Career: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  Finance: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
  Analytics: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  HR: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30",
  Marketing: "from-orange-500/20 to-red-500/20 border-orange-500/30",
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black mb-1">Templates</h1>
        <p className="text-white/50">Start from a pre-built template. Just fill in your details.</p>
      </motion.div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
              filter === cat
                ? "bg-brand-600/20 border-brand-500/50 text-brand-300"
                : "glass border-white/10 text-white/60 hover:border-white/20 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-44 shimmer border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tpl, i) => {
            const Icon = DOC_ICONS[tpl.doc_type] || FileText;
            const locked = tpl.is_premium && userPlan === "free";
            const colorClass = CATEGORY_COLORS[tpl.category] || "from-slate-500/20 to-slate-600/20 border-slate-500/30";

            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: locked ? 1 : 1.02 }}
                className={`glass rounded-2xl p-5 border ${colorClass} relative group`}
              >
                {locked && (
                  <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                      <span className="text-xs text-yellow-400 font-semibold">Pro / Premium</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-white/60" />
                    <span className="text-xs uppercase tracking-wide text-white/40 font-medium">{tpl.doc_type}</span>
                  </div>
                  <span className="text-xs glass px-2 py-0.5 rounded-full border border-white/10 text-white/40">{tpl.category}</span>
                </div>

                <h3 className="font-bold text-base mb-2">{tpl.name}</h3>
                <p className="text-sm text-white/50 mb-4 line-clamp-2">{tpl.description}</p>

                <Link
                  href={locked ? "/premium" : `/editor?type=${tpl.doc_type}&template=${tpl.id}`}
                  className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors font-medium"
                >
                  {locked ? "Upgrade to use" : "Use template"} <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-white/40">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No templates in this category yet.</p>
        </div>
      )}
    </div>
  );
}
