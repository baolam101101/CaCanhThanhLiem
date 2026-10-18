"use client";

import React from "react";
import Link from "next/link";
import { Phone, ImageIcon } from "lucide-react";
import { cn, getPrimaryImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const isOut = product.status === "out_of_stock";
  // Primary photo from product_media; a neutral placeholder icon when the
  // product has no photo yet — never the product name/initial.
  const imageUrl = getPrimaryImageUrl(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group flex flex-col h-full bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-card",
        "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float hover:border-brand-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      )}
    >
      {/* Image — square on phones, where cards sit two to a row */}
      <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden"
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
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col items-start gap-1 sm:gap-1.5">
          {product.tags.includes("new")      && <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-white" style={{ backgroundColor: "#739620" }}>Mới về</span>}
          {product.tags.includes("featured") && <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-white bg-orange-500">⭐ Nổi bật</span>}
          {isOut                             && <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-white bg-surface-500">Hết hàng</span>}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <p className="text-[10px] font-bold tracking-widest uppercase mb-1 sm:mb-1.5 truncate" style={{ color: "#8fb82a" }}>
          {product.category}
        </p>
        <h3 className="font-display text-[15px] sm:text-lg md:text-xl font-light text-surface-800 mb-2 sm:mb-2.5 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2 min-h-[2.5em] sm:min-h-0">
          {product.name}
        </h3>
        <p className="hidden sm:block text-sm text-surface-500 leading-relaxed line-clamp-2 mb-4">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between sm:pt-3 sm:border-t border-surface-100">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-surface-400">
            <span className={cn("w-1.5 h-1.5 rounded-full", isOut ? "bg-surface-300" : "bg-green-400")} aria-hidden />
            {isOut ? "Liên hệ hỏi hàng" : "Liên hệ để biết giá"}
          </span>
          <span className="flex items-center justify-center gap-1 text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-lg text-surface-900 w-full sm:w-auto" style={{ backgroundColor: "#A8CF36" }}>
            <Phone size={11} aria-hidden /> Hỏi ngay
          </span>
        </div>
      </div>
    </Link>
  );
}
