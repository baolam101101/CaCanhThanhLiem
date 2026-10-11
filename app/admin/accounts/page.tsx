import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminAccountsClient } from "@/components/admin/AdminAccountsClient";
import { getAllAccounts } from "@/lib/auth/accounts";
import { listAdminAccounts } from "@/lib/auth/admin-accounts";
import { SUPABASE_ENABLED, getSupabaseAdminClient } from "@/lib/supabase";

export const metadata: Metadata = { title: "Quản lý tài khoản" };

export default async function AdminAccountsPage() {
  const h    = await headers();
  const role = h.get("x-session-role");
  if (role !== "superadmin") redirect("/admin");

  const db = SUPABASE_ENABLED ? await getSupabaseAdminClient() : null;
  const accounts = db ? await listAdminAccounts(db) : getAllAccounts();
  return <AdminAccountsClient initialAccounts={accounts} currentUserId={h.get("x-session-id") ?? ""} />;
}
