import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Sparkles, Download, FileText } from "lucide-react";

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
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm">
            <div className="w-7 h-7 rounded-md btn-glow flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            DocGenius <span className="gradient-text">AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs glass px-3 py-1.5 rounded-full border border-white/10 text-white/50 uppercase tracking-wide">
              {DOC_LABELS[doc.doc_type] ?? doc.doc_type}
            </span>
            <Link
              href="/signup"
              className="btn-glow px-4 py-2 rounded-xl text-xs font-semibold text-white"
            >
              Create your own →
            </Link>
          </div>
        </div>
      </header>

      {/* Document viewer */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-2">
            <FileText className="w-6 h-6 text-brand-400 mt-1 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-black">{doc.title}</h1>
              {doc.topic && <p className="text-white/40 text-sm mt-1">{doc.topic}</p>}
            </div>
          </div>
          <p className="text-white/30 text-xs ml-9">
            Shared document · Generated with DocGenius AI
          </p>
        </div>

        {/* Content */}
        <div className="glass rounded-2xl border border-white/5 p-8">
          <div
            className="prose prose-invert max-w-none text-white/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: doc.content || "<p>No content available.</p>" }}
          />
        </div>

        {/* CTA */}
        <div className="mt-12 glass rounded-2xl border border-white/5 p-8 text-center">
          <Download className="w-10 h-10 text-brand-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Want to download or edit this document?</h2>
          <p className="text-white/50 text-sm mb-6">
            Sign up for free to download as {DOC_LABELS[doc.doc_type] ?? "file"} or create your own AI-generated documents.
          </p>
          <Link
            href="/signup"
            className="btn-glow inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white"
          >
            <Sparkles className="w-4 h-4" />
            Get Started Free
          </Link>
        </div>
      </main>
    </div>
  );
}
