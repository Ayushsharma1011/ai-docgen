import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Sparkles, Download, FileText, ArrowRight } from "lucide-react";

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
    pdf: "PDF", docx: "Word", pptx: "PowerPoint", xlsx: "Excel",
  };

  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      {/* Header */}
      <header className="border-b border-white/7 px-6 py-4" style={{ background: "rgba(7,7,15,0.88)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-sm tracking-tight">
            <div className="w-8 h-8 rounded-[10px] btn-glow flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            DocGenius <span className="gradient-text">AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-3 py-1.5 rounded-full border border-white/7 text-white/42 uppercase tracking-wide font-medium"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {DOC_LABELS[doc.doc_type] ?? doc.doc_type}
            </span>
            <Link
              href="/signup"
              className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              Create your own <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Document viewer */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-2">
            <FileText className="w-6 h-6 text-[#60a5fa] mt-1 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{doc.title}</h1>
              {doc.topic && <p className="text-white/35 text-sm mt-1">{doc.topic}</p>}
            </div>
          </div>
          <p className="text-white/25 text-xs ml-9">
            Shared document · Generated with DocGenius AI
          </p>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-white/7 p-8" style={{ background: "rgba(18,18,28,0.92)" }}>
          <div
            className="prose prose-invert max-w-none text-white/75 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: doc.content || "<p>No content available.</p>" }}
          />
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-[40px] border border-blue-500/15 p-12 text-center" style={{ background: "rgba(18,18,28,0.92)" }}>
          <Download className="w-10 h-10 text-[#60a5fa] mx-auto mb-4" />
          <h2 className="text-xl font-extrabold mb-2 tracking-tight">Want to download or edit this document?</h2>
          <p className="text-white/42 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Sign up for free to download as {DOC_LABELS[doc.doc_type] ?? "file"} or create your own AI-generated documents.
          </p>
          <Link
            href="/signup"
            className="bg-white text-black inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            Start for Free
          </Link>
        </div>
      </main>
    </div>
  );
}
