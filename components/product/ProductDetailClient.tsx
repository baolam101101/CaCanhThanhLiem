"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, ImageIcon, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import type { Product } from "@/types";

export function ProductDetailClient({ product }: { product: Product }) {
  const isOut = product.status === "out_of_stock";

  // Photos and videos from product_media, primary first.
  const media = product.media ?? [];
  const [activeIdx, setActiveIdx] = useState(0);
  const active = media[activeIdx];

  // Short, readable product code: UUIDs are cut to 8 characters.
  const productCode = product.id.length > 8 ? product.id.slice(0, 8).toUpperCase() : product.id.padStart(4, "0");

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
      {/* Left: Media gallery */}
      <div>
        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lifted mb-4"
          style={{ background: "linear-gradient(135deg,#f4f9e8,#deeeb8)" }}>
          {active?.type === "video" ? (
            <video key={active.id} src={active.url} controls playsInline preload="metadata"
              className="absolute inset-0 w-full h-full object-contain bg-black" />
          ) : active ? (
            <img src={active.url} alt={active.alt || product.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon size={56} className="text-brand-300" aria-hidden />
            </div>
          )}
          {isOut && active?.type !== "video" && (
            <div className="absolute inset-0 bg-surface-800/20 flex items-center justify-center pointer-events-none">
              <span className="bg-surface-800 text-white px-4 py-2 rounded-full text-sm font-semibold">Tạm hết hàng</span>
            </div>
          )}
        </div>

        {media.length > 1 && (
          <div className="flex gap-3 flex-wrap">
            {media.map((m, i) => {
              const isActive = i === activeIdx;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveIdx(i)}
                  aria-label={m.type === "video" ? `Xem video ${i + 1}` : `Xem ảnh ${i + 1}`}
                  aria-pressed={isActive}
                  className={cn(
                    "relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-surface-100",
                    isActive ? "border-brand-400" : "border-surface-200 opacity-60 hover:opacity-100 hover:border-brand-300"
                  )}
                >
                  {m.type === "video" ? (
                    <>
                      <video src={`${m.url}#t=0.1`} preload="metadata" muted playsInline
                        className="absolute inset-0 w-full h-full object-cover" aria-hidden />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <Play size={16} className="text-white" aria-hidden />
                      </span>
                    </>
                  ) : (
                    <img src={m.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Info */}
      <div className="flex flex-col gap-5">
        {/* Category + badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link href={`/products?category=${product.categorySlug}`} className="text-[11px] font-bold tracking-widest uppercase hover:opacity-70 transition-opacity" style={{ color: "#8fb82a" }}>
            {product.category}
          </Link>
          {product.tags.includes("new")      && <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#739620" }}>Mới về</span>}
          {product.tags.includes("featured") && <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white bg-orange-500">⭐ Nổi bật</span>}
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
            <span className="text-sm text-surface-400">Mã SP: {productCode}</span>
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
        </div>
      </div>
    </div>
  );
}
