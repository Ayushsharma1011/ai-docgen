"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type AuthStatusProps = {
  variant?: "landing" | "compact";
};

export default function AuthStatus({ variant = "landing" }: AuthStatusProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? "");
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? "");
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    toast.success("Signed out");
    router.refresh();
    router.push("/");
  }

  const initials = useMemo(() => {
    if (!email) return "DG";
    const localPart = email.split("@")[0] || "";
    return localPart.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "DG";
  }, [email]);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/50">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        Checking account
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/78 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white px-4 py-2.5 text-sm font-semibold text-[#020617] transition-opacity hover:opacity-90"
          style={{ color: "#020617" }}
        >
          Get Started Free
        </Link>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] px-2.5 py-2 pr-3 text-left text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)] transition-all hover:border-white/20 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.05))]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed)] text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.35)]">
          {initials}
        </span>

        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[180px] truncate text-sm font-semibold text-white">{email}</span>
          <span className="block text-xs text-white/45">My account</span>
        </span>

        <ChevronDown
          className={`h-4 w-4 text-white/45 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`absolute right-0 top-[calc(100%+12px)] z-50 w-[280px] overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,11,20,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
              variant === "compact" ? "w-[250px]" : ""
            }`}
            role="menu"
          >
            <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#7c3aed)] text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.35)]">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{email}</p>
                  <p className="text-xs text-white/45">Signed in to DocGenius AI</p>
                </div>
              </div>
            </div>

            <div className="p-2.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
                role="menuitem"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/12 text-blue-200">
                  <LayoutDashboard className="h-4 w-4" />
                </span>
                <span>
                  <span className="block">Dashboard</span>
                  <span className="block text-xs text-white/40">Open your workspace</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-medium text-red-200 transition-colors hover:bg-red-500/10"
                role="menuitem"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/12 text-red-200">
                  <LogOut className="h-4 w-4" />
                </span>
                <span>
                  <span className="block">Logout</span>
                  <span className="block text-xs text-red-200/55">Sign out of this account</span>
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
