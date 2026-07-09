"use client";

import React, { useState } from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import { BackToTop } from "@/components/shared/BackToTop";

export function FloatingActions() {
  const [hovered, setHovered] = useState<"zalo" | "fb" | "phone" | null>(null);

  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3" role="complementary" aria-label="Liên hệ nhanh">
      {/* Back to top — sits above the contact buttons, never overlaps them */}
      <BackToTop />

      {/* Zalo */}
      <div className="relative flex items-center justify-end">
        {hovered === "zalo" && (
          <span className="absolute right-14 bg-surface-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-float animate-fade-in">
            Chat Zalo
          </span>
        )}
        <a
          href={SITE_CONFIG.zalo} target="_blank" rel="noopener noreferrer"
          aria-label="Chat Zalo"
          onMouseEnter={() => setHovered("zalo")}
          onMouseLeave={() => setHovered(null)}
          className="w-12 h-12 rounded-full bg-[#0068FF] text-white font-bold text-lg flex items-center justify-center shadow-float hover:scale-110 transition-all duration-200 animate-pulse-ring"
        >Z</a>
      </div>

      {/* Facebook */}
      <div className="relative flex items-center justify-end">
        {hovered === "fb" && (
          <span className="absolute right-14 bg-surface-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-float animate-fade-in">
            Facebook
          </span>
        )}
        <a
          href={SITE_CONFIG.facebook} target="_blank" rel="noopener noreferrer"
          aria-label="Facebook"
          onMouseEnter={() => setHovered("fb")}
          onMouseLeave={() => setHovered(null)}
          className="w-12 h-12 rounded-full bg-[#1877F2] text-white font-bold text-lg flex items-center justify-center shadow-float hover:scale-110 transition-all duration-200"
        >f</a>
      </div>

      {/* Phone */}
      <div className="relative flex items-center justify-end">
        {hovered === "phone" && (
          <span className="absolute right-14 bg-surface-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-float animate-fade-in">
            {SITE_CONFIG.phone}
          </span>
        )}
        <a
          href={SITE_CONFIG.phoneHref}
          aria-label="Gọi điện"
          onMouseEnter={() => setHovered("phone")}
          onMouseLeave={() => setHovered(null)}
          style={{ backgroundColor: "#A8CF36" }}
          className="w-12 h-12 rounded-full text-surface-900 flex items-center justify-center shadow-float hover:scale-110 transition-all duration-200"
        >
          <Phone size={20} aria-hidden />
        </a>
      </div>
    </div>
  );
}
