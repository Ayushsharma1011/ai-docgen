"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { History, RotateCcw, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/lib/store";

interface Version {
  id: string;
  document_id: string;
  content: string;
  version_number: number;
  created_at: string;
}

export default function HistoryPanel() {
  const { currentDoc, setEditorContent } = useEditorStore();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentDoc?.id) return;

    async function loadVersions() {
      setLoading(true);
      try {
        const res = await fetch(`/api/documents/${currentDoc?.id}/versions`);
        const data = await res.json();
        if (data.versions) {
          setVersions(data.versions);
        }
      } catch (err) {
        console.error("Failed to load versions", err);
      } finally {
        setLoading(false);
      }
    }

    loadVersions();
  }, [currentDoc?.id]);

  async function handleRestore(content: string) {
    if (confirm("Restore this version? Unsaved changes will be lost.")) {
      setEditorContent(content);
      toast.success("Version restored");
    }
  }

  if (!currentDoc?.id) {
    return (
      <div className="p-4 text-center text-white/40 text-sm">
        Save the document first to view version history.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-t border-white/5 pt-4">
      <div className="px-4 mb-2 flex items-center gap-2">
        <History className="w-4 h-4 text-brand-400" />
        <span className="font-semibold text-sm">Version History</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {loading ? (
          <div className="flex justify-center p-4">
            <RefreshCw className="w-4 h-4 animate-spin text-white/40" />
          </div>
        ) : versions.length === 0 ? (
          <p className="text-xs text-white/40 text-center">No versions saved yet.</p>
        ) : (
          versions.map((v) => (
            <div key={v.id} className="glass rounded-xl p-3 border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/80">Version {v.version_number}</span>
                <span className="text-[10px] text-white/40">
                  {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                </span>
              </div>
              <button
                onClick={() => handleRestore(v.content)}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-white/5 hover:bg-brand-500/20 text-xs transition-colors border border-white/5 hover:border-brand-500/30 hover:text-brand-300"
              >
                <RotateCcw className="w-3 h-3" />
                Restore
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
