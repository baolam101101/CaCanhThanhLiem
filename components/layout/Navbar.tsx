"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrolled } from "@/hooks/useScrolled";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";

export function Navbar() {
  const scrolled              = useScrolled(10);
  const pathname               = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Whether an admin session is currently active — drives the
  // conditional "Quản trị" link (Issue #5). Checked via a lightweight
  // session-presence endpoint rather than reading cookies directly,
  // since the session cookie is httpOnly and unreadable from client JS.
  const [isAdmin,    setIsAdmin]    = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setIsAdmin(!!data.loggedIn); })
      .catch(() => { if (!cancelled) setIsAdmin(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b",
        scrolled ? "border-surface-200 shadow-sm" : "border-surface-100"
      )}>
        <div className="container-site">
          <div className="flex items-center justify-between" style={{ height: 60 }}>

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 group min-w-0 shrink" aria-label="Cá Cảnh Thanh Liêm">
              <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
                <Image src="/images/logo.jpg" alt="Logo" fill
                  className="object-cover rounded-full border-2 group-hover:border-brand-400 transition-colors"
                  style={{ borderColor: "#A8CF36" }} sizes="40px" priority />
              </div>
              {/* Brand text — always visible, truncate on very small screens */}
              <div className="flex flex-col leading-none min-w-0">
                <span className="font-display font-semibold text-surface-800 group-hover:text-brand-700 transition-colors leading-tight truncate"
                  style={{ fontSize: "clamp(13px,3.5vw,18px)" }}>
                  Cá Cảnh Thanh Liêm
                </span>
                <span className="font-semibold tracking-wider uppercase hidden sm:block mt-0.5"
                  style={{ fontSize: 10, color: "#8fb82a" }}>
                  Koi Việt · Nhập Khẩu
                </span>
              </div>
            </Link>

            {/* ── Desktop nav ── */}
            {/* Products link is a plain link straight to /products — no
                dropdown/mega-menu (Issue #6 removed it entirely). */}
            <nav className="hidden md:flex items-center gap-0.5 shrink-0" aria-label="Menu chính">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link key={link.href} href={link.href}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                      "hover:bg-brand-50 hover:text-brand-700",
                      active ? "text-brand-700 bg-brand-50" : "text-surface-600"
                    )}>
                    {link.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link href="/admin"
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ml-1",
                    "text-surface-900 hover:opacity-90"
                  )}
                  style={{ backgroundColor: "#A8CF36" }}
                >
                  <ShieldCheck size={14} aria-hidden /> Quản trị
                </Link>
              )}
            </nav>

            {/* ── Right actions ── */}
            <div className="flex items-center gap-2 shrink-0">
              <a href={SITE_CONFIG.phoneHref}
                className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-surface-900 hover:opacity-90 transition-opacity shadow-sm"
                style={{ backgroundColor: "#A8CF36" }}>
                <Phone size={14} aria-hidden /> {SITE_CONFIG.phone}
              </a>
              <button onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden p-2.5 rounded-xl hover:bg-surface-100 transition-colors"
                aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={mobileOpen}>
                {mobileOpen ? <X size={22} className="text-surface-700" /> : <Menu size={22} className="text-surface-700" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu — same flat link list as desktop, no dropdown ── */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out bg-white border-t border-surface-100",
          mobileOpen ? "max-h-screen" : "max-h-0"
        )}>
          <nav className="container-site py-3 pb-6 flex flex-col gap-0.5 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 60px)" }}>
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-colors",
                    active ? "bg-brand-50 text-brand-700" : "text-surface-700 hover:bg-surface-50"
                  )}>
                  {link.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-surface-900 mt-1"
                style={{ backgroundColor: "#A8CF36" }}>
                <ShieldCheck size={15} aria-hidden /> Quản trị
              </Link>
            )}
            <div className="mt-3 pt-3 border-t border-surface-100">
              <a href={SITE_CONFIG.phoneHref}
                className="flex items-center justify-center gap-2 mx-1 py-3.5 rounded-xl text-sm font-semibold text-surface-900"
                style={{ backgroundColor: "#A8CF36" }}>
                <Phone size={15} /> {SITE_CONFIG.phone} · {SITE_CONFIG.phone2}
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: 60 }} aria-hidden />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden />
      )}
    </>
  );
}
