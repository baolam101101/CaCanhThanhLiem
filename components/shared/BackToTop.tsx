"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";

const SHOW_AFTER_PX = 480;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      onClick={scrollToTop}
      aria-label="Lên đầu trang"
      className={`w-11 h-11 rounded-full bg-surface-800 text-white flex items-center justify-center shadow-float hover:scale-110 hover:bg-surface-900 transition-all duration-200 ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ArrowUp size={18} aria-hidden />
    </button>
  );
}
