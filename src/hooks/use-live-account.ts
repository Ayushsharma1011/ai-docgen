"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlanType } from "@/types";

type LiveAccountState = {
  userId: string | null;
  email: string;
  fullName: string | null;
  plan: PlanType;
  tokens: number | null;
  loading: boolean;
};

const INITIAL_STATE: LiveAccountState = {
  userId: null,
  email: "",
  fullName: null,
  plan: "free",
  tokens: null,
  loading: true,
};

export function useLiveAccount() {
  const [state, setState] = useState<LiveAccountState>(INITIAL_STATE);
  const userIdRef = useRef<string | null>(null);
  const emailRef = useRef("");

  useEffect(() => {
    const supabase = createClient();

    async function loadAccount(userId?: string | null, email?: string | null) {
      let nextUserId = userId ?? null;
      let nextEmail = email ?? "";

      if (!nextUserId) {
        const { data } = await supabase.auth.getUser();
        nextUserId = data.user?.id ?? null;
        nextEmail = data.user?.email ?? "";
      }

      if (!nextUserId) {
        userIdRef.current = null;
        emailRef.current = "";
        setState({ ...INITIAL_STATE, loading: false });
        return;
      }

      const [tokenResult, profileResult] = await Promise.all([
        supabase.from("tokens").select("balance").eq("user_id", nextUserId).maybeSingle(),
        supabase.from("users").select("full_name, plan").eq("id", nextUserId).maybeSingle(),
      ]);

      setState({
        userId: nextUserId,
        email: nextEmail,
        fullName: profileResult.data?.full_name ?? null,
        plan: profileResult.data?.plan ?? "free",
        tokens: tokenResult.data?.balance ?? 0,
        loading: false,
      });
      userIdRef.current = nextUserId;
      emailRef.current = nextEmail;
    }

    void loadAccount();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadAccount(session?.user?.id, session?.user?.email);
    });

    const channel = supabase
      .channel("live-account")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          const targetId =
            typeof payload.new === "object" && payload.new && "id" in payload.new
              ? String(payload.new.id)
              : typeof payload.old === "object" && payload.old && "id" in payload.old
                ? String(payload.old.id)
                : null;

          if (targetId && targetId === userIdRef.current) {
            void loadAccount(userIdRef.current, emailRef.current);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tokens" },
        (payload) => {
          const targetId =
            typeof payload.new === "object" && payload.new && "user_id" in payload.new
              ? String(payload.new.user_id)
              : typeof payload.old === "object" && payload.old && "user_id" in payload.old
                ? String(payload.old.user_id)
                : null;

          if (targetId && targetId === userIdRef.current) {
            void loadAccount(userIdRef.current, emailRef.current);
          }
        },
      )
      .subscribe();

    return () => {
      authSubscription.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, []);

  return state;
}
