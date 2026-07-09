"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Fish, Video, Images, Users, Tag, Newspaper,
  LogOut, Menu, X, ChevronRight, ChevronLeft, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  role: string;
  displayName: string;
  collapsed: boolean;
  onToggleCollapse: (value: boolean) => void;
}

function buildNav(role: string) {
  return [
    { href: "/admin",            label: "Tổng quan",    icon: LayoutDashboard, roles: ["superadmin","staff"] },
    { href: "/admin/products",   label: "Sản phẩm",     icon: Fish,            roles: ["superadmin","staff"] },
    { href: "/admin/categories", label: "Danh mục",     icon: Tag,             roles: ["superadmin","staff"] },
    { href: "/admin/news",       label: "Tin tức",      icon: Newspaper,       roles: ["superadmin","staff"] },
    { href: "/admin/videos",     label: "Video",        icon: Video,           roles: ["superadmin","staff"] },
    { href: "/admin/banners",    label: "Banner",       icon: Images,          roles: ["superadmin","staff"] },
    { href: "/admin/accounts",   label: "Tài khoản",    icon: Users,           roles: ["superadmin"] },
  ].filter((i) => i.roles.includes(role));
}

export function AdminSidebar({ role, displayName, collapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [showLogoutDlg, setShowLogoutDlg] = useState(false);
  const nav = buildNav(role);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const handleLogout = async () => {
    setShowLogoutDlg(false);        // unmount dialog/overlay first
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  // ── Nav items (shared between desktop and mobile) ──
  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {nav.map((item) => {
        const Icon   = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
              collapsed ? "justify-center px-2" : "",
              active
                ? "text-surface-900"
                : "text-white/55 hover:text-white hover:bg-white/8"
            )}
            style={active ? { backgroundColor: "#A8CF36" } : {}}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={17} aria-hidden className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && active && <ChevronRight size={13} className="ml-auto opacity-60 shrink-0" />}

            {/* Tooltip when collapsed */}
            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-surface-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-float border border-white/10">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-surface-800" />
              </div>
            )}
          </Link>
        );
      })}
    </>
  );

  // ── Desktop sidebar ──
  const DesktopSidebar = () => (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-surface-800 min-h-screen sticky top-0 h-screen shrink-0 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-56"
      )}
      aria-label="Admin navigation"
    >
      {/* Brand */}
      <div className={cn(
        "flex items-center border-b border-white/10 shrink-0 transition-all duration-300",
        collapsed ? "justify-center py-4 px-2 h-16" : "gap-3 px-4 py-4 h-16"
      )}>
        {collapsed ? (
          <div className="relative w-8 h-8 shrink-0">
            <Image src="/images/logo.jpg" alt="Logo" fill className="object-cover rounded-lg border border-white/20" sizes="32px" />
          </div>
        ) : (
          <>
            <div className="relative w-8 h-8 shrink-0">
              <Image src="/images/logo.jpg" alt="Logo" fill className="object-cover rounded-lg border border-white/20" sizes="32px" />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="font-display text-sm font-semibold text-white leading-tight truncate">Thanh Liêm</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Admin</p>
            </div>
          </>
        )}
      </div>

      {/* User badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-xl bg-white/8 flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-surface-900 shrink-0"
            style={{ backgroundColor: "#A8CF36" }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-white/40">{role === "superadmin" ? "Quản trị viên" : "Nhân viên"}</p>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center mt-3 mb-1 shrink-0" title={displayName}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-surface-900"
            style={{ backgroundColor: "#A8CF36" }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className={cn("flex-1 py-2 overflow-y-auto overflow-x-hidden", collapsed ? "px-2" : "px-3")}>
        <div className="flex flex-col gap-0.5">
          <NavItems />
        </div>
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-white/10 py-3 shrink-0 flex flex-col gap-0.5", collapsed ? "px-2" : "px-3")}>
        <Link
          href="/"
          title={collapsed ? "Xem trang web" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/8 transition-all group relative",
            collapsed && "justify-center px-2"
          )}
        >
          <Globe size={16} aria-hidden className="shrink-0" />
          {!collapsed && <span>Xem trang web</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-surface-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-float border border-white/10">
              Xem trang web
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-surface-800" />
            </div>
          )}
        </Link>
        <button
          onClick={() => setShowLogoutDlg(true)}
          title={collapsed ? "Đăng xuất" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all group relative w-full",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut size={15} aria-hidden className="shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-surface-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-float border border-white/10">
              Đăng xuất
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-surface-800" />
            </div>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => onToggleCollapse(!collapsed)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-all w-full",
            collapsed && "justify-center px-2"
          )}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {collapsed
            ? <ChevronRight size={15} aria-hidden />
            : <><ChevronLeft size={15} aria-hidden /><span>Thu gọn</span></>
          }
        </button>
      </div>
    </aside>
  );

  // ── Mobile: top bar + drawer ──
  // IMPORTANT: the spacer below the fixed top bar must live in the
  // SAME flex column as whatever follows it in the DOM render order
  // that AdminShell uses. Previously this spacer was rendered here
  // but AdminShell placed <AdminSidebar> and <main> as parallel flex
  // siblings (a horizontal flex row), so this spacer only pushed down
  // content *inside* MobileNav itself (which has nothing below it) —
  // it never affected <main>, which sits in a completely separate
  // flex branch and therefore started at y=0, hidden under the fixed
  // bar. The real fix has two parts:
  //   1) AdminShell now renders the mobile top-bar spacer as a sibling
  //      that's a *direct parent* of <main> on mobile (see AdminShell.tsx)
  //   2) This component still renders its own spacer for any standalone
  //      usage, but AdminShell is the authoritative source for layout
  //      offset to avoid the bug recurring if MobileNav is ever reused.
  const MobileNav = () => (
    <div className="md:hidden">
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-surface-800 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7">
            <Image src="/images/logo.jpg" alt="Logo" fill className="object-cover rounded-lg border border-white/20" sizes="28px" />
          </div>
          <span className="font-display text-sm text-white font-semibold">Thanh Liêm Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
        >
          {mobileOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Drawer — width: ~50% viewport, clamped between 220px and 280px */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 bg-surface-800 flex flex-col transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: "min(max(50vw, 220px), 280px)" }}
      >
        <div className="flex items-center gap-3 px-4 py-4 h-14 border-b border-white/10 shrink-0">
          <div className="relative w-7 h-7 shrink-0">
            <Image src="/images/logo.jpg" alt="Logo" fill className="object-cover rounded-lg border border-white/20" sizes="28px" />
          </div>
          <span className="font-display text-sm text-white font-semibold truncate">Thanh Liêm</span>
          <button onClick={() => setMobileOpen(false)} className="ml-auto p-1 text-white/40 hover:text-white shrink-0">
            <X size={18} aria-hidden />
          </button>
        </div>
        {/* Nav — always icon + label on mobile, never collapsed */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {nav.map((item) => {
              const Icon   = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    active ? "text-surface-900" : "text-white/55 hover:text-white hover:bg-white/8"
                  )}
                  style={active ? { backgroundColor: "#A8CF36" } : {}}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={17} aria-hidden className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {active && <ChevronRight size={13} className="ml-auto opacity-60 shrink-0" />}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="px-3 py-3 border-t border-white/10 flex flex-col gap-0.5 shrink-0">
          <Link href="/" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/8 transition-all">
            <Globe size={16} aria-hidden /> <span className="truncate">Xem trang web</span>
          </Link>
          <button onClick={() => setShowLogoutDlg(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
            <LogOut size={15} aria-hidden /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileNav />

      {/* Logout confirmation dialog */}
      {showLogoutDlg && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowLogoutDlg(false)}>
          <div className="bg-white rounded-2xl shadow-modal p-6 w-full max-w-sm animate-fade-in">
            <h2 className="font-display font-semibold text-lg text-surface-800 mb-2">Đăng xuất</h2>
            <p className="text-sm text-surface-500 mb-6">Bạn có chắc chắn muốn đăng xuất?</p>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-surface-900 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#A8CF36" }}>
                Có
              </button>
              <button
                onClick={() => setShowLogoutDlg(false)}
                className="flex-1 h-11 rounded-xl text-sm font-semibold border border-surface-200 text-surface-700 hover:bg-surface-50 transition-colors">
                Không
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
