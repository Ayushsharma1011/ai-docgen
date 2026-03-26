import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_24%),linear-gradient(180deg,#0b1020_0%,#07070f_100%)] xl:h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
