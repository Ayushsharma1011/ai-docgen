"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FilePlus, FileText, Presentation, Sheet, File, Clock, TrendingUp, Coins, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Document } from "@/types";
import { formatDate, DOC_TYPE_ICONS, DOC_TYPE_LABELS } from "@/lib/utils";

const QUICK_CREATE = [
  { label: "PDF Report", icon: File, color: "from-red-500/20 to-orange-500/20 border-red-500/30", type: "pdf" },
  { label: "Word Doc", icon: FileText, color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30", type: "docx" },
  { label: "PowerPoint", icon: Presentation, color: "from-violet-500/20 to-purple-500/20 border-violet-500/30", type: "pptx" },
  { label: "Excel Sheet", icon: Sheet, color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30", type: "xlsx" },
];

export default function DashboardPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: docsData }, { data: tokenData }] = await Promise.all([
        supabase.from("documents").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(6),
        supabase.from("tokens").select("balance").eq("user_id", user.id).single(),
      ]);

      setDocs(docsData || []);
      setTokens(tokenData?.balance ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  const now = new Date();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black mb-1">Dashboard</h1>
        <p className="text-white/50">Create, manage, and download your AI-generated documents.</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
      >
        {[
          { label: "Total Documents", value: docs.length, icon: FileText, color: "text-brand-400" },
          { label: "Token Balance", value: tokens, icon: Coins, color: "text-yellow-400" },
          { label: "This Month", value: docs.filter(d => new Date(d.created_at) > new Date(now.getTime() - 30 * 86400000)).length, icon: TrendingUp, color: "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5 border border-white/5">
            <div className={`${stat.color} mb-2`}><stat.icon className="w-5 h-5" /></div>
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-xs text-white/50 mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Quick Create */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-lg font-bold mb-4">Quick Create</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_CREATE.map((item, i) => (
            <motion.div key={item.type} whileHover={{ scale: 1.03, y: -2 }}>
              <Link
                href={`/editor?type=${item.type}`}
                className={`glass rounded-2xl p-5 flex flex-col items-center gap-3 border ${item.color} hover:shadow-glow transition-all duration-300 group`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold">{item.label}</span>
                <FilePlus className="w-4 h-4 text-white/30 group-hover:text-brand-400 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recent Documents</h2>
          <Link href="/history" className="text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className="glass rounded-2xl p-5 h-32 shimmer border border-white/5" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-white/5">
            <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 mb-4">No documents yet. Create your first one!</p>
            <Link href="/editor" className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white">
              <FilePlus className="w-4 h-4" /> Create Document
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link
                  href={`/editor/${doc.id}`}
                  className="glass rounded-2xl p-5 border border-white/5 hover:border-brand-500/20 transition-all duration-300 block group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{DOC_TYPE_ICONS[doc.doc_type]}</span>
                    <span className="text-xs glass px-2 py-1 rounded-full border border-white/10 text-white/50 uppercase tracking-wide">
                      {DOC_TYPE_LABELS[doc.doc_type]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-brand-300 transition-colors line-clamp-1">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-white/40 line-clamp-2 mb-3">{doc.topic}</p>
                  <div className="flex items-center gap-1 text-xs text-white/30">
                    <Clock className="w-3 h-3" />
                    {formatDate(doc.updated_at)}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
