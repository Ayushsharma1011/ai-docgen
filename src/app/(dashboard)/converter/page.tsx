"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileCog, FileImage, FileSpreadsheet, FileText, Loader2, Presentation, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

type TargetType = "pdf" | "docx" | "pptx" | "xlsx" | "txt" | "img";

const targetLabels: Record<TargetType, string> = {
  pdf: "PDF",
  docx: "Word",
  pptx: "PowerPoint",
  xlsx: "Excel",
  txt: "Text",
  img: "Images (ZIP)",
};

function getFileExtension(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function getTargetsForExtension(ext: string): TargetType[] {
  switch (ext) {
    case "pdf":
      return ["docx", "pptx", "xlsx", "txt", "img"];
    case "docx":
      return ["pdf", "pptx", "xlsx", "txt"];
    case "pptx":
      return ["pdf", "docx", "xlsx", "txt"];
    case "xlsx":
      return ["pdf", "docx", "pptx", "txt"];
    case "txt":
      return ["pdf", "docx", "pptx", "xlsx"];
    default:
      return [];
  }
}

function readFilenameFromDisposition(header: string | null, fallback: string) {
  if (!header) return fallback;
  const match = /filename="?([^"]+)"?/i.exec(header);
  return match?.[1] || fallback;
}

export default function ConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetType, setTargetType] = useState<TargetType | "">("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("Ready for conversion");

  const sourceExt = file ? getFileExtension(file.name) : "";
  const availableTargets = useMemo(() => getTargetsForExtension(sourceExt), [sourceExt]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    const nextTargets = nextFile ? getTargetsForExtension(getFileExtension(nextFile.name)) : [];
    setTargetType(nextTargets[0] ?? "");
  }

  async function handleConvert() {
    if (!file) {
      toast.error("Choose a file to convert.");
      return;
    }

    if (!targetType) {
      toast.error("Choose a target format.");
      return;
    }

    setLoading(true);
    setStatusText("Uploading file to converter...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_type", targetType);

      setStatusText(`Converting ${sourceExt.toUpperCase()} to ${targetLabels[targetType]}...`);

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Conversion failed.");
      }

      const blob = await response.blob();
      const fallbackName = `${file.name.replace(/\.[^.]+$/, "")}.${targetType === "img" ? "zip" : targetType}`;
      const filename = readFilenameFromDisposition(response.headers.get("Content-Disposition"), fallbackName);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setStatusText(`Finished. ${targetLabels[targetType]} download started.`);
      toast.success(`Converted to ${targetLabels[targetType]}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Conversion failed.";
      setStatusText(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,#101827_0%,#0b1220_55%,#07070f_100%)] p-6 md:p-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-200">
          <RefreshCw className="h-4 w-4" />
          Smart converter
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">Document Converter Module</h1>
        <p className="mt-3 max-w-3xl text-white/45">
          Convert between PDF, Word, PowerPoint, Excel, text, and PDF pages as images. This module is built for quick working conversions inside the same workspace.
        </p>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-shell rounded-[28px] p-5 md:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-200">
              <FileCog className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Choose conversion</h2>
              <p className="text-sm text-white/40">Upload a file and convert it to another working format.</p>
            </div>
          </div>

          <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-white/14 bg-white/[0.03] px-6 py-8 text-center transition hover:border-blue-400/35 hover:bg-blue-400/[0.04]">
            <Upload className="mb-4 h-9 w-9 text-blue-200" />
            <span className="text-base font-medium text-white">{file ? file.name : "Upload a document"}</span>
            <span className="mt-2 text-sm text-white/40">Supported: PDF, DOCX, PPTX, XLSX, TXT</span>
            <input type="file" accept=".pdf,.docx,.pptx,.xlsx,.txt" className="hidden" onChange={handleFileChange} />
          </label>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Source Type</label>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75">
                {sourceExt ? sourceExt.toUpperCase() : "Upload a file first"}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Target Type</label>
              <select
                value={targetType}
                onChange={(event) => setTargetType(event.target.value as TargetType)}
                disabled={availableTargets.length === 0}
                className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/35 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {availableTargets.length === 0 ? (
                  <option value="" className="bg-[#0f172a] text-white">
                    No options yet
                  </option>
                ) : (
                  availableTargets.map((item) => (
                    <option key={item} value={item} className="bg-[#0f172a] text-white">
                      {targetLabels[item]}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleConvert()}
            disabled={loading || !file || !targetType}
            className="glass-button glass-button-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[#020617] disabled:cursor-not-allowed disabled:opacity-55"
            style={{ color: "#020617" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {loading ? "Converting..." : "Convert and download"}
          </button>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
            {statusText}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-shell rounded-[28px] p-5 md:p-6"
        >
          <h2 className="text-xl font-semibold">Supported workflows</h2>
          <p className="mt-2 text-sm text-white/40">Common conversions you can work with right now inside the app.</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-3 text-white">
                <FileText className="h-5 w-5 text-red-300" />
                <span className="font-medium">From PDF</span>
              </div>
              <p className="text-sm leading-7 text-white/55">PDF to Word, PowerPoint, Excel, text, and PDF pages to images in a ZIP.</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-3 text-white">
                <Presentation className="h-5 w-5 text-amber-300" />
                <span className="font-medium">From PowerPoint</span>
              </div>
              <p className="text-sm leading-7 text-white/55">PPT to PDF, Word, Excel, and text for content repurposing and editing.</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-3 text-white">
                <FileSpreadsheet className="h-5 w-5 text-emerald-300" />
                <span className="font-medium">From Excel</span>
              </div>
              <p className="text-sm leading-7 text-white/55">Excel data to PDF, Word, PowerPoint, and text summaries.</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-3 text-white">
                <FileImage className="h-5 w-5 text-sky-300" />
                <span className="font-medium">Quick output</span>
              </div>
              <p className="text-sm leading-7 text-white/55">Designed for fast working conversions rather than pixel-perfect preservation of complex layouts.</p>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-blue-400/15 bg-blue-400/[0.04] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200/80">Note</p>
            <p className="mt-2 text-sm leading-7 text-white/60">
              Complex designs, charts, and highly styled layouts may be simplified during conversion. The module is optimized for readable, editable output so you can keep working quickly.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
