import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";

// ============================================================
// POST /api/contact — sends the contact form to the shop's inbox.
//
// Email goes out through Resend (https://resend.com). Env vars:
//   RESEND_API_KEY    — API key from the Resend dashboard (required)
//   CONTACT_TO_EMAIL  — the inbox that receives the messages (required)
//   RESEND_FROM       — sender, e.g. "Cá Cảnh Thanh Liêm <lienhe@cacanhthanhliem.vn>"
//                       (optional; defaults to Resend's test sender, which
//                       can only deliver to the Resend account's own email)
// ============================================================

const SUBJECTS = ["Hỏi về cá Koi", "Yêu cầu báo giá", "Tư vấn hồ cá", "Hỏi về phụ kiện", "Khiếu nại / Góp ý", "Khác"];

// Light per-instance throttle against form spam: 5 messages / 10 min / IP.
// Serverless instances don't share memory, so this is a speed bump, not a wall.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const field = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const FALLBACK = `Chưa gửi được tin nhắn. Vui lòng gọi ${SITE_CONFIG.phone} hoặc nhắn Zalo để được hỗ trợ ngay.`;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  // Honeypot: a field hidden from people. Bots fill it; pretend success.
  if (field(body.website, 200)) return NextResponse.json({ ok: true });

  const name    = field(body.name, 100);
  const phone   = field(body.phone, 30);
  const subject = SUBJECTS.includes(field(body.subject, 50)) ? field(body.subject, 50) : "Khác";
  const message = field(body.message, 5000);

  if (!name)    return NextResponse.json({ error: "Vui lòng nhập họ tên" }, { status: 400 });
  if (!/^\+?[\d\s.()-]{8,20}$/.test(phone) || phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
  }
  if (!message) return NextResponse.json({ error: "Vui lòng nhập nội dung" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (throttled(ip)) {
    return NextResponse.json({ error: "Bạn đã gửi quá nhiều tin nhắn, vui lòng thử lại sau ít phút" }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || apiKey.startsWith("re_your") || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not configured");
    return NextResponse.json({ error: FALLBACK }, { status: 503 });
  }

  const sentAt = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const text =
    `Tin nhắn mới từ form liên hệ trên website\n\n` +
    `Họ tên: ${name}\nSố điện thoại: ${phone}\nChủ đề: ${subject}\nThời gian: ${sentAt}\n\n` +
    `Nội dung:\n${message}\n`;
  const html =
    `<h2 style="margin:0 0 12px">Tin nhắn mới từ website</h2>` +
    `<table cellpadding="6" style="border-collapse:collapse;font-size:14px">` +
    `<tr><td><b>Họ tên</b></td><td>${escapeHtml(name)}</td></tr>` +
    `<tr><td><b>Số điện thoại</b></td><td><a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a></td></tr>` +
    `<tr><td><b>Chủ đề</b></td><td>${escapeHtml(subject)}</td></tr>` +
    `<tr><td><b>Thời gian</b></td><td>${escapeHtml(sentAt)}</td></tr>` +
    `</table>` +
    `<p style="margin:16px 0 4px"><b>Nội dung:</b></p>` +
    `<p style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Cá Cảnh Thanh Liêm <onboarding@resend.dev>",
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        subject: `[Website] ${subject} — ${name}`,
        text,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[contact] Resend rejected the email:", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ error: FALLBACK }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] Resend request failed:", err);
    return NextResponse.json({ error: FALLBACK }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
