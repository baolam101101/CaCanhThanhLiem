"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { computeCroppedImageStyle } from "@/components/admin/ImageCropTool";

export interface SlideData {
  id: string;
  imageDataUrl?: string;
  objectPositionX?: number;
  objectPositionY?: number;
  zoom?: number;
}

const AUTOPLAY_MS = 4500;
const SWIPE_MIN   = 40;
const ANIM_MS     = 480;

interface Props { slides?: SlideData[]; }

export function HeroBannerSlider({ slides }: Props) {
  const SLIDES = slides ?? [];
  const total  = SLIDES.length;

  const [cur,    setCur]    = useState(0);
  const [prev,   setPrev]   = useState<number | null>(null);
  const [dir,    setDir]    = useState<"next" | "prev">("next");
  const [anim,   setAnim]   = useState(false);
  const [paused, setPaused] = useState(false);
  const [drag,   setDrag]   = useState(0);

  const curRef    = useRef(cur);
  const animRef   = useRef(anim);
  const pausedRef = useRef(paused);
  const totalRef  = useRef(total);
  useEffect(() => { curRef.current = cur; }, [cur]);
  useEffect(() => { animRef.current = anim; }, [anim]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { totalRef.current = total; }, [total]);

  const touchX    = useRef<number | null>(null);
  const touchY    = useRef<number | null>(null);
  const dragging  = useRef(false);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const animTORef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAnimTimeout = useCallback(() => {
    if (animTORef.current) { clearTimeout(animTORef.current); animTORef.current = null; }
  }, []);

  const goTo = useCallback((idx: number, d: "next" | "prev") => {
    if (animRef.current || totalRef.current <= 1) return;
    clearAnimTimeout();
    const nextIdx = (idx + totalRef.current) % totalRef.current;
    setDir(d); setPrev(curRef.current); setCur(nextIdx); setAnim(true);
    animTORef.current = setTimeout(() => { setPrev(null); setAnim(false); }, ANIM_MS);
  }, [clearAnimTimeout]);

  const goNext = useCallback(() => goTo(curRef.current + 1, "next"), [goTo]);
  const goPrev = useCallback(() => goTo(curRef.current - 1, "prev"), [goTo]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);
  const startAutoplay = useCallback(() => {
    stopAutoplay();
    if (totalRef.current <= 1) return;
    timerRef.current = setInterval(() => { if (!pausedRef.current) goNext(); }, AUTOPLAY_MS);
  }, [stopAutoplay, goNext]);

  useEffect(() => {
    startAutoplay();
    return () => { stopAutoplay(); clearAnimTimeout(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (totalRef.current <= 1) return;
    touchX.current = e.touches[0].clientX; touchY.current = e.touches[0].clientY;
    dragging.current = true; setDrag(0); setPaused(true);
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging.current || touchX.current === null || touchY.current === null) return;
    const dx = e.touches[0].clientX - touchX.current;
    const dy = Math.abs(e.touches[0].clientY - touchY.current);
    if (dy > Math.abs(dx) * 1.5) { dragging.current = false; setDrag(0); return; }
    e.preventDefault(); setDrag(dx);
  }, []);
  const onTouchEnd = useCallback(() => {
    if (!dragging.current) { setPaused(false); return; }
    const d = drag; dragging.current = false; setDrag(0);
    if (Math.abs(d) >= SWIPE_MIN) { d < 0 ? goNext() : goPrev(); }
    setTimeout(() => setPaused(false), 700);
  }, [drag, goNext, goPrev]);

  const slideStyle = (i: number): React.CSSProperties => {
    const isC = i === cur, isP = i === prev;
    let tx = i < cur ? "-100%" : "100%";
    if (isC) tx = "0%";
    if (isP && anim) tx = dir === "next" ? "-100%" : "100%";
    const live = drag !== 0 && isC;
    return {
      transform: live ? `translateX(${drag}px)` : `translateX(${tx})`,
      transition: (isC || isP) && anim && drag === 0 ? `transform ${ANIM_MS}ms cubic-bezier(0.4,0,0.2,1)` : "none",
      zIndex: isC ? 2 : isP ? 1 : 0,
      willChange: "transform",
    };
  };

  if (total === 0) {
    return (
      <div className="relative overflow-hidden flex items-center justify-center"
        style={{ height: "clamp(160px,30vw,280px)", background: "linear-gradient(135deg,#A8CF36 0%,#557318 100%)" }}>
        <div className="flex flex-col items-center gap-2 text-center px-6">
          <ImageIcon size={28} className="text-white/70" aria-hidden />
          <p className="font-display font-semibold text-white" style={{ fontSize: "clamp(1rem,3vw,1.5rem)" }}>Ca Canh Thanh Liem</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-surface-100 select-none"
      style={{ height: "clamp(160px,30vw,280px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      aria-roledescription="carousel">
      {SLIDES.map((s, i) => (
        <div key={s.id} className="absolute inset-0" style={slideStyle(i)} aria-hidden={i !== cur}>
          <div className="absolute inset-0 overflow-hidden bg-surface-200">
            {s.imageDataUrl && (
              <img src={s.imageDataUrl} alt="" draggable={false}
                style={computeCroppedImageStyle(s.objectPositionX ?? 50, s.objectPositionY ?? 50, s.zoom ?? 1)} />
            )}
          </div>
        </div>
      ))}
      {total > 1 && (
        <>
          <button onClick={goPrev} aria-label="Slide truoc"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 text-white items-center justify-center transition-colors backdrop-blur-sm">
            <ChevronLeft size={16} aria-hidden />
          </button>
          <button onClick={goNext} aria-label="Slide tiep theo"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 text-white items-center justify-center transition-colors backdrop-blur-sm">
            <ChevronRight size={16} aria-hidden />
          </button>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => goTo(i, i > cur ? "next" : "prev")} aria-label={`Slide ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{ width: i===cur?18:6, height: 6, backgroundColor: i===cur?"white":"rgba(255,255,255,0.45)" }} />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10 z-20 overflow-hidden">
            <div key={`${cur}-${paused}`} className="h-full bg-white/60"
              style={{ width:"0%", animation: !paused ? `sliderProgress ${AUTOPLAY_MS}ms linear forwards` : "none" }} />
          </div>
        </>
      )}
      <style jsx>{`@keyframes sliderProgress{from{width:0%}to{width:100%}}`}</style>
    </div>
  );
}
