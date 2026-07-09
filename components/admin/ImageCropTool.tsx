"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCropToolProps {
  src: string;
  posX: number;
  posY: number;
  zoom: number;
  aspectRatio: string;
  onPosX: (v: number) => void;
  onPosY: (v: number) => void;
  onZoom: (v: number) => void;
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.1;

export function ImageCropTool({ src, posX, posY, zoom, aspectRatio, onPosX, onPosY, onZoom }: ImageCropToolProps) {
  const frameRef  = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  const onImgLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  useEffect(() => { setNatural(null); }, [src]);

  const getOverflow = useCallback((): { x: boolean; y: boolean } | null => {
    if (!natural || !frameRef.current) return null;
    const { width: fw, height: fh } = frameRef.current.getBoundingClientRect();
    if (fw === 0 || fh === 0) return null;
    const coverScale = Math.max(fw / natural.w, fh / natural.h);
    const cw = natural.w * coverScale * Math.max(1, zoom);
    const ch = natural.h * coverScale * Math.max(1, zoom);
    const EPS = 0.5;
    return { x: cw - fw > EPS, y: ch - fh > EPS };
  }, [natural, zoom]);

  const applyDrag = useCallback((sdx: number, sdy: number) => {
    if (!dragStart.current || !frameRef.current || !natural) return;
    const { width: fw, height: fh } = frameRef.current.getBoundingClientRect();
    const coverScale = Math.max(fw / natural.w, fh / natural.h);
    const z = Math.max(1, zoom);
    const overX = natural.w * coverScale * z - fw;
    const overY = natural.h * coverScale * z - fh;
    const nx = overX > 0 ? Math.max(0, Math.min(100, dragStart.current.px - (sdx / overX) * 100)) : 50;
    const ny = overY > 0 ? Math.max(0, Math.min(100, dragStart.current.py - (sdy / overY) * 100)) : 50;
    onPosX(nx); onPosY(ny);
  }, [natural, zoom, onPosX, onPosY]);

  const onMD = (e: React.MouseEvent) => { e.preventDefault(); dragStart.current = { x: e.clientX, y: e.clientY, px: posX, py: posY }; };
  const onMM = useCallback((e: MouseEvent) => { if (!dragStart.current) return; applyDrag(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y); }, [applyDrag]);
  const onMU = useCallback(() => { dragStart.current = null; }, []);
  const onTS = (e: React.TouchEvent) => { dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, px: posX, py: posY }; };
  const onTM = useCallback((e: TouchEvent) => { if (!dragStart.current) return; e.preventDefault(); applyDrag(e.touches[0].clientX - dragStart.current.x, e.touches[0].clientY - dragStart.current.y); }, [applyDrag]);
  const onTE = useCallback(() => { dragStart.current = null; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMM); window.addEventListener("mouseup", onMU);
    window.addEventListener("touchmove", onTM, { passive: false }); window.addEventListener("touchend", onTE);
    return () => {
      window.removeEventListener("mousemove", onMM); window.removeEventListener("mouseup", onMU);
      window.removeEventListener("touchmove", onTM); window.removeEventListener("touchend", onTE);
    };
  }, [onMM, onMU, onTM, onTE]);

  const overflow = getOverflow();
  const canDrag  = !!(overflow && (overflow.x || overflow.y));

  const imgStyle: React.CSSProperties = {
    position: "absolute", inset: 0, width: "100%", height: "100%",
    objectFit: "cover", objectPosition: `${posX}% ${posY}%`,
    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
    transformOrigin: `${posX}% ${posY}%`,
    pointerEvents: "none", userSelect: "none",
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-surface-700">Xem trước và căn chỉnh</p>
        <button type="button" onClick={() => { onPosX(50); onPosY(50); onZoom(1); }} className="text-xs text-brand-600 hover:underline">Đặt lại</button>
      </div>
      <div ref={frameRef}
        className={cn("relative overflow-hidden rounded-xl border-2 border-brand-400 bg-surface-100", canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
        style={{ aspectRatio, userSelect: "none" }}
        onMouseDown={canDrag ? onMD : undefined}
        onTouchStart={canDrag ? onTS : undefined}>
        <img src={src} alt="" style={imgStyle} draggable={false} onLoad={onImgLoad} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.07) 1px,transparent 1px)", backgroundSize: "33% 33%" }} />
        {canDrag && <span className="absolute bottom-1.5 right-2 bg-black/40 text-white text-[10px] font-medium px-2 py-0.5 rounded-full pointer-events-none">Kéo để căn chỉnh</span>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onZoom(Math.max(ZOOM_MIN, +(zoom - ZOOM_STEP).toFixed(2)))}
          className="w-8 h-8 rounded-lg border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors shrink-0">
          <ZoomOut size={14} aria-hidden />
        </button>
        <input type="range" min={ZOOM_MIN * 100} max={ZOOM_MAX * 100} step={5} value={Math.round(zoom * 100)}
          onChange={(e) => onZoom(+(Number(e.target.value) / 100).toFixed(2))}
          className="flex-1 accent-brand-500" aria-label="Zoom" />
        <button type="button" onClick={() => onZoom(Math.min(ZOOM_MAX, +(zoom + ZOOM_STEP).toFixed(2)))}
          className="w-8 h-8 rounded-lg border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition-colors shrink-0">
          <ZoomIn size={14} aria-hidden />
        </button>
        <span className="text-xs font-mono text-surface-500 w-10 text-right shrink-0">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}

// Shared export — used by both the admin crop preview AND the live
// frontend render (HeroBannerSlider, NewsDetailClient). One source of
// truth guarantees admin preview == homepage output.
export function computeCroppedImageStyle(posX: number, posY: number, zoom: number): React.CSSProperties {
  const z = Math.max(1, zoom);
  return {
    position: "absolute", inset: 0, width: "100%", height: "100%",
    objectFit: "cover", objectPosition: `${posX}% ${posY}%`,
    transform: z !== 1 ? `scale(${z})` : undefined,
    transformOrigin: `${posX}% ${posY}%`,
  };
}
