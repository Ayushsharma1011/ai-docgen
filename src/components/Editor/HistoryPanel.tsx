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
      <div className="p-4 text-center text-white/35 text-sm">
        Save the document first to view version history.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-t border-white/7 pt-4">
      <div className="px-4 mb-2 flex items-center gap-2">
        <History className="w-4 h-4 text-[#60a5fa]" />
        <span className="font-bold text-sm">Version History</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {loading ? (
          <div className="flex justify-center p-4">
            <RefreshCw className="w-4 h-4 animate-spin text-white/35" aria-label="Loading versions" />
          </div>
        ) : versions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center text-xs text-white/35">
            Save the document again after making edits to create a restore point.
          </div>
        ) : (
          versions.map((v) => (
            <div
              key={v.id}
              className="rounded-xl p-3 border border-white/7 flex flex-col gap-2"
              style={{ background: "rgba(18,18,28,0.7)" }}
              role="listitem"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/70">Version {v.version_number}</span>
                <span className="text-[10px] text-white/35">
                  {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                </span>
              </div>
              <button
                onClick={() => handleRestore(v.content)}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs transition-colors border border-white/7 hover:border-blue-500/25 hover:text-[#60a5fa] font-medium"
                style={{ background: "rgba(255,255,255,0.03)" }}
                aria-label={`Restore version ${v.version_number}`}
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
