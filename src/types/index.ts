export type DocumentType = 'pdf' | 'docx' | 'pptx' | 'xlsx';
export type DocumentTone = 'professional' | 'casual' | 'academic' | 'creative' | 'formal';
export type PlanType = 'free' | 'pro' | 'premium';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: PlanType;
  created_at: string;
}

export interface TokenRecord {
  id: string;
  user_id: string;
  balance: number;
  total_used: number;
  updated_at: string;
}

export interface PaymentSubmission {
  id: string;
  user_id: string;
  payment_type: "plan" | "tokens";
  plan: PlanType | null;
  token_amount: number | null;
  rupee_amount: number;
  upi_id: string;
  upi_name: string | null;
  reference_note: string | null;
  admin_note: string | null;
  status: "pending" | "confirmed" | "rejected";
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string; // TipTap JSON string
  doc_type: DocumentType;
  tone: DocumentTone;
  topic: string;
  instructions: string;
  file_url: string | null;
  share_token: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  version_number: number;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  doc_type: DocumentType;
  preview_image: string | null;
  prompt_template: string;
  is_premium: boolean;
  created_at: string;
}

export interface GenerationRequest {
  topic: string;
  instructions: string;
  docType: DocumentType;
  tone: DocumentTone;
  requirements?: string;
}

export interface StructuredSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface StructuredContent {
  title: string;
  docType: DocumentType;
  sections: StructuredSection[];
  metadata?: Record<string, string>;
}

export interface SlideContent {
  title: string;
  subtitle?: string;
  slides: Array<{
    title: string;
    content: string;
    bullets?: string[];
    slideType: 'title' | 'content' | 'bullets' | 'conclusion';
  }>;
}

export interface ExcelContent {
  title: string;
  sheets: Array<{
    name: string;
    headers: string[];
    rows: (string | number)[][];
    chartType?: 'bar' | 'pie' | 'line';
    chartTitle?: string;
  }>;
}

export interface ATSScore {
  score: number;
  keywords: string[];
  missing: string[];
  suggestions: string[];
}
