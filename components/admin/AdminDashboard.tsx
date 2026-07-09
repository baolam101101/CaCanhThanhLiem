import React from "react";
import Link from "next/link";
import { Fish, Star, Video, Images, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types";

interface AdminDashboardProps {
  stats: {
    totalProducts: number;
    availableProducts: number;
    featuredProducts: number;
    newArrivals: number;
  };
  recentProducts: Product[];
  role: string;
}

export function AdminDashboard({ stats, recentProducts, role }: AdminDashboardProps) {
  const isSuperAdmin = role === "superadmin";

  const STAT_CARDS = [
    { label: "Tổng sản phẩm",  value: stats.totalProducts,     icon: Fish,   color: "#A8CF36",   bg: "#f6fbea" },
    { label: "Còn hàng",       value: stats.availableProducts,  icon: Fish,   color: "#22c55e",   bg: "#f0fdf4" },
    { label: "Nổi bật",        value: stats.featuredProducts,   icon: Star,   color: "#f97316",   bg: "#fff7ed" },
    { label: "Mới về",         value: stats.newArrivals,        icon: Plus,   color: "#8b5cf6",   bg: "#f5f3ff" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-light text-surface-800">Tổng quan</h1>
        <p className="text-sm text-surface-400 mt-1">
          {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-surface-200 p-4 md:p-5 shadow-card hover:shadow-lifted transition-shadow">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: card.bg }}>
                <Icon size={17} style={{ color: card.color }} aria-hidden />
              </div>
              <div className="font-display text-3xl font-light mb-1" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="text-xs text-surface-500 font-medium">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions + recent products */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5">
          <h2 className="font-semibold text-surface-800 mb-4 text-sm">Thao tác nhanh</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href: "/admin/products", icon: Fish,   label: "Quản lý sản phẩm" },
              { href: "/admin/videos",   icon: Video,  label: "Quản lý video" },
              { href: "/admin/banners",  icon: Images, label: "Quản lý banner" },
              ...(isSuperAdmin ? [{ href: "/admin/accounts", icon: Users, label: "Tài khoản" }] : []),
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-all text-center group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: "#f6fbea" }}>
                    <Icon size={18} style={{ color: "#739620" }} />
                  </div>
                  <span className="text-xs font-medium text-surface-700 leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent products */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <h2 className="font-semibold text-surface-800 text-sm">Sản phẩm gần đây</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/products" className="text-xs">Xem tất cả</Link>
            </Button>
          </div>
          <ul role="list">
            {recentProducts.map((p, i) => (
              <li key={p.id}
                className={`flex items-center gap-3 px-5 py-3.5 ${i < recentProducts.length - 1 ? "border-b border-surface-50" : ""}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: "#f6fbea" }}>
                  {p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800 truncate">{p.name}</p>
                  <p className="text-xs text-surface-400 truncate">{p.category}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  p.status === "available" ? "bg-green-50 text-green-700" : "bg-surface-100 text-surface-500"
                }`}>
                  {p.status === "available" ? "Còn" : "Hết"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
