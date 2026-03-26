import { create } from 'zustand';
import { Document, DocumentType, DocumentTone } from '@/types';
import type { NormalizedGeneratedContent } from '@/lib/format-content';

interface EditorState {
  // Current document
  currentDoc: Partial<Document> | null;
  editorContent: string;
  isGenerating: boolean;
  isSaving: boolean;
  aiSuggestions: string[];
  showSuggestionsPanel: boolean;
  structuredOutput: NormalizedGeneratedContent | null;

  // Generation form
  topic: string;
  instructions: string;
  requirements: string;
  docType: DocumentType;
  tone: DocumentTone;

  // Actions
  setCurrentDoc: (doc: Partial<Document> | null) => void;
  setEditorContent: (content: string) => void;
  setIsGenerating: (val: boolean) => void;
  setIsSaving: (val: boolean) => void;
  setAISuggestions: (suggestions: string[]) => void;
  setShowSuggestionsPanel: (val: boolean) => void;
  setStructuredOutput: (content: NormalizedGeneratedContent | null) => void;
  setTopic: (val: string | ((current: string) => string)) => void;
  setInstructions: (val: string | ((current: string) => string)) => void;
  setRequirements: (val: string | ((current: string) => string)) => void;
  setDocType: (val: DocumentType) => void;
  setTone: (val: DocumentTone) => void;
  resetForm: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentDoc: null,
  editorContent: '',
  isGenerating: false,
  isSaving: false,
  aiSuggestions: [],
  showSuggestionsPanel: false,
  structuredOutput: null,
  topic: '',
  instructions: '',
  requirements: '',
  docType: 'docx',
  tone: 'professional',

  setCurrentDoc: (doc) => set({ currentDoc: doc }),
  setEditorContent: (content) => set({ editorContent: content }),
  setIsGenerating: (val) => set({ isGenerating: val }),
  setIsSaving: (val) => set({ isSaving: val }),
  setAISuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
  setShowSuggestionsPanel: (val) => set({ showSuggestionsPanel: val }),
  setStructuredOutput: (content) => set({ structuredOutput: content }),
  setTopic: (val) => set((state) => ({ topic: typeof val === "function" ? val(state.topic) : val })),
  setInstructions: (val) =>
    set((state) => ({ instructions: typeof val === "function" ? val(state.instructions) : val })),
  setRequirements: (val) =>
    set((state) => ({ requirements: typeof val === "function" ? val(state.requirements) : val })),
  setDocType: (val) => set({ docType: val }),
  setTone: (val) => set({ tone: val }),
  resetForm: () =>
    set({
      topic: '',
      instructions: '',
      requirements: '',
      docType: 'docx',
      tone: 'professional',
      editorContent: '',
      structuredOutput: null,
      currentDoc: null,
      aiSuggestions: [],
    }),
}));
