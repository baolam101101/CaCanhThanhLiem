import { NextRequest, NextResponse } from "next/server";
import { getAllAccounts, createAccount, deleteAccount, changePassword } from "@/lib/auth/accounts";
import { getSession } from "@/lib/auth/session";
import { SUPABASE_ENABLED, getSupabaseAdminClient } from "@/lib/supabase";
import {
  createAdminAccount, deleteAdminAccount, listAdminAccounts, setAdminPassword, MIN_PASSWORD_LENGTH,
} from "@/lib/auth/admin-accounts";

// Accounts are managed by the superadmin only.
// With Supabase configured they live in Supabase Auth + admin_users;
// without it (local dev) the in-memory store in lib/auth/accounts.ts.

async function superadmin() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return { error: NextResponse.json({ error: "Không có quyền" }, { status: 403 }) };
  }
  if (!SUPABASE_ENABLED) return { session, db: null };
  const db = await getSupabaseAdminClient();
  if (!db) {
    return { error: NextResponse.json({ error: "Thiếu SUPABASE_SERVICE_ROLE_KEY trong biến môi trường" }, { status: 503 }) };
  }
  return { session, db };
}

// GET — list all accounts
export async function GET() {
  const ctx = await superadmin();
  if (ctx.error) return ctx.error;
  const accounts = ctx.db ? await listAdminAccounts(ctx.db) : getAllAccounts();
  return NextResponse.json({ accounts });
}

// POST { username, password, displayName } — create a staff account
export async function POST(req: NextRequest) {
  const ctx = await superadmin();
  if (ctx.error) return ctx.error;
  const { username, password, displayName } = await req.json().catch(() => ({}));
  if (typeof username !== "string" || typeof password !== "string" || typeof displayName !== "string"
      || !username.trim() || !password || !displayName.trim()) {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  }
  const result = ctx.db
    ? await createAdminAccount(ctx.db, { username, password, displayName }, ctx.session.id)
    : createAccount({ username, password, displayName, createdBy: ctx.session.id });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// PATCH { id, password } — set a new password (own or a staff account)
export async function PATCH(req: NextRequest) {
  const ctx = await superadmin();
  if (ctx.error) return ctx.error;
  const { id, password } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự` }, { status: 400 });
  }
  const result = ctx.db ? await setAdminPassword(ctx.db, id, password) : changePassword(id, password);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// DELETE { id } — delete a staff account
export async function DELETE(req: NextRequest) {
  const ctx = await superadmin();
  if (ctx.error) return ctx.error;
  const { id } = await req.json().catch(() => ({}));
  if (typeof id !== "string") return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  const result = ctx.db ? await deleteAdminAccount(ctx.db, id, ctx.session.id) : deleteAccount(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
