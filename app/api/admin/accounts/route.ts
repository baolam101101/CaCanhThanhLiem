import { NextRequest, NextResponse } from "next/server";
import { getAllAccounts, createAccount, deleteAccount } from "@/lib/auth/accounts";
import { getSession } from "@/lib/auth/session";

// GET — list all accounts (superadmin only)
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  return NextResponse.json({ accounts: getAllAccounts() });
}

// POST — create account (superadmin only)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  const { username, password, displayName } = await req.json();
  if (!username || !password || !displayName) {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  }
  const result = createAccount({ username, password, displayName, createdBy: session.id });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// DELETE — delete account (superadmin only)
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  const { id } = await req.json();
  const result = deleteAccount(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
