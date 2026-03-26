import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./base.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DocGenius AI | Create Professional Documents with AI",
  description:
    "Generate high-quality PDFs, Word documents, PowerPoint presentations, and Excel spreadsheets instantly using AI.",
  keywords: "AI document generator, PDF generator, Word document AI, PowerPoint AI, Excel generator",
  openGraph: {
    title: "DocGenius AI",
    description: "Create professional documents instantly with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-[#07070f] text-slate-50`} suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
