"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/Auth/AuthShell";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created. Check your inbox to verify your email.");
    router.push("/dashboard");
  }

  async function handleGoogle() {
    const supabase = createClient();
    const redirectBase = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${redirectBase}/auth/callback?next=/dashboard` },
    });
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start with a cleaner document workflow and move from idea to export faster."
      sideTitle="Design that helps you work, not just look busy."
      sideCopy="Create documents, save versions, reuse templates, and manage everything from a calmer, more focused dashboard."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-300 hover:text-blue-200">
            Sign in
          </Link>
        </>
      }
    >
      <button
        type="button"
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/[0.06]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/25">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-12 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-blue-500/40"
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-12 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-blue-500/40"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-12 py-3.5 pr-12 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-blue-500/40"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/70"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading ? "Creating account..." : "Create account"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-4 text-center text-xs leading-6 text-white/28">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </AuthShell>
  );
}
