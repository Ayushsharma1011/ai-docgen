"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, FileText, LayoutTemplate, Presentation, TableProperties } from "lucide-react";
import type { DocumentType } from "@/types";
import type { NormalizedGeneratedContent } from "@/lib/format-content";
import { htmlToSlides, htmlToWorkbook } from "@/lib/document-content";

interface FormatPreviewProps {
  docType: DocumentType;
  content: string;
  structuredContent: NormalizedGeneratedContent | null;
  topic: string;
  onStructuredChange?: (content: NormalizedGeneratedContent) => void;
}

export default function FormatPreview({ docType, content, structuredContent, topic, onStructuredChange }: FormatPreviewProps) {
  if (docType === "pptx") {
    const presentation =
      structuredContent?.docType === "pptx"
        ? structuredContent
        : { ...htmlToSlides(content, topic || "Presentation"), docType: "pptx" as const };
    return <PptWorkspace presentation={presentation} onStructuredChange={onStructuredChange} />;
  }

  if (docType === "xlsx") {
    const workbook =
      structuredContent?.docType === "xlsx"
        ? structuredContent
        : { ...htmlToWorkbook(content, topic || "Workbook"), docType: "xlsx" as const };
    return <ExcelWorkspace workbook={workbook} onStructuredChange={onStructuredChange} />;
  }

  if (docType === "pdf") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-sm text-rose-100/80">
        <LayoutTemplate className="h-4 w-4" />
        PDF mode uses a polished page layout for report-style editing and export.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 text-sm text-blue-100/80">
      <FileText className="h-4 w-4" />
      Word mode keeps a document-style editor with formatting tools for polished writing.
    </div>
  );
}

