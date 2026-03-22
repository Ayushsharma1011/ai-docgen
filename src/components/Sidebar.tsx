"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FilePlus, BookTemplate, History,
  Crown, LogOut, Sparkles, ChevronLeft, ChevronRight,
  Coins, Menu, X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const NAV_ITEMS = [
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
      if (user) {
        setUserEmail(user.email ?? "");
        supabase
          .from("tokens")
          .select("balance")
          .eq("user_id", user.id)
          .single()
          .then(({ data }) => {
            if (data) setTokens(data.balance);
          });
      }
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/");
  }

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-2 p-4 mb-4 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-lg btn-glow flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-base whitespace-nowrap overflow-hidden"
            >
              DocGenius <span className="gradient-text">AI</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1" aria-label="Sidebar Navigation">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative group ${
                active
                  ? "bg-brand-600/20 text-brand-300 border border-brand-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              } ${collapsed ? "justify-center" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl bg-brand-600/20 border border-brand-500/30"
                />
              )}
              <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${item.premium ? "text-yellow-400" : ""}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Tokens */}
      {!collapsed && tokens !== null && (
        <div className="mx-2 mb-3 glass rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-semibold text-white/70">Token Balance</span>
          </div>
          <div className="text-2xl font-black text-white mb-1">{tokens}</div>
          <Link href="/premium" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Get more tokens →
          </Link>
        </div>
      )}

      {/* User & logout */}
      <div className={`p-2 border-t border-white/5 ${collapsed ? "flex justify-center" : ""}`}>
        {!collapsed && userEmail && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-white/40 truncate">{userEmail}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 text-white/50 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10 w-full ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 glass p-2 rounded-lg border border-white/10"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-[#0f0f1a] border-r border-white/5 z-50 md:hidden"
          >
            {SidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-[#0f0f1a] border-r border-white/5 h-screen sticky top-0 overflow-hidden"
      >
        {SidebarContent}
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center z-50 hover:border-brand-500/40 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-white/60" /> : <ChevronLeft className="w-3 h-3 text-white/60" />}
        </button>
      </motion.aside>
    </>
  );
}
