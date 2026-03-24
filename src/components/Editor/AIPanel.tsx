"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, RefreshCw, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface AIPanel {
  suggestions: string[];
  selectedText: string;
  onRewrite: (action: "rewrite" | "expand" | "summarize" | "simplify" | "improve") => Promise<void>;
}

const AI_ACTIONS = [
  { id: "improve" as const, label: "✨ Improve Writing", desc: "Enhance grammar and flow" },
  { id: "expand" as const, label: "📖 Expand", desc: "Add more detail" },
  { id: "summarize" as const, label: "🔍 Summarize", desc: "Make it concise" },
  { id: "rewrite" as const, label: "🔄 Rewrite", desc: "Fresh perspective" },
  { id: "simplify" as const, label: "💡 Simplify", desc: "Easier language" },
];

export default function AIPanel({ suggestions, selectedText, onRewrite }: AIPanel) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  async function handleAction(action: "rewrite" | "expand" | "summarize" | "simplify" | "improve") {
    if (!selectedText) {
      toast.warning("Select some text first to use AI actions");
      return;
    }
    setLoading(action);
    try {
      await onRewrite(action);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/7">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#60a5fa]" />
          <span className="font-bold text-sm">AI Assistant</span>
        </div>
        <p className="text-xs text-white/35">Select text to use AI actions</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Selected text indicator */}
        {selectedText && (
          <div className="rounded-xl p-3 border border-blue-500/20" style={{ background: "rgba(37,99,235,0.06)" }}>
            <p className="text-xs text-[#60a5fa] mb-1 font-medium">Selected text:</p>
            <p className="text-xs text-white/60 line-clamp-3">{selectedText}</p>
          </div>
        )}

        {/* AI Actions */}
        <div>
          <p className="text-xs text-white/35 mb-2 px-1 font-medium">AI Actions</p>
          <div className="space-y-1">
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                disabled={loading !== null || !selectedText}
                className="w-full text-left px-3 py-2.5 rounded-xl border border-white/7 hover:border-blue-500/25 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
                style={{ background: "rgba(18,18,28,0.7)" }}
                aria-label={action.label}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{action.label}</span>
                  {loading === action.id && <RefreshCw className="w-3 h-3 animate-spin text-[#60a5fa]" />}
                </div>
                <p className="text-xs text-white/35 mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center justify-between w-full text-xs text-white/35 mb-2 px-1 font-medium"
              aria-label="Toggle AI suggestions"
            >
              <span className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> AI Suggestions ({suggestions.length})
              </span>
              {showSuggestions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-3 border border-white/7 text-xs text-white/60 leading-relaxed"
                      style={{ background: "rgba(18,18,28,0.7)" }}
                      role="listitem"
                    >
                      {s}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