function PptWorkspace({
  presentation,
  onStructuredChange,
}: {
  presentation: Extract<NormalizedGeneratedContent, { docType: "pptx" }>;
  onStructuredChange?: (content: NormalizedGeneratedContent) => void;
}) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlide = presentation.slides[activeSlideIndex] ?? presentation.slides[0];

  useEffect(() => {
    if (activeSlideIndex > presentation.slides.length - 1) {
      setActiveSlideIndex(Math.max(presentation.slides.length - 1, 0));
    }
  }, [activeSlideIndex, presentation.slides.length]);

  function updatePresentation(
    updater: (current: Extract<NormalizedGeneratedContent, { docType: "pptx" }>) => Extract<NormalizedGeneratedContent, { docType: "pptx" }>,
  ) {
    onStructuredChange?.(updater(presentation));
  }

  function updateSlide(index: number, patch: Partial<(typeof presentation.slides)[number]>) {
    updatePresentation((current) => ({
      ...current,
      slides: current.slides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, ...patch } : slide)),
    }));
  }

  function updateDeckMeta(patch: Partial<Extract<NormalizedGeneratedContent, { docType: "pptx" }>>) {
    updatePresentation((current) => ({
      ...current,
      ...patch,
    }));
  }

  function updateBullet(slideIndex: number, bulletIndex: number, value: string) {
    updatePresentation((current) => ({
      ...current,
      slides: current.slides.map((slide, currentSlideIndex) => {
        if (currentSlideIndex !== slideIndex) return slide;
        const bullets = [...(slide.bullets ?? ["", "", ""])];
        bullets[bulletIndex] = value;
        return { ...slide, bullets: bullets.filter((bullet) => bullet.trim().length > 0) };
      }),
    }));
  }

  function addSlide() {
    updatePresentation((current) => ({
      ...current,
      slides: [
        ...current.slides,
        {
          title: `Slide ${current.slides.length + 1}`,
          content: "Add your slide message here.",
          bullets: ["Point one", "Point two"],
          slideType: "content",
        },
      ],
    }));
    setActiveSlideIndex(presentation.slides.length);
  }

  function duplicateSlide(index: number) {
    updatePresentation((current) => ({
      ...current,
      slides: current.slides.flatMap((slide, slideIndex) =>
        slideIndex === index
          ? [
              slide,
              {
                ...slide,
                title: `${slide.title} Copy`,
              },
            ]
          : [slide],
      ),
    }));
    setActiveSlideIndex(index + 1);
  }

  function removeSlide(index: number) {
    if (presentation.slides.length <= 1) {
      return;
    }
    updatePresentation((current) => ({
      ...current,
      slides: current.slides.filter((_, slideIndex) => slideIndex !== index),
    }));
    setActiveSlideIndex((current) => Math.max(0, Math.min(current, presentation.slides.length - 2)));
  }

  function moveSlide(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= presentation.slides.length) {
      return;
    }

    updatePresentation((current) => {
      const slides = [...current.slides];
      const [item] = slides.splice(index, 1);
      slides.splice(targetIndex, 0, item);
      return { ...current, slides };
    });
    setActiveSlideIndex(targetIndex);
  }

  function addBullet(slideIndex: number) {
    updatePresentation((current) => ({
      ...current,
      slides: current.slides.map((slide, currentSlideIndex) =>
        currentSlideIndex === slideIndex
          ? { ...slide, bullets: [...(slide.bullets ?? []), ""] }
          : slide,
      ),
    }));
  }

  function removeBullet(slideIndex: number, bulletIndex: number) {
    updatePresentation((current) => ({
      ...current,
      slides: current.slides.map((slide, currentSlideIndex) =>
        currentSlideIndex === slideIndex
          ? { ...slide, bullets: (slide.bullets ?? []).filter((_, index) => index !== bulletIndex) }
          : slide,
      ),
    }));
  }

    return (
      <div className="border-b border-white/7 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_32%),linear-gradient(180deg,#080913_0%,#0a0c18_100%)] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-violet-200/80">
            <Presentation className="h-4 w-4" />
            PowerPoint workspace
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-100">
              {presentation.slides.length} slides
            </div>
            <button
              type="button"
              onClick={addSlide}
              className="rounded-full border border-violet-400/25 bg-violet-500/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-100"
            >
              Add slide
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <input
            value={presentation.title}
            onChange={(event) => updateDeckMeta({ title: event.target.value })}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/25"
            placeholder="Presentation title"
          />
          <input
            value={presentation.subtitle ?? ""}
            onChange={(event) => updateDeckMeta({ subtitle: event.target.value || undefined })}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75 outline-none placeholder:text-white/25"
            placeholder="Subtitle or deck description"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/10 bg-black/20 p-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/35">Slides</div>
            <div className="space-y-3">
              {presentation.slides.map((slide, index) => (
                <div
                  key={`${slide.title}-${index}`}
                  onClick={() => setActiveSlideIndex(index)}
                  className={`rounded-[22px] border p-3 transition-colors ${
                    index === activeSlideIndex
                      ? "border-violet-400/35 bg-violet-500/10"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                      {slide.slideType}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveSlide(index, "up");
                        }}
                        className="rounded border border-white/8 px-1.5 py-0.5 text-[10px] text-white/35 hover:text-white"
                        disabled={index === 0}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveSlide(index, "down");
                        }}
                        className="rounded border border-white/8 px-1.5 py-0.5 text-[10px] text-white/35 hover:text-white"
                        disabled={index === presentation.slides.length - 1}
                      >
                        Down
                      </button>
                      <span className="text-[10px] text-white/30">{index + 1}</span>
                    </div>
                  </div>
                  <div className="aspect-[16/9] overflow-hidden rounded-[16px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,18,33,0.98),rgba(10,12,24,0.98))] p-3">
                    <div className="line-clamp-2 text-xs font-semibold text-white">{slide.title}</div>
                    <div className="mt-2 line-clamp-3 text-[10px] leading-4 text-white/55">
                      {slide.content || slide.bullets?.join(" ") || "Slide content"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,14,28,0.92),rgba(8,10,20,0.98))] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">Active slide</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{activeSlide?.title || presentation.title}</h3>
                <p className="mt-1 text-xs text-white/35">Edit the slide directly on the canvas. Changes update the exported presentation.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/45">
                  16:9 widescreen
                </div>
                <button
                  type="button"
                  onClick={() => duplicateSlide(activeSlideIndex)}
                  className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-100"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(activeSlideIndex, "up")}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/70"
                  disabled={activeSlideIndex === 0}
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(activeSlideIndex, "down")}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/70"
                  disabled={activeSlideIndex === presentation.slides.length - 1}
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() => removeSlide(activeSlideIndex)}
                  className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-100"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mx-auto aspect-[16/9] max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#12162b,#090b16)] shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
              <div className="flex h-full">
                <div className="w-3 bg-[linear-gradient(180deg,#6d5efc,#8b5cf6)]" />
                <div className="flex-1 px-10 py-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <select
                        value={activeSlide?.slideType || "content"}
                        onChange={(event) =>
                          updateSlide(activeSlideIndex, {
                            slideType: event.target.value as "title" | "content" | "bullets" | "conclusion",
                          })
                        }
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 outline-none"
                      >
                        <option value="title">Title</option>
                        <option value="content">Content</option>
                        <option value="bullets">Bullets</option>
                        <option value="conclusion">Conclusion</option>
                      </select>
                      <input
                        value={activeSlide?.title || ""}
                        onChange={(event) => updateSlide(activeSlideIndex, { title: event.target.value })}
                        className="mt-4 w-full bg-transparent text-4xl font-semibold tracking-tight text-white outline-none placeholder:text-white/25"
                        placeholder="Slide title"
                      />
                    </div>
                    <div className="text-xs text-white/30">DocGenius AI</div>
                  </div>

                  <textarea
                    value={activeSlide?.content || ""}
                    onChange={(event) => updateSlide(activeSlideIndex, { content: event.target.value })}
                    className="mt-6 min-h-[120px] w-full max-w-4xl resize-none bg-transparent text-base leading-8 text-white/72 outline-none placeholder:text-white/25"
                    placeholder="Main slide content"
                  />

                  <div className="mt-8 grid gap-3 md:grid-cols-2">
                    {Array.from({ length: Math.max(activeSlide?.bullets?.length ?? 0, 4) }).map((_, bulletIndex) => (
                      <div key={bulletIndex} className="flex items-start gap-3 rounded-[18px] border border-white/8 bg-white/[0.04] px-4 py-3">
                        <span className="mt-2 inline-block h-2.5 w-2.5 rounded-full bg-violet-300/90" />
                        <input
                          value={activeSlide?.bullets?.[bulletIndex] ?? ""}
                          onChange={(event) => updateBullet(activeSlideIndex, bulletIndex, event.target.value)}
                          className="w-full bg-transparent text-sm leading-6 text-white/82 outline-none placeholder:text-white/25"
                          placeholder={`Bullet ${bulletIndex + 1}`}
                        />
                        {(activeSlide?.bullets?.[bulletIndex] ?? "").length > 0 && (
                          <button
                            type="button"
                            onClick={() => removeBullet(activeSlideIndex, bulletIndex)}
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35 hover:text-rose-200"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => addBullet(activeSlideIndex)}
                      className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-100"
                    >
                      Add bullet
                    </button>
                  </div>
                  <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Speaker notes</div>
                    <textarea
                      value={activeSlide?.notes ?? ""}
                      onChange={(event) => updateSlide(activeSlideIndex, { notes: event.target.value || undefined })}
                      className="min-h-[88px] w-full resize-none bg-transparent text-sm leading-6 text-white/72 outline-none placeholder:text-white/25"
                      placeholder="Add speaker notes for this slide..."
                    />
                  </div>

                  <div className="mt-auto flex h-[22%] items-end justify-between">
                    <div className="text-xs uppercase tracking-[0.16em] text-white/25">
                      {presentation.subtitle || "Presentation canvas preview"}
                    </div>
                    <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs text-white/35">
                      Slide {activeSlideIndex + 1} of {presentation.slides.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
}

function ExcelWorkspace({
  workbook,
  onStructuredChange,
}: {
  workbook: Extract<NormalizedGeneratedContent, { docType: "xlsx" }>;
  onStructuredChange?: (content: NormalizedGeneratedContent) => void;
}) {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const activeSheet = workbook.sheets[activeSheetIndex] ?? workbook.sheets[0];
  const sheetLetters = useMemo(
    () => activeSheet?.headers.map((_, index) => String.fromCharCode(65 + index)) ?? [],
    [activeSheet?.headers],
  );

  useEffect(() => {
    if (activeSheetIndex > workbook.sheets.length - 1) {
      setActiveSheetIndex(Math.max(workbook.sheets.length - 1, 0));
    }
  }, [activeSheetIndex, workbook.sheets.length]);

  function updateWorkbook(
    updater: (current: Extract<NormalizedGeneratedContent, { docType: "xlsx" }>) => Extract<NormalizedGeneratedContent, { docType: "xlsx" }>,
  ) {
    onStructuredChange?.(updater(workbook));
  }

  function updateSheet(index: number, patch: Partial<(typeof workbook.sheets)[number]>) {
    updateWorkbook((current) => ({
      ...current,
      sheets: current.sheets.map((sheet, sheetIndex) => (sheetIndex === index ? { ...sheet, ...patch } : sheet)),
    }));
  }

  function updateWorkbookTitle(value: string) {
    updateWorkbook((current) => ({
      ...current,
      title: value,
    }));
  }

  function updateHeader(columnIndex: number, value: string) {
    updateWorkbook((current) => ({
      ...current,
      sheets: current.sheets.map((sheet, sheetIndex) => {
        if (sheetIndex !== activeSheetIndex) return sheet;
        const headers = [...sheet.headers];
        headers[columnIndex] = value;
        return { ...sheet, headers };
      }),
    }));
  }

  function updateCell(rowIndex: number, cellIndex: number, value: string) {
    updateWorkbook((current) => ({
      ...current,
      sheets: current.sheets.map((sheet, sheetIndex) => {
        if (sheetIndex !== activeSheetIndex) return sheet;
        const rows = sheet.rows.map((row) => [...row]);
        rows[rowIndex][cellIndex] = value;
        return { ...sheet, rows };
      }),
    }));
  }

  function addRow() {
    updateWorkbook((current) => ({
      ...current,
      sheets: current.sheets.map((sheet, sheetIndex) => {
        if (sheetIndex !== activeSheetIndex) return sheet;
        return {
          ...sheet,
          rows: [...sheet.rows, new Array(sheet.headers.length).fill("").map((_, index) => (index === 0 ? `Item ${sheet.rows.length + 1}` : ""))],
        };
      }),
    }));
  }

  function addColumn() {
    updateWorkbook((current) => ({
      ...current,
      sheets: current.sheets.map((sheet, sheetIndex) => {
        if (sheetIndex !== activeSheetIndex) return sheet;
        return {
          ...sheet,
          headers: [...sheet.headers, `Column ${sheet.headers.length + 1}`],
          rows: sheet.rows.map((row) => [...row, ""]),
        };
      }),
    }));
  }

  function addSheet() {
    updateWorkbook((current) => ({
      ...current,
      sheets: [
        ...current.sheets,
        {
          name: `Sheet ${current.sheets.length + 1}`,
          headers: ["Column 1", "Column 2"],
          rows: [["Item 1", ""], ["Item 2", ""]],
          chartType: "bar",
          chartTitle: `Sheet ${current.sheets.length + 1} Chart`,
        },
      ],
    }));
    setActiveSheetIndex(workbook.sheets.length);
  }

  function removeLastRow() {
    updateWorkbook((current) => ({
      ...current,
      sheets: current.sheets.map((sheet, sheetIndex) => {
        if (sheetIndex !== activeSheetIndex || sheet.rows.length <= 1) return sheet;
        return {
          ...sheet,
          rows: sheet.rows.slice(0, -1),
        };
      }),
    }));
  }

  function removeLastColumn() {
    updateWorkbook((current) => ({
      ...current,
      sheets: current.sheets.map((sheet, sheetIndex) => {
        if (sheetIndex !== activeSheetIndex || sheet.headers.length <= 1) return sheet;
        return {
          ...sheet,
          headers: sheet.headers.slice(0, -1),
          rows: sheet.rows.map((row) => row.slice(0, -1)),
        };
      }),
    }));
  }

  function removeRow(rowIndex: number) {
    updateWorkbook((current) => ({
      ...current,
      sheets: current.sheets.map((sheet, sheetIndex) => {
        if (sheetIndex !== activeSheetIndex || sheet.rows.length <= 1) return sheet;
        return {
          ...sheet,
          rows: sheet.rows.filter((_, index) => index !== rowIndex),
        };
      }),
    }));
  }

  function removeColumn(columnIndex: number) {
    updateWorkbook((current) => ({
      ...current,
      sheets: current.sheets.map((sheet, sheetIndex) => {
        if (sheetIndex !== activeSheetIndex || sheet.headers.length <= 1) return sheet;
        return {
          ...sheet,
          headers: sheet.headers.filter((_, index) => index !== columnIndex),
          rows: sheet.rows.map((row) => row.filter((_, index) => index !== columnIndex)),
        };
      }),
    }));
  }

  const chartPreview = useMemo(() => {
    if (!activeSheet?.chartType) {
      return [];
    }

    return activeSheet.rows
      .map((row) => {
        const label = String(row[0] ?? "");
        const numericCell = row.find((cell, index) => index > 0 && typeof cell === "number");
        const value = typeof numericCell === "number" ? numericCell : Number(row[1] ?? 0);
        return {
          label,
          value: Number.isFinite(value) ? value : 0,
        };
      })
      .filter((item) => item.label.trim().length > 0)
      .slice(0, 6);
  }, [activeSheet]);

    return (
      <div className="border-b border-white/7 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.1),transparent_34%),linear-gradient(180deg,#07110d_0%,#09130f_100%)] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
            <TableProperties className="h-4 w-4" />
            Excel workspace
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
              {workbook.sheets.length} sheets
            </div>
            <button
              type="button"
              onClick={addSheet}
              className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100"
            >
              Add sheet
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
          <input
            value={workbook.title}
            onChange={(event) => updateWorkbookTitle(event.target.value)}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-white/25"
            placeholder="Workbook title"
          />
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/55">
            Edit cells directly below. The exported Excel file will use this workbook data.
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0b1511] shadow-[0_28px_80px_rgba(0,0,0,0.26)]">
          <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(19,78,50,0.78),rgba(9,22,16,0.92))] px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              {workbook.sheets.map((sheet, index) => (
                <button
                  type="button"
                  key={sheet.name}
                  onClick={() => setActiveSheetIndex(index)}
                  className={`rounded-t-2xl border px-4 py-2 text-sm font-medium ${
                    index === activeSheetIndex
                      ? "border-emerald-300/35 bg-[#10241c] text-emerald-100"
                      : "border-white/8 bg-white/[0.03] text-white/55"
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-white/8 bg-[#101a15] px-4 py-3">
            <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3">
              <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                fx
              </div>
              <input
                value={activeSheet?.chartTitle || ""}
                onChange={(event) => updateSheet(activeSheetIndex, { chartTitle: event.target.value })}
                className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-white/60 outline-none placeholder:text-white/25"
                placeholder={`${activeSheet?.name || "Sheet"} data preview`}
              />
            </div>
          </div>

          <div className="overflow-x-auto bg-[#0b1511] p-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                value={activeSheet?.name || ""}
                onChange={(event) => updateSheet(activeSheetIndex, { name: event.target.value })}
                className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white outline-none placeholder:text-white/25"
                placeholder="Sheet name"
              />
              <button
                type="button"
                onClick={addRow}
                className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100"
              >
                Add row
              </button>
              <button
                type="button"
                onClick={addColumn}
                className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100"
              >
                Add column
              </button>
              <button
                type="button"
                onClick={removeLastRow}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70"
              >
                Remove last row
              </button>
              <button
                type="button"
                onClick={removeLastColumn}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70"
              >
                Remove last column
              </button>
              <select
                value={activeSheet?.chartType ?? ""}
                onChange={(event) =>
                  updateSheet(activeSheetIndex, {
                    chartType: event.target.value ? (event.target.value as "bar" | "pie" | "line") : undefined,
                  })
                }
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 outline-none"
              >
                <option value="">No chart</option>
                <option value="bar">Bar chart</option>
                <option value="line">Line chart</option>
                <option value="pie">Pie chart</option>
              </select>
            </div>
            {activeSheet?.chartType && chartPreview.length > 0 ? (
              <div className="mb-4 rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Chart preview
                </div>
                <div className="space-y-3">
                  {chartPreview.map((item) => {
                    const maxValue = Math.max(...chartPreview.map((entry) => entry.value), 1);
                    const width = `${Math.max((item.value / maxValue) * 100, 6)}%`;
                    return (
                      <div key={item.label} className="grid grid-cols-[140px_minmax(0,1fr)_60px] items-center gap-3">
                        <div className="truncate text-xs text-white/55">{item.label}</div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]">
                          <div className="h-full rounded-full bg-[linear-gradient(90deg,#34d399,#10b981)]" style={{ width }} />
                        </div>
                        <div className="text-right text-xs font-semibold text-emerald-100">{item.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <div className="min-w-[820px] overflow-hidden rounded-[22px] border border-white/8">
              <div
                className="grid bg-[#12211a] text-xs font-semibold uppercase tracking-[0.14em] text-white/40"
                style={{ gridTemplateColumns: `56px repeat(${Math.max(activeSheet?.headers.length || 0, 1)}, minmax(160px, 1fr))` }}
              >
                <div className="border-b border-r border-white/8 px-3 py-3 text-center">#</div>
                {sheetLetters.map((letter) => (
                  <div key={letter} className="border-b border-r border-white/8 px-4 py-3 text-center">
                    {letter}
                  </div>
                ))}
              </div>

              <div
                className="grid bg-[#163025]/80 text-sm text-white"
                style={{ gridTemplateColumns: `56px repeat(${Math.max(activeSheet?.headers.length || 0, 1)}, minmax(160px, 1fr))` }}
              >
                <div className="border-b border-r border-white/8 px-3 py-3 text-center text-xs font-semibold text-white/45">1</div>
                {activeSheet?.headers.map((header, headerIndex) => (
                  <div key={`${header}-${headerIndex}`} className="border-b border-r border-white/8 px-2 py-2 font-semibold text-emerald-50">
                    <div className="flex items-center gap-2">
                      <input
                        value={header}
                        onChange={(event) => updateHeader(headerIndex, event.target.value)}
                        className="w-full bg-transparent px-2 py-1 outline-none placeholder:text-white/25"
                        placeholder={`Column ${headerIndex + 1}`}
                      />
                      {activeSheet.headers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(headerIndex)}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35 hover:text-rose-200"
                        >
                          Del
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {activeSheet?.rows.map((row, rowIndex) => (
                <div
                  key={`${activeSheet.name}-${rowIndex}`}
                  className="grid text-sm text-white/80"
                  style={{
                    gridTemplateColumns: `56px repeat(${Math.max(activeSheet.headers.length, 1)}, minmax(160px, 1fr))`,
                    background: rowIndex % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="border-b border-r border-white/8 px-3 py-3 text-center text-xs font-semibold text-white/40">
                    <div className="flex items-center justify-center gap-2">
                      <span>{rowIndex + 2}</span>
                      {activeSheet.rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(rowIndex)}
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35 hover:text-rose-200"
                        >
                          Del
                        </button>
                      )}
                    </div>
                  </div>
                  {row.map((cell, cellIndex) => (
                    <div key={`${activeSheet.name}-${rowIndex}-${cellIndex}`} className="border-b border-r border-white/8 px-2 py-2">
                      <input
                        value={String(cell)}
                        onChange={(event) => updateCell(rowIndex, cellIndex, event.target.value)}
                        className="w-full bg-transparent px-2 py-1 outline-none placeholder:text-white/25"
                        placeholder="Value"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/8 bg-[#0f1b16] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <div className="h-3 w-3 rounded-full bg-emerald-300/80" />
                Active sheet: {activeSheet?.name || "Sheet 1"}
              </div>
              {activeSheet?.chartType ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                  <BarChart3 className="h-3.5 w-3.5" />
                  {activeSheet.chartType} chart ready
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
}
