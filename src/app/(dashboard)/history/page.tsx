"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Trash2, Clock, ExternalLink, Copy, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Document } from "@/types";
import { formatDate, DOC_TYPE_ICONS, DOC_TYPE_LABELS } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function HistoryPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadDocs = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadDocs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    setDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); }
    else { toast.success("Document deleted"); setDocs(docs.filter((d) => d.id !== id)); }
    setDeleting(null);
  }

  async function handleDuplicate(doc: Document) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("documents").insert({
      user_id: user.id,
      title: `${doc.title} (Copy)`,
      content: doc.content,
      doc_type: doc.doc_type,
      tone: doc.tone,
      topic: `${doc.topic} (Copy)`,
      instructions: doc.instructions,
    });
    if (error) { toast.error("Duplicate failed"); return; }
    toast.success("Document duplicated!");
    loadDocs();
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-extrabold mb-1 tracking-tight">History</h1>
        <p className="text-white/45">All your generated documents in one place.</p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl h-20 shimmer border border-white/7" style={{ background: "rgba(18,18,28,0.7)" }} />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-24 rounded-2xl border border-white/7" style={{ background: "rgba(18,18,28,0.7)" }}>
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/45 text-lg mb-2">No documents yet</p>
          <p className="text-white/25 text-sm">Create your first document from the editor</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-white/7 hover:border-white/14 transition-all duration-200 p-4 flex items-center gap-4 group"
              style={{ background: "rgba(18,18,28,0.92)" }}
            >
              <div className="text-2xl">{DOC_TYPE_ICONS[doc.doc_type]}</div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm mb-0.5 truncate">{doc.title}</h3>
                <p className="text-xs text-white/35 truncate">{doc.topic}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full border border-white/7 text-white/35 uppercase tracking-wide font-medium"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    {DOC_TYPE_LABELS[doc.doc_type]}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/25">
                    <Clock className="w-3 h-3" />
                    {formatDate(doc.updated_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/editor/${doc.id}`}
                  className="p-2 rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors"
                  title="Open"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <ExternalLink className="w-4 h-4 text-white/50" />
                </Link>
                <button
                  onClick={() => handleDuplicate(doc)}
                  className="p-2 rounded-lg border border-white/10 hover:border-emerald-500/30 transition-colors"
                  title="Duplicate"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <Copy className="w-4 h-4 text-white/50" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                  className="p-2 rounded-lg border border-white/10 hover:border-red-500/30 hover:text-red-400 transition-colors"
                  title="Delete"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  {deleting === doc.id
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4 text-white/50" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
