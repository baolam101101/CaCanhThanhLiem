"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import type { Product } from "@/types";

export function ProductDetailClient({ product }: { product: Product }) {
  const isOut = product.status === "out_of_stock";

  // Ready for real Supabase-backed image arrays. Until then we render
  // a fixed set of neutral placeholder slots (not numbers, not emoji,
  // not the product name) that visually resemble real photo thumbnails.
  const images = (product as { images?: string[] }).images ?? [];
  const slotCount = 4;
  const [activeIdx, setActiveIdx] = useState(0);
  const activeImage = images[activeIdx];

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
      {/* Left: Image gallery */}
      <div>
        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lifted mb-4"
          style={{ background: "linear-gradient(135deg,#f4f9e8,#deeeb8)" }}>
          {activeImage ? (
            <img src={activeImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon size={56} className="text-brand-300" aria-hidden />
            </div>
          )}
          {isOut && (
            <div className="absolute inset-0 bg-surface-800/20 flex items-center justify-center">
              <span className="bg-surface-800 text-white px-4 py-2 rounded-full text-sm font-semibold">Tạm hết hàng</span>
            </div>
          )}
        </div>

        {/* Thumbnails — realistic photo-style placeholders, no numbers/emoji */}
        <div className="flex gap-3">
          {Array.from({ length: slotCount }).map((_, i) => {
            const thumbUrl = images[i];
            const isActive = i === activeIdx;
            return (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                className={cn(
                  "relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                  isActive ? "border-brand-400" : "border-surface-200 opacity-60 hover:opacity-100 hover:border-brand-300"
                )}
              >
                {thumbUrl ? (
                  <img src={thumbUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#f4f9e8,#deeeb8)" }}
                  >
                    <ImageIcon size={16} className="text-brand-300" aria-hidden />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Info */}
      <div className="flex flex-col gap-5">
        {/* Category + badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link href={`/products?category=${product.categorySlug}`} className="text-[11px] font-bold tracking-widest uppercase hover:opacity-70 transition-opacity" style={{ color: "#8fb82a" }}>
            {product.category}
          </Link>
          {product.tags.includes("new")      && <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#739620" }}>Mới về</span>}
          {product.tags.includes("featured") && <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-orange-500">Nổi bật</span>}
        </div>

        {/* Name */}
        <div>
          <h1 className="font-display font-light text-surface-800 leading-tight" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>
            {product.name}
          </h1>
          {/* Availability */}
          <div className="flex items-center gap-2 mt-3">
            <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", isOut ? "text-surface-500" : "text-green-600")}>
              <span className={cn("w-2 h-2 rounded-full", isOut ? "bg-surface-400" : "bg-green-500 animate-pulse")} aria-hidden />
              {isOut ? "Tạm hết hàng" : "Còn hàng"}
            </span>
            <span className="text-surface-300">·</span>
            <span className="text-sm text-surface-400">Mã SP: {product.id.padStart(4,"0")}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-base text-surface-600 leading-loose">{product.description}</p>
        {product.longDescription && (
          <p className="text-sm text-surface-500 leading-loose">{product.longDescription}</p>
        )}

        {/* Price notice */}
        <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ backgroundColor: "#f6fbea", borderColor: "#d4eba3" }}>
          <span className="text-xl mt-0.5" aria-hidden></span>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#739620" }}>Giá theo thỏa thuận</p>
            <p className="text-sm leading-relaxed" style={{ color: "#8fb82a" }}>
              Liên hệ trực tiếp để được báo giá tốt nhất và tư vấn chọn cá phù hợp.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={SITE_CONFIG.phoneHref}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-base font-semibold text-surface-900 shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#A8CF36" }}>
            <Phone size={18} aria-hidden /> Gọi hỏi giá ngay
          </a>
          <a href={SITE_CONFIG.zalo} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-base font-semibold bg-[#0068FF] text-white hover:bg-blue-700 transition-colors">
            <MessageCircle size={18} aria-hidden /> Chat Zalo
          </a>
        </div>

        {/* Contact line */}
        <div className="flex items-center gap-4 pt-4 border-t border-surface-100 flex-wrap text-sm">
          <span className="text-surface-400">Hotline:</span>
          <a href={SITE_CONFIG.phoneHref} className="font-semibold hover:underline" style={{ color: "#739620" }}>{SITE_CONFIG.phone}</a>
          <span className="text-surface-300">·</span>
          <a href={`tel:${SITE_CONFIG.phone2.replace(/\s/g,"")}`} className="font-semibold hover:underline" style={{ color: "#739620" }}>{SITE_CONFIG.phone2}</a>
        </div>
      </div>
    </div>
  );
}
