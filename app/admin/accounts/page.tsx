import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminAccountsClient } from "@/components/admin/AdminAccountsClient";
import { getAllAccounts } from "@/lib/auth/accounts";

export const metadata: Metadata = { title: "Quản lý tài khoản" };

export default async function AdminAccountsPage() {
  const h    = await headers();
  const role = h.get("x-session-role");
  if (role !== "superadmin") redirect("/admin");

  const accounts = getAllAccounts();
  return <AdminAccountsClient initialAccounts={accounts} />;
}
