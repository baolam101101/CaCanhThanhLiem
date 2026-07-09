"use client";

import React from "react";
import Link from "next/link";
import { Phone, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const isOut = product.status === "out_of_stock";
  // Ready for real images: when product.primaryImageUrl (or similar
  // Supabase-backed field) exists, render it; otherwise show a
  // neutral image-placeholder icon — never the product name/initial.
  const imageUrl = (product as { primaryImageUrl?: string }).primaryImageUrl;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group block bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-card",
        "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float hover:border-brand-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden"
        style={{ background: "linear-gradient(135deg,#f4f9e8,#deeeb8)" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon size={32} className="text-brand-300" aria-hidden />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.tags.includes("new")      && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: "#739620" }}>Mới về</span>}
          {product.tags.includes("featured") && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-orange-500">Nổi bật</span>}
          {isOut                             && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-surface-500">Hết hàng</span>}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#8fb82a" }}>
          {product.category}
        </p>
        <h3 className="font-display text-lg md:text-xl font-light text-surface-800 mb-2.5 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-surface-500 leading-relaxed line-clamp-2 mb-4">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-surface-100">
          <span className="flex items-center gap-1.5 text-xs text-surface-400">
            <span className={cn("w-1.5 h-1.5 rounded-full", isOut ? "bg-surface-300" : "bg-green-400")} aria-hidden />
            {isOut ? "Liên hệ hỏi hàng" : "Liên hệ để biết giá"}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-surface-900" style={{ backgroundColor: "#A8CF36" }}>
            <Phone size={11} aria-hidden /> Hỏi ngay
          </span>
        </div>
      </div>
    </Link>
  );
}
