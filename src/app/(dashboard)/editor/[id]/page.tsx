"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/lib/store";
import { RefreshCw } from "lucide-react";

// The editor content is already handled in EditorPage component (src/app/(dashboard)/editor/page.tsx).
// We'll wrap EditorContent inside [id]/page.tsx to load existing data first.
import EditorContentComponent from "@/app/(dashboard)/editor/page";

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const {
    setTopic, setInstructions, setDocType, setTone, setEditorContent
  } = useEditorStore();

  useEffect(() => {
    async function loadDoc() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: doc, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !doc) {
        toast.error("Document not found");
        router.push("/dashboard");
        return;
      }

      // Populate store
      useEditorStore.getState().setCurrentDoc(doc);
      setTopic(doc.topic || doc.title || "");
      setInstructions(doc.instructions || "");
      setDocType(doc.doc_type);
      setTone(doc.tone);
      setEditorContent(doc.content || "");

      setLoading(false);
    }
    loadDoc();
  }, [id, router, setTopic, setInstructions, setDocType, setTone, setEditorContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f1a]">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  // We reuse the EditorPage which renders EditorContent and accesses the zustand store we just populated.
  return <EditorContentComponent />;
}
