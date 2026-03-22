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
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <p className="text-xs text-white/40">Select text to use AI actions</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Selected text indicator */}
        {selectedText && (
          <div className="glass rounded-xl p-3 border border-brand-500/20">
            <p className="text-xs text-brand-400 mb-1">Selected text:</p>
            <p className="text-xs text-white/70 line-clamp-3">{selectedText}</p>
          </div>
        )}

        {/* AI Actions */}
        <div>
          <p className="text-xs text-white/40 mb-2 px-1">AI Actions</p>
          <div className="space-y-1">
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                disabled={loading !== null || !selectedText}
                className="w-full text-left px-3 py-2.5 rounded-xl glass border border-white/5 hover:border-brand-500/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{action.label}</span>
                  {loading === action.id && <RefreshCw className="w-3 h-3 animate-spin text-brand-400" />}
                </div>
                <p className="text-xs text-white/40 mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center justify-between w-full text-xs text-white/40 mb-2 px-1"
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
                    <div key={i} className="glass rounded-xl p-3 border border-white/5 text-xs text-white/70 leading-relaxed">
                      <div className="flex items-start justify-between gap-2">
                        <p>{s}</p>
                        <button
                          onClick={() => { navigator.clipboard.writeText(s); toast.success("Copied!"); }}
                          className="flex-shrink-0 text-white/30 hover:text-white/70 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
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
