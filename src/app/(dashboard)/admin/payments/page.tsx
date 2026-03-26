import { redirect } from "next/navigation";
import AdminPaymentsPanel from "@/components/admin/AdminPaymentsPanel";
import { requireAdminUser } from "@/lib/admin";

export default async function AdminPaymentsPage() {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  return <AdminPaymentsPanel />;
}
