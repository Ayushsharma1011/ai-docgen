"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Download, FileText, SearchCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { requestJson } from "@/lib/client-api";
import TipTapEditor from "@/components/Editor/TipTapEditor";

type ResearchResponse = {
  content: string;
};

type DownloadResponse = {
  url: string;
  fileName: string;
};

const deliverables = [
  "Research brief",
  "Full research report",
  "Competitor landscape",
  "Market opportunity summary",
  "User problem exploration",
  "Go-to-market research notes",
];

export default function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [focus, setFocus] = useState("");
  const [audience, setAudience] = useState("Internal product team");
  const [deliverable, setDeliverable] = useState("Research brief");
  const [loading, setLoading] = useState(false);
  const [downloadingType, setDownloadingType] = useState<"docx" | "pdf" | null>(null);
  const [content, setContent] = useState("");

  function plainTextToHtml(value: string) {
    const escaped = value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const lines = escaped.split(/\r?\n/).map((line) => line.trim());
    const html: string[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length) {
        html.push(`<ul>${listItems.join("")}</ul>`);
        listItems = [];
      }
    };

    for (const line of lines) {
      if (!line) {
        flushList();
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        flushList();
        html.push(`<h2>${line.replace(/^\d+\.\s+/, "")}</h2>`);
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        listItems.push(`<li>${line.replace(/^[-*]\s+/, "")}</li>`);
        continue;
      }

      flushList();
      html.push(`<p>${line}</p>`);
    }

    flushList();

    return html.join("") || "<p></p>";
  }

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Enter a research topic first.");
      return;
    }

    setLoading(true);

    try {
      const data = await requestJson<ResearchResponse>("/api/research", {
        method: "POST",
        json: {
          topic,
          focus,
          audience,
          deliverable,
        },
      });

      setContent(plainTextToHtml(data.content));
      toast.success("Research brief ready.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate research.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!content) return;

    try {
      const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      await navigator.clipboard.writeText(plain);
      toast.success("Research brief copied.");
    } catch {
      toast.error("Unable to copy research brief.");
    }
  }

  async function handleDownload(docType: "docx" | "pdf") {
    if (!content.trim()) {
      toast.error("Generate or edit research before downloading.");
      return;
    }

    setDownloadingType(docType);

    try {
      const data = await requestJson<DownloadResponse>("/api/download", {
        method: "POST",
        json: {
          content,
          topic: topic || "Research Brief",
          docType,
        },
      });

      window.open(data.url, "_blank", "noopener,noreferrer");
      toast.success(`${docType.toUpperCase()} download ready.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to download file.";
      toast.error(message);
    } finally {
      setDownloadingType(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_30%),linear-gradient(135deg,#101827_0%,#0b1220_55%,#07070f_100%)] p-6 md:p-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-200">
          <SearchCheck className="h-4 w-4" />
          Research workspace
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">Specified Research Area</h1>
        <p className="mt-3 max-w-3xl text-white/45">
          Create focused research briefs for a topic, product space, market, or feature. This area is designed to help you
          define what to investigate before writing, presenting, or building.
        </p>
      </motion.div>

      <div className="grid items-start gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-shell self-start rounded-[28px] p-5 md:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/12 text-sky-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Research Input</h2>
              <p className="text-sm text-white/40">Tell the AI what kind of research direction you want.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Topic</label>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Example: AI document automation for small businesses"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/35"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Focus Area</label>
              <textarea
                value={focus}
                onChange={(event) => setFocus(event.target.value)}
                placeholder="What specifically should be researched? Competitors, user pains, pricing, market size, adoption barriers..."
                className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/35"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Audience</label>
                <input
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                  placeholder="Who will use this research?"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/35"
                />
              </div>

              <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Deliverable</label>
              <select
                value={deliverable}
                onChange={(event) => setDeliverable(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/35"
                >
                  {deliverables.map((item) => (
                    <option key={item} value={item} className="bg-[#0f172a] text-white">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-sky-400/12 bg-sky-400/[0.04] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/80">Output Mode</p>
            <p className="mt-2 text-sm leading-7 text-white/60">
              {deliverable === "Full research report"
                ? "Full research report creates a longer, more complete document with executive summary, market analysis, strategy, and action plan."
                : "Research brief creates a shorter working draft for fast planning and exploration."}
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              "Competitor mapping",
              "User pain points",
              "Feature opportunity scan",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setFocus(item);
                  if (!topic) {
                    setTopic(item);
                  }
                }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/20 hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading}
            className="glass-button glass-button-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[#020617]"
            style={{ color: "#020617" }}
          >
            {loading ? "Generating research..." : "Generate research brief"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-shell self-start rounded-[28px] p-5 md:p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Research Editor</h2>
              <p className="text-sm text-white/40">Generate a brief, edit it freely, then export it as Word or PDF.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleCopy()}
                disabled={!content}
                className="glass-button inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                type="button"
                onClick={() => void handleDownload("docx")}
                disabled={!content || downloadingType !== null}
                className="glass-button inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                <FileText className="h-4 w-4" />
                {downloadingType === "docx" ? "Preparing..." : "Word"}
              </button>
              <button
                type="button"
                onClick={() => void handleDownload("pdf")}
                disabled={!content || downloadingType !== null}
                className="glass-button inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Download className="h-4 w-4" />
                {downloadingType === "pdf" ? "Preparing..." : "PDF"}
              </button>
            </div>
          </div>

          <div className="min-h-[520px] overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(6,10,22,0.92),rgba(7,11,20,0.76))]">
            {content ? (
              <TipTapEditor
                content={content}
                onChange={setContent}
                placeholder="Generate research and refine it here..."
                mode="docx"
              />
            ) : (
              <div className="flex h-full min-h-[460px] items-center justify-center text-center text-white/35">
                <div>
                  <SearchCheck className="mx-auto mb-4 h-10 w-10 text-sky-300/60" />
                  <p className="text-base font-medium text-white/55">Your research brief will appear here</p>
                  <p className="mt-2 max-w-md text-sm leading-7">
                    Use this space for market research, feature exploration, problem discovery, competitor review, or content planning.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
