import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireAdminUser();

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("payment_submissions")
      .select(`
        id,
        user_id,
        payment_type,
        plan,
        token_amount,
        rupee_amount,
        upi_id,
        upi_name,
        reference_note,
        admin_note,
        status,
        reviewed_at,
        reviewed_by,
        created_at,
        updated_at,
        users:user_id (
          email,
          full_name,
          plan
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ submissions: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load payment submissions.";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
