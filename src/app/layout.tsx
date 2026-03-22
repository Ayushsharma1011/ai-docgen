import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Document Generator — Create Professional Documents with AI",
  description:
    "Generate high-quality PDFs, Word documents, PowerPoint presentations, and Excel spreadsheets instantly using AI. The most powerful AI document platform for professionals.",
  keywords: "AI document generator, PDF generator, Word document AI, PowerPoint AI, Excel generator",
  openGraph: {
    title: "AI Document Generator",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a2e",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e8e8f0",
            },
          }}
        />
      </body>
    </html>
  );
}
