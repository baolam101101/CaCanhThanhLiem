import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AccountRole } from "./accounts";

export const SESSION_COOKIE = "tl_admin_session";
export const MAX_AGE = 60 * 60 * 8; // 8 hours

// Safe ASCII-only secret — no Unicode characters
const RAW_SECRET =
  process.env.SESSION_SECRET ??
  "tl_cacanh_secret_2025_ASCII_only_safe_key_abcdefgh";

// Always encode using Buffer to guarantee pure ASCII bytes
const SECRET = new Uint8Array(
  Buffer.from(RAW_SECRET.replace(/[^\x00-\x7F]/g, "_"), "ascii")
);

export interface SessionPayload {
  id: string;
  username: string;
  // NOTE: displayName stored as base64 to avoid Unicode issues in JWT header
  displayNameB64: string;
  role: AccountRole;
}

function b64Encode(str: string): string {
  return Buffer.from(str, "utf8").toString("base64");
}

function b64Decode(b64: string): string {
  try {
    return Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return b64;
  }
}

export async function createSession(data: {
  id: string;
  username: string;
  displayName: string;
  role: AccountRole;
}): Promise<string> {
  const payload: SessionPayload = {
    id: data.id,
    username: data.username,
    displayNameB64: b64Encode(data.displayName),
    role: data.role,
  };

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);
}

export async function verifySession(
  token: string
): Promise<(SessionPayload & { displayName: string }) | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const p = payload as unknown as SessionPayload;
    return {
      ...p,
      displayName: b64Decode(p.displayNameB64 ?? ""),
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<
  (SessionPayload & { displayName: string }) | null
> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
