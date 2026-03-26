import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_20%),linear-gradient(180deg,#09101f_0%,#06070f_100%)] xl:h-screen">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.05),transparent_18%),radial-gradient(circle_at_80%_0%,rgba(96,165,250,0.08),transparent_18%)]" />
        {children}
      </main>
    </div>
  );
}
