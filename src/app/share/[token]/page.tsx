import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Download, FileText, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function SharedDocumentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("title, content, doc_type, topic, created_at")
    .eq("share_token", token)
    .eq("is_public", true)
    .single();

  if (!doc) notFound();

  const DOC_LABELS: Record<string, string> = {
    pdf: "PDF",
    docx: "Word",
    pptx: "PowerPoint",
    xlsx: "Excel",
  };

  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      <header
        className="border-b border-white/7 px-6 py-4"
        style={{ background: "rgba(7,7,15,0.88)", backdropFilter: "blur(20px)" }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-sm font-extrabold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#2563eb,#7c3aed)] shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_34px_rgba(37,99,235,0.55)]">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            DocGenius{" "}
            <span className="bg-[linear-gradient(90deg,#60a5fa,#a78bfa,#f472b6)] bg-clip-text text-transparent">
              AI
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span
              className="rounded-full border border-white/7 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white/42"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {DOC_LABELS[doc.doc_type] ?? doc.doc_type}
            </span>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition-opacity hover:opacity-90"
            >
              Create your own <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <div className="mb-2 flex items-start gap-3">
            <FileText className="mt-1 h-6 w-6 flex-shrink-0 text-[#60a5fa]" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{doc.title}</h1>
              {doc.topic && <p className="mt-1 text-sm text-white/35">{doc.topic}</p>}
            </div>
          </div>
          <p className="ml-9 text-xs text-white/25">Shared document · Generated with DocGenius AI</p>
        </div>

        <div className="rounded-2xl border border-white/7 p-8" style={{ background: "rgba(18,18,28,0.92)" }}>
          <div
            className="prose prose-invert max-w-none text-white/75 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: doc.content || "<p>No content available.</p>" }}
          />
        </div>

        <div
          className="mt-12 rounded-[40px] border border-blue-500/15 p-12 text-center"
          style={{ background: "rgba(18,18,28,0.92)" }}
        >
          <Download className="mx-auto mb-4 h-10 w-10 text-[#60a5fa]" />
          <h2 className="mb-2 text-xl font-extrabold tracking-tight">Want to download or edit this document?</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-white/42">
            Sign up for free to download as {DOC_LABELS[doc.doc_type] ?? "file"} or create your own AI-generated
            documents.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            Start for Free
          </Link>
        </div>
      </main>
    </div>
  );
}
