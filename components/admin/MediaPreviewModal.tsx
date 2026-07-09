"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X, ZoomIn, ZoomOut, Play, Pause, Maximize, Trash2, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PreviewMedia {
  type: "image" | "video";
  src: string;
  name?: string;
}

interface MediaPreviewModalProps {
  media: PreviewMedia;
  onClose: () => void;
  onReplace?: () => void;
  onDelete?: () => void;
}

export function MediaPreviewModal({ media, onClose, onReplace, onDelete }: MediaPreviewModalProps) {
  // ── Image zoom state ──
  const [zoom, setZoom] = useState(1);
  const imgWrapRef = useRef<HTMLDivElement>(null);

  // ── Video state ──
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [duration, setDuration] = useState(0);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Video control handlers ──
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }, []);

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  }, []);

  const onLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (v) setDuration(v.duration);
  }, []);

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = Number(e.target.value);
    v.currentTime = (pct / 100) * v.duration;
    setProgress(pct);
  }, []);

  const enterFullscreen = useCallback(() => {
    videoRef.current?.requestFullscreen?.();
  }, []);

  const formatTime = (sec: number) => {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={media.name ?? "Xem trước media"}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10">
        <p className="text-white text-sm font-medium truncate max-w-[60%]">{media.name ?? ""}</p>
        <div className="flex items-center gap-2">
          {onReplace && (
            <button
              onClick={onReplace}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <Upload size={14} aria-hidden /> Đổi
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-medium transition-colors"
            >
              <Trash2 size={14} aria-hidden /> Xóa
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Đóng"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
      </div>

      {/* Content */}
      {media.type === "image" ? (
        <>
          <div
            ref={imgWrapRef}
            className="relative max-w-[92vw] max-h-[80vh] overflow-auto rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={media.src}
              alt={media.name ?? ""}
              style={{
                width: `${zoom * 100}%`,
                maxWidth: zoom === 1 ? "92vw" : "none",
                transition: "width 0.15s ease",
              }}
              className="block"
            />
          </div>
          {/* Zoom controls */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-3 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Thu nhỏ"
            >
              <ZoomOut size={16} aria-hidden />
            </button>
            <span className="text-white text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Phóng to"
            >
              <ZoomIn size={16} aria-hidden />
            </button>
          </div>
        </>
      ) : (
        <div
          className="relative max-w-[92vw] max-h-[80vh] w-full sm:w-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <video
            ref={videoRef}
            src={media.src}
            className="max-w-[92vw] max-h-[70vh] rounded-lg bg-black"
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onClick={togglePlay}
            playsInline
          />

          {/* Custom controls bar */}
          <div className="mt-3 bg-black/60 rounded-xl px-4 py-3 flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
              aria-label={playing ? "Tạm dừng" : "Phát"}
            >
              {playing
                ? <Pause size={16} className="text-surface-900" aria-hidden />
                : <Play size={16} className="text-surface-900 ml-0.5" aria-hidden />
              }
            </button>

            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={seek}
              className="flex-1 accent-brand-400"
              aria-label="Tiến trình video"
            />

            <span className="text-white text-xs font-mono shrink-0 w-20 text-center">
              {formatTime((progress / 100) * duration)} / {formatTime(duration)}
            </span>

            <button
              onClick={enterFullscreen}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors"
              aria-label="Toàn màn hình"
            >
              <Maximize size={15} className="text-white" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
