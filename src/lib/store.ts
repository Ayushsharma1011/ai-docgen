import { create } from 'zustand';
import { Document, DocumentType, DocumentTone } from '@/types';

interface EditorState {
  // Current document
  currentDoc: Partial<Document> | null;
  editorContent: string;
  isGenerating: boolean;
  isSaving: boolean;
  aiSuggestions: string[];
  showSuggestionsPanel: boolean;

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
  setTopic: (val: string) => void;
  setInstructions: (val: string) => void;
  setRequirements: (val: string) => void;
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
  setTopic: (val) => set({ topic: val }),
  setInstructions: (val) => set({ instructions: val }),
  setRequirements: (val) => set({ requirements: val }),
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
      currentDoc: null,
      aiSuggestions: [],
    }),
}));
