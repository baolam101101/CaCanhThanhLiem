"use client";

import React, { useRef, useState } from "react";
import { Play, Film, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteVideo } from "@/types";

/* Gradient shown behind each video while its first frame loads. */
const GRADIENTS = [
  "from-[#A8CF36] to-[#739620]",
  "from-[#8fb82a] to-[#A8CF36]",
  "from-[#739620] to-[#bedd72]",
];

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function VideoCard({ video, index }: { video: SiteVideo; index: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // Read from the file itself, so nothing about it has to be stored.
  const [duration, setDuration] = useState("");

  const play = () => {
    const el = ref.current;
    if (!el) return;
    el.play().catch(() => setPlaying(false));
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted">
      <div className={cn("relative aspect-video bg-gradient-to-br flex items-center justify-center", GRADIENTS[index % GRADIENTS.length])}>
        <Film size={64} className="text-white/55" aria-hidden />

        {/* `#t=0.1` makes browsers render the first frame as a thumbnail. */}
        <video
          ref={ref}
          src={`${video.url}#t=0.1`}
          preload="metadata"
          playsInline
          controls={playing}
          className="absolute inset-0 w-full h-full object-cover bg-black/5"
          onLoadedMetadata={(e) => setDuration(formatDuration(e.currentTarget.duration))}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          aria-label={video.title}
        />

        {!playing && (
          <button
            type="button"
            onClick={play}
            aria-label={`Xem video ${video.title}`}
            className="absolute inset-0 z-20 flex items-center justify-center bg-transparent group-hover:bg-black/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          >
            <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play size={22} className="text-surface-800 ml-0.5" aria-hidden />
            </span>
          </button>
        )}

        {!playing && duration && (
          <span className="absolute bottom-2 right-3 z-20 text-xs font-semibold text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
            {duration}
          </span>
        )}

        {!playing && (
          <span className="absolute top-3 left-3 z-20 text-xs font-bold text-white bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
            Video thực tế
          </span>
        )}
      </div>

      <div className="bg-white px-4 py-3.5 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-sm text-surface-800 line-clamp-1">{video.title}</h3>
        <span className="text-xs text-surface-400 flex items-center gap-1 shrink-0">
          {playing ? <Volume2 size={13} aria-hidden /> : <VolumeX size={13} aria-hidden />}
          {playing ? "Đang phát" : "Nhấn xem"}
        </span>
      </div>
    </div>
  );
}

export function VideoShowcase({ videos }: { videos: SiteVideo[] }) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {videos.map((v, i) => (
          <VideoCard key={v.id} video={v} index={i} />
        ))}
      </div>
      <p className="text-center text-sm text-surface-400 mt-6 italic">
        Video được cập nhật thường xuyên từ cửa hàng
      </p>
    </div>
  );
}
