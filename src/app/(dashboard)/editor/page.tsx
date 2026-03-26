"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Editor } from "@tiptap/core";
import {
  Bot,
  ChevronLeft,
  ChevronDown,
  Download,
  File,
  FileText,
  LayoutPanelLeft,
  Mic,
  MicOff,
  Presentation,
  RefreshCw,
  Save,
  Share2,
  Sheet,
  Sparkles,
  Wand2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { requestJson, ApiClientError } from "@/lib/client-api";
import { useEditorStore } from "@/lib/store";
import AIPanel from "@/components/Editor/AIPanel";
import HistoryPanel from "@/components/Editor/HistoryPanel";
import type { DocumentTone, DocumentType, Template } from "@/types";
import { DOC_TYPE_LABELS, PREMIUM_FEATURES, TOKEN_COSTS } from "@/lib/utils";

const TipTapEditor = dynamic(() => import("@/components/Editor/TipTapEditor"), { ssr: false });

const DOC_TYPES: { value: DocumentType; label: string; icon: React.ElementType; premium?: boolean }[] = [
  { value: "docx", label: "Word", icon: FileText },
  { value: "pdf", label: "PDF", icon: File },
  { value: "pptx", label: "PowerPoint", icon: Presentation, premium: true },
  { value: "xlsx", label: "Excel", icon: Sheet, premium: true },
];

const TONES: { value: DocumentTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "academic", label: "Academic" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "creative", label: "Creative" },
];

type GenerateResponse = {
  content: {
    title: string;
    sections?: Array<{ heading: string; body: string; bullets?: string[] }>;
  };
  tokensRemaining: number;
};

type SuggestionsResponse = {
  suggestions: string[];
};

type RewriteResponse = {
  result: string;
};

type DownloadResponse = {
  url: string;
  fileName: string;
};

type SpeechResultEvent = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function toHtml(content: GenerateResponse["content"]) {
  const sections = content.sections || [];

  return [
    `<h1>${content.title}</h1>`,
    ...sections.flatMap((section) => [
      `<h2>${section.heading}</h2>`,
      `<p>${section.body}</p>`,
      ...(section.bullets?.length ? [`<ul>${section.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>`] : []),
    ]),
  ].join("");
}

