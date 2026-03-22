import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const DOC_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  docx: 'Word',
  pptx: 'PowerPoint',
  xlsx: 'Excel',
};

export const DOC_TYPE_ICONS: Record<string, string> = {
  pdf: '📄',
  docx: '📝',
  pptx: '📊',
  xlsx: '📈',
};

export const PLAN_TOKEN_LIMITS: Record<string, number> = {
  free: 10,
  pro: 100,
  premium: 999999,
};

export const TOKEN_COSTS: Record<string, number> = {
  pdf: 2,
  docx: 2,
  pptx: 3,
  xlsx: 3,
};

export const PREMIUM_FEATURES = ['pptx', 'xlsx', 'ats', 'voice'];
