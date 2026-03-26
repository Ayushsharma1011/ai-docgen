"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { BadgeCheck, Clock3, Coins, Crown, RefreshCcw, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import { requestJson } from "@/lib/client-api";
import type { PaymentSubmission, PlanType } from "@/types";

type AdminSubmission = PaymentSubmission & {
  users: {
    email: string;
    full_name: string | null;
    plan: PlanType;
  } | null;
};

type ReviewDraft = {
  plan: PlanType;
  token_amount: number;
  admin_note: string;
};

const STATUS_STYLES = {
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  confirmed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  rejected: "border-rose-400/30 bg-rose-400/10 text-rose-200",
} as const;

export default function AdminPaymentsPanel() {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentSubmission["status"]>("pending");

  async function loadSubmissions() {
    setLoading(true);

    try {
      const data = await requestJson<{ submissions: AdminSubmission[] }>("/api/admin/payments", {
        method: "GET",
      });

      setSubmissions(data.submissions);
      setDrafts((current) => {
        const next = { ...current };

        for (const submission of data.submissions) {
          next[submission.id] ??= {
            plan: submission.plan ?? "pro",
            token_amount: submission.token_amount ?? 0,
            admin_note: submission.admin_note ?? "",
          };
        }

        return next;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load admin payments.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSubmissions();
  }, []);

  const filteredSubmissions = useMemo(() => {
    if (statusFilter === "all") {
      return submissions;
    }

    return submissions.filter((submission) => submission.status === statusFilter);
  }, [statusFilter, submissions]);

  function updateDraft(id: string, patch: Partial<ReviewDraft>) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch,
      },
    }));
  }

  async function reviewSubmission(id: string, action: "confirm" | "reject") {
    const draft = drafts[id];
    setBusyId(id);

    try {
      const data = await requestJson<{ message: string }>(`/api/admin/payments/${id}`, {
        method: "PATCH",
        json: {
          action,
          plan: draft?.plan,
          token_amount: draft?.token_amount,
          admin_note: draft?.admin_note,
        },
      });

      toast.success(data.message);
      await loadSubmissions();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to review payment.";
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
      <div className="glass-shell rounded-[32px] p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin payment review
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Confirm user payments after checking them</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/50 md:text-base">
              Review submitted payment notes, confirm the plan or token credit, and keep a clear approval history inside the app.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | PaymentSubmission["status"])}
              className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="pending" className="bg-[#111827] text-white">Pending only</option>
              <option value="all" className="bg-[#111827] text-white">All submissions</option>
              <option value="confirmed" className="bg-[#111827] text-white">Confirmed only</option>
              <option value="rejected" className="bg-[#111827] text-white">Rejected only</option>
            </select>

            <button
              type="button"
              onClick={() => void loadSubmissions()}
              className="glass-button inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm text-white/45">Pending</p>
          <p className="mt-2 text-3xl font-semibold">{submissions.filter((item) => item.status === "pending").length}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm text-white/45">Confirmed</p>
          <p className="mt-2 text-3xl font-semibold">{submissions.filter((item) => item.status === "confirmed").length}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="text-sm text-white/45">Rejected</p>
          <p className="mt-2 text-3xl font-semibold">{submissions.filter((item) => item.status === "rejected").length}</p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {loading ? (
          [...Array(3)].map((_, index) => (
            <div key={index} className="glass-panel h-64 animate-pulse rounded-[28px]" />
          ))
        ) : filteredSubmissions.length === 0 ? (
          <div className="glass-panel rounded-[28px] p-10 text-center">
            <Clock3 className="mx-auto h-10 w-10 text-white/25" />
            <h2 className="mt-4 text-xl font-semibold">No payment requests in this filter</h2>
            <p className="mt-2 text-sm text-white/45">When users submit a payment note, it will show up here for review.</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => {
            const draft = drafts[submission.id] ?? {
              plan: submission.plan ?? "pro",
              token_amount: submission.token_amount ?? 0,
              admin_note: submission.admin_note ?? "",
            };

            return (
              <div key={submission.id} className="glass-panel rounded-[28px] p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${STATUS_STYLES[submission.status]}`}>
                        {submission.status}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                        {submission.payment_type === "plan" ? "Plan payment" : "Token top-up"}
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold text-white">
                      {submission.users?.full_name || submission.users?.email || submission.user_id}
                    </h2>
                    <p className="mt-1 break-all text-sm text-white/45">{submission.users?.email ?? "User email unavailable"}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/35">Amount</p>
                        <p className="mt-2 text-lg font-semibold text-white">₹{submission.rupee_amount}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/35">Requested item</p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {submission.payment_type === "plan" ? submission.plan?.toUpperCase() : `${submission.token_amount ?? 0} tokens`}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/35">Current plan</p>
                        <p className="mt-2 text-lg font-semibold text-white">{submission.users?.plan?.toUpperCase() ?? "UNKNOWN"}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/35">Submitted</p>
                        <p className="mt-2 text-sm font-medium text-white">{format(new Date(submission.created_at), "dd MMM yyyy, hh:mm a")}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 xl:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/35">UPI details</p>
                        <p className="mt-2 text-sm text-white/75">{submission.upi_name || "Payee"} • {submission.upi_id}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/35">User note</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/70">{submission.reference_note || "No note added by user."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-shell w-full rounded-[26px] p-5 lg:max-w-[360px]">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200/80">Review form</p>

                    {submission.payment_type === "plan" ? (
                      <label className="mt-4 block">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Approve plan</span>
                        <select
                          value={draft.plan}
                          onChange={(event) => updateDraft(submission.id, { plan: event.target.value as PlanType })}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none"
                          disabled={submission.status !== "pending"}
                        >
                          <option value="pro" className="bg-[#111827] text-white">Pro</option>
                          <option value="premium" className="bg-[#111827] text-white">Premium</option>
                        </select>
                      </label>
                    ) : (
                      <label className="mt-4 block">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Tokens to credit</span>
                        <input
                          type="number"
                          min={1}
                          value={draft.token_amount}
                          onChange={(event) => updateDraft(submission.id, { token_amount: Number(event.target.value) })}
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
                          disabled={submission.status !== "pending"}
                        />
                      </label>
                    )}

                    <label className="mt-4 block">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Admin note</span>
                      <textarea
                        value={draft.admin_note}
                        onChange={(event) => updateDraft(submission.id, { admin_note: event.target.value })}
                        placeholder="Write what you checked before confirming or rejecting."
                        className="mt-2 min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25"
                        disabled={submission.status !== "pending"}
                      />
                    </label>

                    {submission.reviewed_at && (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                        Reviewed on {format(new Date(submission.reviewed_at), "dd MMM yyyy, hh:mm a")}
                      </div>
                    )}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => void reviewSubmission(submission.id, "confirm")}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-[#052e16] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={submission.status === "rejected" || busyId === submission.id}
                      >
                        {submission.payment_type === "plan" ? <Crown className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
                        {busyId === submission.id ? "Saving..." : submission.status === "confirmed" ? "Sync again" : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void reviewSubmission(submission.id, "reject")}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={submission.status !== "pending" || busyId === submission.id}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>

                    {submission.status === "confirmed" && (
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-200">
                        <BadgeCheck className="h-4 w-4" />
                        Payment already confirmed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
