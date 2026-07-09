// ============================================================
// ACCOUNT STORE
// In production: replace with Supabase DB queries
// ============================================================

export type AccountRole = "superadmin" | "staff";

export interface Account {
  id: string;
  username: string;
  passwordHash: string; // sha256 hex for simplicity (no bcrypt dep)
  displayName: string;
  role: AccountRole;
  createdAt: string;
  createdBy?: string;
  active: boolean;
}

// Simple hash — in production use bcrypt via Supabase Auth
function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, "0");
}

export function hashPassword(plain: string): string {
  // Multi-round to slow brute force slightly
  let h = plain + "cacanhTL_salt_2025";
  for (let i = 0; i < 100; i++) h = simpleHash(h + plain);
  return h;
}

export function verifyPassword(plain: string, hash: string): boolean {
  return hashPassword(plain) === hash;
}

// ---- Default account (superadmin) ----
const DEFAULT_ADMIN: Account = {
  id: "admin_001",
  username: "admin",
  passwordHash: hashPassword("TL@Admin2025"),
  displayName: "Quản trị viên",
  role: "superadmin",
  createdAt: "2025-01-01T00:00:00Z",
  active: true,
};

// Global in-memory store (survives module lifetime in dev)
// In prod: use DB
declare global {
  // eslint-disable-next-line no-var
  var __tlAccounts: Account[] | undefined;
}

function getStore(): Account[] {
  if (!global.__tlAccounts) {
    global.__tlAccounts = [DEFAULT_ADMIN];
  }
  return global.__tlAccounts;
}

export function getAllAccounts(): Account[] {
  return getStore().map((a) => ({ ...a, passwordHash: "***" }));
}

export function findByUsername(username: string): Account | undefined {
  return getStore().find(
    (a) => a.username.toLowerCase() === username.toLowerCase() && a.active
  );
}

export function findById(id: string): Account | undefined {
  return getStore().find((a) => a.id === id);
}

export function createAccount(data: {
  username: string;
  password: string;
  displayName: string;
  createdBy: string;
}): { ok: true; account: Account } | { ok: false; error: string } {
  const store = getStore();
  if (store.find((a) => a.username.toLowerCase() === data.username.toLowerCase())) {
    return { ok: false, error: "Tên đăng nhập đã tồn tại" };
  }
  const account: Account = {
    id: `staff_${Date.now()}`,
    username: data.username,
    passwordHash: hashPassword(data.password),
    displayName: data.displayName,
    role: "staff",
    createdAt: new Date().toISOString(),
    createdBy: data.createdBy,
    active: true,
  };
  store.push(account);
  return { ok: true, account };
}

export function deleteAccount(
  id: string
): { ok: true } | { ok: false; error: string } {
  const store = getStore();
  const idx = store.findIndex((a) => a.id === id);
  if (idx === -1) return { ok: false, error: "Không tìm thấy tài khoản" };
  if (store[idx].role === "superadmin")
    return { ok: false, error: "Không thể xóa tài khoản Admin gốc" };
  store.splice(idx, 1);
  return { ok: true };
}

export function changePassword(
  id: string,
  newPassword: string
): { ok: true } | { ok: false; error: string } {
  const store = getStore();
  const acc = store.find((a) => a.id === id);
  if (!acc) return { ok: false, error: "Không tìm thấy tài khoản" };
  acc.passwordHash = hashPassword(newPassword);
  return { ok: true };
}
