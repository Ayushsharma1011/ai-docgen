"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookTemplate,
  ChevronLeft,
  ChevronRight,
  Coins,
  Crown,
  FilePlus,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  House,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/editor", icon: FilePlus, label: "Create" },
  { href: "/templates", icon: BookTemplate, label: "Templates" },
  { href: "/history", icon: History, label: "History" },
  { href: "/premium", icon: Crown, label: "Premium", premium: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tokens, setTokens] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        return;
      }

      setUserEmail(user.email ?? "");
      supabase.from("tokens").select("balance").eq("user_id", user.id).single().then(({ data }) => {
        if (data) {
          setTokens(data.balance);
        }
      });
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/");
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className={`border-b border-white/8 px-4 py-5 ${collapsed ? "items-center" : ""}`}>
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-2xl transition-opacity hover:opacity-90 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#7c3aed)] shadow-[0_10px_28px_rgba(37,99,235,0.28)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">DocGenius AI</p>
              <p className="text-xs text-white/40">Document workspace</p>
            </div>
          )}
        </Link>

        <div className={`mt-4 flex gap-2 ${collapsed ? "justify-center" : ""}`}>
          <Link
            href="/"
            className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white ${
              collapsed ? "justify-center px-2.5" : ""
            }`}
            title="Go to homepage"
          >
            <House className="h-4 w-4" />
            {!collapsed && <span>Homepage</span>}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1.5" aria-label="Sidebar Navigation">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all ${
                  active
                    ? "border border-blue-500/25 bg-blue-500/12 text-blue-100"
                    : "border border-transparent text-white/55 hover:border-white/8 hover:bg-white/[0.04] hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {active && <motion.div layoutId="sidebarActive" className="absolute inset-0 rounded-2xl border border-blue-500/25 bg-blue-500/12" />}
                <item.icon className={`relative z-10 h-5 w-5 ${item.premium ? "text-amber-300" : ""}`} />
                {!collapsed && <span className="relative z-10 font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && tokens !== null && (
          <div className="mt-5 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(12,18,34,0.6))] p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Tokens</span>
            </div>
            <div className="mt-3 text-3xl font-semibold">{tokens}</div>
            <Link href="/premium" className="mt-3 inline-flex text-sm font-medium text-blue-200 hover:text-blue-100">
              Upgrade or buy more
            </Link>
          </div>
        )}
      </div>

      <div className={`border-t border-white/8 px-3 py-4 ${collapsed ? "flex justify-center" : ""}`}>
        {!collapsed && (
          <div className="mb-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
            <p className="truncate text-sm font-medium text-white/85">{userEmail || "Signed in user"}</p>
            <p className="mt-1 text-xs text-white/40">Account active</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className={`inline-flex items-center gap-2 rounded-2xl border border-red-500/18 bg-[linear-gradient(180deg,rgba(127,29,29,0.5),rgba(127,29,29,0.26))] px-3 py-2.5 text-sm font-medium text-red-100 shadow-[0_12px_24px_rgba(127,29,29,0.2)] transition-colors hover:bg-[linear-gradient(180deg,rgba(153,27,27,0.6),rgba(127,29,29,0.34))] ${
            collapsed ? "justify-center" : "w-full"
          }`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((value) => !value)}
        className="fixed left-4 top-4 z-50 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,22,39,0.96),rgba(10,15,27,0.92))] p-2.5 text-white shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur md:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 z-50 h-full w-[280px] border-r border-white/10 bg-[#08101e] shadow-[0_24px_70px_rgba(0,0,0,0.45)] md:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 88 : 272 }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className="relative hidden h-screen flex-col border-r border-white/8 bg-[linear-gradient(180deg,#09111f,#07070f)] md:flex"
      >
        {content}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-8 flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-[#111827] text-white/60 transition-colors hover:border-white/20 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </motion.aside>
    </>
  );
}
