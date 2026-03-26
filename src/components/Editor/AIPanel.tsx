"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Lightbulb, RefreshCw, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface AIPanelProps {
  suggestions: string[];
  selectedText: string;
  onRewrite: (action: "rewrite" | "expand" | "summarize" | "simplify" | "improve") => Promise<void>;
}

const AI_ACTIONS = [
  { id: "improve" as const, label: "Improve writing", desc: "Tighten grammar, tone, and flow." },
  { id: "expand" as const, label: "Expand", desc: "Add detail, context, and supporting points." },
  { id: "summarize" as const, label: "Summarize", desc: "Turn the selection into a shorter version." },
  { id: "rewrite" as const, label: "Rewrite", desc: "Create a fresh version with the same meaning." },
  { id: "simplify" as const, label: "Simplify", desc: "Make the writing easier to scan and understand." },
];

export default function AIPanel({ suggestions, selectedText, onRewrite }: AIPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  async function handleAction(action: "rewrite" | "expand" | "summarize" | "simplify" | "improve") {
    if (!selectedText) {
      toast.warning("Select text in the editor first.");
      return;
    }

    setLoading(action);
    try {
      await onRewrite(action);
    } finally {
      setLoading(null);
    }
  }

  async function copySuggestion(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success("Suggestion copied");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/7 px-4 py-4">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-300" />
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
        <p className="text-xs text-white/45">Use a text selection to rewrite, expand, or simplify content.</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div className="rounded-2xl border border-white/7 bg-white/[0.03] p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Selection</p>
          <p className={`text-sm leading-6 ${selectedText ? "text-white/80" : "text-white/35"}`}>
            {selectedText || "Highlight a paragraph or sentence in the editor to unlock AI actions."}
          </p>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Actions</p>
          <div className="space-y-2">
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleAction(action.id)}
                disabled={loading !== null || !selectedText}
                className="w-full rounded-2xl border border-white/7 bg-white/[0.03] px-3 py-3 text-left transition-all hover:border-blue-500/25 hover:bg-blue-500/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{action.label}</span>
                  {loading === action.id && <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-300" />}
                </div>
                <p className="mt-1 text-xs leading-5 text-white/45">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowSuggestions((value) => !value)}
            className="mb-2 flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5" />
              Suggestions
            </span>
            {showSuggestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <AnimatePresence initial={false}>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {suggestions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/35">
                    Generate a document to receive AI suggestions here.
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <div key={`${suggestion}-${index}`} className="rounded-2xl border border-white/7 bg-white/[0.03] p-3">
                      <p className="text-sm leading-6 text-white/75">{suggestion}</p>
                      <button
                        type="button"
                        onClick={() => copySuggestion(suggestion)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 transition-colors hover:text-blue-200"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </button>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
