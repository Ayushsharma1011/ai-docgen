"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  Sparkles, Download, Save, Mic, MicOff, RefreshCw,
  ChevronDown, Wand2, FileText, Presentation, Sheet, File, Share2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/lib/store";
import AIPanel from "@/components/Editor/AIPanel";
import HistoryPanel from "@/components/Editor/HistoryPanel";
import { DocumentType, DocumentTone } from "@/types";
import { DOC_TYPE_LABELS, TOKEN_COSTS, PREMIUM_FEATURES } from "@/lib/utils";

const TipTapEditor = dynamic(() => import("@/components/Editor/TipTapEditor"), { ssr: false });

const DOC_TYPES: { value: DocumentType; label: string; icon: React.ElementType; premium?: boolean }[] = [
  { value: "docx", label: "Word (.docx)", icon: FileText },
  { value: "pdf", label: "PDF", icon: File },
  { value: "pptx", label: "PowerPoint (.pptx)", icon: Presentation, premium: true },
  { value: "xlsx", label: "Excel (.xlsx)", icon: Sheet, premium: true },
];

const TONES: { value: DocumentTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "academic", label: "Academic" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "creative", label: "Creative" },
];

function EditorContent() {
  const searchParams = useSearchParams();
  const {
    topic, setTopic, instructions, setInstructions,
    requirements, setRequirements, docType, setDocType, tone, setTone,
    editorContent, setEditorContent, isGenerating, setIsGenerating,
    isSaving, setIsSaving, aiSuggestions, setAISuggestions,
  } = useEditorStore();

  const [selectedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [userPlan, setUserPlan] = useState("free");

  // Load doc type from URL
  useEffect(() => {
    const type = searchParams.get("type") as DocumentType;
    if (type) setDocType(type);
  }, [searchParams, setDocType]);

  // Load user plan
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("users").select("plan").eq("id", user.id).single().then(({ data }) => {
          if (data) setUserPlan(data.plan);
        });
      }
    });
  }, []);

  async function handleGenerate() {
    if (!topic.trim()) { toast.error("Please enter a topic"); return; }
    if (!instructions.trim()) { toast.error("Please enter instructions"); return; }

    if (PREMIUM_FEATURES.includes(docType) && userPlan === "free") {
      toast.error("PowerPoint and Excel generation requires Pro or Premium plan");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, instructions, docType, tone, requirements }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Generation failed"); return; }

      // Convert structured content to HTML for editor
      let html = `<h1>${data.content.title}</h1>`;
      if (data.content.sections) {
        for (const section of data.content.sections) {
          html += `<h2>${section.heading}</h2><p>${section.body}</p>`;
          if (section.bullets?.length) {
            html += `<ul>${section.bullets.map((b: string) => `<li>${b}</li>`).join("")}</ul>`;
          }
        }
      }
      setEditorContent(html);
      toast.success("Document generated! You can now edit and download.");

      // Get suggestions
      if (data.content.title) {
        fetchSuggestions(data.content.title);
      }
    } catch {
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  }

  async function fetchSuggestions(title: string) {
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: title, docType }),
      });
      const data = await res.json();
      if (data.suggestions) setAISuggestions(data.suggestions);
    } catch { /* silent */ }
  }

  async function handleRewrite(action: "rewrite" | "expand" | "summarize" | "simplify" | "improve") {
    if (!selectedText) return;
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText, action }),
      });
      const data = await res.json();
      if (data.result) {
        toast.success("Text updated! Replace selected text manually with the suggestion below.");
        setAISuggestions([data.result, ...aiSuggestions.slice(0, 4)]);
      }
    } catch {
      toast.error("Rewrite failed");
    }
  }

  const { currentDoc, setCurrentDoc } = useEditorStore();

  async function handleSave() {
    if (!editorContent) { toast.error("Nothing to save"); return; }
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Not logged in"); return; }

      const docData = {
        user_id: user.id,
        title: topic || "Untitled Document",
        content: editorContent,
        doc_type: docType,
        tone,
        topic,
        instructions,
      };

      let response;
      if (currentDoc?.id) {
        response = await supabase
          .from("documents")
          .update(docData)
          .eq("id", currentDoc.id)
          .select()
          .single();
      } else {
        response = await supabase
          .from("documents")
          .insert(docData)
          .select()
          .single();
      }

      const { data, error } = response;

      if (error) throw error;

      setCurrentDoc(data);

      // Save version history
      if (data?.id) {
        await fetch(`/api/documents/${data.id}/versions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editorContent }),
        });
      }

      toast.success("Document saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleShare() {
    if (!currentDoc?.id) { toast.error("Save the document first to share it"); return; }
    try {
      const res = await fetch(`/api/documents/${currentDoc.id}/share`, { method: "POST" });
      const data = await res.json();
      if (data.shareUrl) {
        await navigator.clipboard.writeText(data.shareUrl);
        toast.success("Share link copied to clipboard!");
      } else {
        toast.error(data.error || "Failed to generate share link");
      }
    } catch {
      toast.error("Share failed");
    }
  }

  async function handleDownload() {
    if (!editorContent) { toast.error("Generate content first"); return; }
    setIsDownloading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editorContent, topic, docType, tone }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success(`${DOC_TYPE_LABELS[docType]} downloaded!`);
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch {
      toast.error("Download failed — ensure Python microservice is running");
    } finally {
      setIsDownloading(false);
    }
  }

  function handleVoice() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTopic(topic + " " + transcript);
      setIsListening(false);
      toast.success("Voice captured!");
    };
    recognition.onerror = () => { setIsListening(false); toast.error("Voice recognition failed"); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel - Generation Form */}
      <div className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col overflow-y-auto bg-[#0f0f1a]">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-bold text-sm mb-0.5">AI Generator</h2>
          <p className="text-xs text-white/40">Describe your document</p>
        </div>

        <div className="p-4 space-y-4 flex-1">
          {/* Doc Type */}
          <div>
            <label className="block text-xs text-white/50 mb-2">Format</label>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setDocType(t.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                    docType === t.value
                      ? "bg-brand-600/20 border-brand-500/50 text-brand-300"
                      : "border-white/10 text-white/60 hover:border-white/20 hover:text-white glass"
                  } ${t.premium && userPlan === "free" ? "opacity-60" : ""}`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label.split(" ")[0]}</span>
                  {t.premium && userPlan === "free" && <span className="text-yellow-400 text-[10px]">✦</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-xs text-white/50 mb-2">Tone</label>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as DocumentTone)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm appearance-none outline-none focus:border-brand-500/50 transition-colors"
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#1a1a2e]">{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs text-white/50 mb-2">Topic / Title</label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Q4 Marketing Strategy"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pr-9 text-sm outline-none focus:border-brand-500/50 transition-colors placeholder:text-white/30"
              />
              <button
                onClick={handleVoice}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors ${
                  isListening ? "text-red-400 animate-pulse" : "text-white/30 hover:text-white/70"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs text-white/50 mb-2">Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe what you want in the document..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500/50 transition-colors resize-none placeholder:text-white/30"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-xs text-white/50 mb-2">Requirements (optional)</label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Include specific sections, data, or formatting..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500/50 transition-colors resize-none placeholder:text-white/30"
            />
          </div>

          {/* Token cost info */}
          <div className="glass rounded-xl p-3 border border-white/5 text-xs text-white/50">
            Cost: <span className="text-yellow-400 font-bold">{TOKEN_COSTS[docType]} tokens</span>
          </div>
        </div>

        {/* Generate button */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full btn-glow py-3 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Generate with AI</>
            )}
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0f0f1a]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <h1 className="text-sm font-semibold text-white/80">{topic || "New Document"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              disabled={!currentDoc?.id}
              className="glass px-3 py-2 rounded-lg text-sm font-medium border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-white/70 hover:text-white disabled:opacity-40"
              title="Generate shareable link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="glass px-4 py-2 rounded-lg text-sm font-medium border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-white/70 hover:text-white"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading || !editorContent}
              className="btn-glow px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Preparing..." : `Download ${DOC_TYPE_LABELS[docType]}`}
            </button>
          </div>
        </div>

        {/* TipTap Editor */}
        <div className="flex-1 overflow-hidden bg-[#0f0f1a]">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Sparkles className="w-10 h-10 text-brand-400 mx-auto mb-4" />
                </motion.div>
                <p className="text-white/60">Generating your document with GPT-4o...</p>
              </motion.div>
            </div>
          ) : (
            <TipTapEditor
              content={editorContent}
              onChange={setEditorContent}
              placeholder="Click 'Generate with AI' or start typing your document..."
            />
          )}
        </div>
      </div>

      {/* Right AI Panel & History */}
      <div className="w-64 flex-shrink-0 border-l border-white/5 bg-[#0f0f1a] flex flex-col">
        <div className="flex-1 overflow-hidden">
          <AIPanel
            suggestions={aiSuggestions}
            selectedText={selectedText}
            onRewrite={handleRewrite}
          />
        </div>
        <div className="h-1/3 min-h-[200px]">
          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><RefreshCw className="w-6 h-6 animate-spin text-brand-400" /></div>}>
      <EditorContent />
    </Suspense>
  );
}