export function EditorWorkspace({ preserveState = false }: { preserveState?: boolean }) {
  const editorRef = useRef<Editor | null>(null);
  const suggestionsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchParams = useSearchParams();
  const supabase = createClient();

  const {
    currentDoc,
    setCurrentDoc,
    topic,
    setTopic,
    instructions,
    setInstructions,
    requirements,
    setRequirements,
    docType,
    setDocType,
    tone,
    setTone,
    editorContent,
    setEditorContent,
    isGenerating,
    setIsGenerating,
    isSaving,
    setIsSaving,
    aiSuggestions,
    setAISuggestions,
    resetForm,
  } = useEditorStore();

  const [selectedText, setSelectedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [userPlan, setUserPlan] = useState("free");
  const [errorMessage, setErrorMessage] = useState("");
  const [showGenerator, setShowGenerator] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showSlowGenerationHint, setShowSlowGenerationHint] = useState(false);

  const templateId = searchParams.get("template");
  const urlType = searchParams.get("type") as DocumentType | null;

  useEffect(() => {
    if (!preserveState) {
      resetForm();
    }

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [preserveState, resetForm]);

  useEffect(() => {
    if (urlType) {
      setDocType(urlType);
    }
  }, [setDocType, urlType]);

  useEffect(() => {
    if (!isGenerating) {
      setShowSlowGenerationHint(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSlowGenerationHint(true);
    }, 12_000);

    return () => clearTimeout(timer);
  }, [isGenerating]);

  useEffect(() => {
    async function loadUserPlan() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data } = await supabase.from("users").select("plan").eq("id", user.id).single();
      if (data?.plan) {
        setUserPlan(data.plan);
      }
    }

    loadUserPlan();
  }, [supabase]);

  useEffect(() => {
    async function loadTemplate() {
      if (!templateId || preserveState || currentDoc?.id) {
        return;
      }

      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .single<Template>();

      if (error || !data) {
        return;
      }

      setTopic((current) => current || data.name);
      setInstructions((current) => current || data.prompt_template);
      setDocType(data.doc_type);
      setRequirements((current) => current || data.description);
      toast.success(`Loaded "${data.name}" template`);
    }

    loadTemplate();
  }, [currentDoc?.id, preserveState, setDocType, setInstructions, setRequirements, setTopic, supabase, templateId]);

  async function fetchSuggestionsDebounced(contentTitle: string) {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    suggestionsTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await requestJson<SuggestionsResponse>("/api/suggestions", {
          method: "POST",
          json: { content: contentTitle, docType },
        });
        setAISuggestions(data.suggestions || []);
      } catch (error) {
        if (error instanceof ApiClientError && error.status !== 429) {
          console.error(error);
        }
      }
    }, 500);
  }

  async function handleGenerate() {
    setErrorMessage("");

    if (!topic.trim()) {
      setErrorMessage("Add a topic or title before generating.");
      toast.error("Please enter a topic");
      return;
    }

    if (!instructions.trim()) {
      setErrorMessage("Describe the document you want so the AI has enough context.");
      toast.error("Please enter instructions");
      return;
    }

    if (PREMIUM_FEATURES.includes(docType) && userPlan === "free") {
      const message = "PowerPoint and Excel generation require a paid plan.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    setIsGenerating(true);

    try {
      const data = await requestJson<GenerateResponse>("/api/generate", {
        method: "POST",
        json: { topic, instructions, docType, tone, requirements },
      });

      setEditorContent(toHtml(data.content));
      setAISuggestions([]);
      await fetchSuggestionsDebounced(data.content.title || topic);
      toast.success(`Document generated. ${data.tokensRemaining} tokens remaining.`);
    } catch (error) {
      const message =
        error instanceof ApiClientError && error.status === 429
          ? error.message || `Generation is temporarily rate limited. Please wait ${error.retryAfter ?? 10} seconds and try again.`
          : error instanceof Error
            ? error.message
            : "Failed to generate content. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRewrite(action: "rewrite" | "expand" | "summarize" | "simplify" | "improve") {
    if (!selectedText) {
      return;
    }

    try {
      const data = await requestJson<RewriteResponse>("/api/rewrite", {
        method: "POST",
        json: { text: selectedText, action },
      });

      setAISuggestions([data.result, ...aiSuggestions].slice(0, 5));
      toast.success("AI suggestion ready");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rewrite failed";
      toast.error(message);
    }
  }

  async function handleSave() {
    if (!editorContent) {
      toast.error("Nothing to save yet");
      return;
    }

    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please sign in again before saving.");
      }

      const documentPayload = {
        user_id: user.id,
        title: topic || "Untitled Document",
        content: editorRef.current?.getHTML() || editorContent,
        doc_type: docType,
        tone,
        topic,
        instructions,
      };

      const response = currentDoc?.id
        ? await supabase.from("documents").update(documentPayload).eq("id", currentDoc.id).select().single()
        : await supabase.from("documents").insert(documentPayload).select().single();

      if (response.error) {
        throw response.error;
      }

      setCurrentDoc(response.data);

      if (response.data?.id) {
        await fetch(`/api/documents/${response.data.id}/versions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: documentPayload.content }),
        });
      }

      toast.success("Document saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleShare() {
    if (!currentDoc?.id) {
      toast.error("Save the document first to create a share link.");
      return;
    }

    try {
      const data = await requestJson<{ shareUrl: string }>(`/api/documents/${currentDoc.id}/share`, {
        method: "POST",
      });
      await navigator.clipboard.writeText(data.shareUrl);
      toast.success("Share link copied to clipboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Share failed";
      toast.error(message);
    }
  }

  async function handleDownload() {
    if (!editorContent) {
      toast.error("Generate or write content before downloading.");
      return;
    }

    setIsDownloading(true);

    try {
      const html = editorRef.current?.getHTML() || editorContent;
      const data = await requestJson<DownloadResponse>("/api/download", {
        method: "POST",
        json: { content: html, topic, docType, tone },
      });

      window.open(data.url, "_blank", "noopener,noreferrer");
      toast.success(`${DOC_TYPE_LABELS[docType]} is ready to download`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Download failed";
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  }

  function handleVoice() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognitionCtor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsListening(true);

    recognition.onresult = (event: SpeechResultEvent) => {
      const transcript = event.results[0][0].transcript;
      setTopic((current) => `${current} ${transcript}`.trim());
      setIsListening(false);
      toast.success("Voice note added");
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition failed");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  return (
    <div className="min-h-screen bg-[#07070f] text-white xl:h-screen xl:overflow-hidden">
      <div className="flex h-full flex-col xl:flex-row">
        <aside className="border-b border-white/7 bg-[#07070f]/95 backdrop-blur xl:flex xl:h-screen xl:w-80 xl:flex-shrink-0 xl:flex-col xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-between px-4 py-4 xl:hidden">
            <div>
              <p className="text-sm font-semibold">Document setup</p>
              <p className="text-xs text-white/40">Configure format, prompt, and tone.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowGenerator((value) => !value)}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-2"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showGenerator ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className={`${showGenerator ? "block" : "hidden"} xl:flex xl:min-h-0 xl:flex-1 xl:flex-col`}>
            <div className="space-y-5 px-4 pb-5 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pb-6">
              <div className="hidden border-b border-white/7 px-0 py-4 xl:block">
                <h2 className="text-sm font-semibold">AI Generator</h2>
                <p className="mt-1 text-xs text-white/40">Describe the document you want and choose the output format.</p>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                  {errorMessage}
                </div>
              )}

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-white/75 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white xl:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to dashboard
              </Link>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {DOC_TYPES.map((typeOption) => (
                    <button
                      key={typeOption.value}
                      type="button"
                      onClick={() => setDocType(typeOption.value)}
                      className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                        docType === typeOption.value
                          ? "border-blue-500/30 bg-blue-500/15 text-blue-100"
                          : "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <typeOption.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{typeOption.label}</span>
                      </div>
                      {typeOption.premium && userPlan === "free" && (
                        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-amber-300">Paid plan</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Tone</label>
                <div className="relative">
                  <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value as DocumentTone)}
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500/40"
                  >
                    {TONES.map((toneOption) => (
                      <option key={toneOption.value} value={toneOption.value} className="bg-[#12121c]">
                        {toneOption.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Topic</label>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder="Q4 marketing strategy, resume, proposal..."
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 pr-11 text-sm outline-none transition-colors placeholder:text-white/25 focus:border-blue-500/40"
                  />
                  <button
                    type="button"
                    onClick={handleVoice}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                      isListening ? "text-rose-300" : "text-white/35 hover:text-white/80"
                    }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Instructions</label>
                <textarea
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  rows={6}
                  placeholder="Explain what the document should include, who it's for, and the outcome you want."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition-colors placeholder:text-white/25 focus:border-blue-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={(event) => setRequirements(event.target.value)}
                  rows={3}
                  placeholder="Optional details: sections to include, target audience, data points, formatting notes."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition-colors placeholder:text-white/25 focus:border-blue-500/40"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.25))] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200/80">Usage</p>
                <p className="mt-2 text-sm text-white/75">
                  This format uses <span className="font-semibold text-amber-300">{TOKEN_COSTS[docType]} tokens</span> per generation.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {isGenerating ? "Generating..." : "Generate with AI"}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-white/7 bg-[#07070f]/95 px-4 py-4 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 text-blue-300">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">Editor</span>
                </div>
                <h1 className="truncate text-xl font-semibold">{topic || "New document"}</h1>
                <p className="mt-1 text-sm text-white/40">
                  Write manually, generate with AI, then save or export when it looks right.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssistant((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white xl:hidden"
                >
                  <LayoutPanelLeft className="h-4 w-4" />
                  Assistant
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={!currentDoc?.id}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading || !editorContent}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {isDownloading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download {DOC_TYPE_LABELS[docType]}
                </button>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col xl:flex-row xl:overflow-hidden">
            <section className="min-h-[52vh] flex-1 border-b border-white/7 xl:border-b-0 xl:border-r">
              {isGenerating ? (
                <div className="flex h-full items-center justify-center px-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Sparkles className="mx-auto mb-4 h-10 w-10 text-blue-300" />
                    </motion.div>
                    <p className="text-lg font-medium">Building your document</p>
                    <p className="mt-2 text-sm text-white/45">We&apos;re generating structured content and formatting it for the editor.</p>
                    {showSlowGenerationHint && (
                      <p className="mt-4 text-sm text-amber-300">
                        This is taking longer than usual. If it keeps hanging, try a shorter prompt or generate again.
                      </p>
                    )}
                  </motion.div>
                </div>
              ) : (
                <TipTapEditor
                  content={editorContent}
                  onChange={setEditorContent}
                  onSelectionChange={setSelectedText}
                  editorRef={editorRef}
                  placeholder="Generate with AI or start drafting here..."
                />
              )}
            </section>

            <aside className={`${showAssistant ? "block" : "hidden"} border-t border-white/7 bg-[#07070f]/95 xl:block xl:h-full xl:w-80 xl:flex-shrink-0 xl:border-t-0`}>
              <div className="flex items-center justify-between border-b border-white/7 px-4 py-4 xl:hidden">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-300" />
                  <span className="text-sm font-semibold">Assistant</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssistant(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <div className="flex h-full flex-col xl:overflow-hidden">
                <div className="xl:min-h-0 xl:flex-1">
                  <AIPanel suggestions={aiSuggestions} selectedText={selectedText} onRewrite={handleRewrite} />
                </div>
                <div className="border-t border-white/7 xl:h-[260px] xl:min-h-[260px]">
                  <HistoryPanel />
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#07070f]">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-300" />
        </div>
      }
    >
      <EditorWorkspace />
    </Suspense>
  );
}
