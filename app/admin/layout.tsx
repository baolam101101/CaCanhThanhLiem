import type { Metadata } from "next";
import { headers } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { template: "%s | Admin", default: "Admin Dashboard" },
  robots: { index: false, follow: false },
};

function b64Decode(b64: string): string {
  try { return Buffer.from(b64, "base64").toString("utf8"); }
  catch { return "Admin"; }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h           = await headers();
  const role        = h.get("x-session-role") ?? "staff";
  const nameb64     = h.get("x-session-name-b64") ?? "";
  const displayName = nameb64 ? b64Decode(nameb64) : "Admin";

  return (
    <AdminShell role={role} displayName={displayName}>
      {children}
    </AdminShell>
  );
}
