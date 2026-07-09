"use client";

import React, { useState } from "react";
import { Play, Upload, X, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/* In production these come from Supabase/admin panel.
   For now we use placeholder slots that show upload UI in admin context. */
const PLACEHOLDER_VIDEOS = [
  { id: "v1", title: "Cá Koi Nhật Nhập Khẩu", emoji: "", duration: "0:45" },
  { id: "v2", title: "Cá Rồng Bạch Kim",       emoji: "", duration: "1:02" },
  { id: "v3", title: "Cá Đĩa Cobalt Xanh",     emoji: "", duration: "0:38" },
];

interface VideoCardProps {
  title: string;
  emoji: string;
  duration: string;
  index: number;
}

function VideoCard({ title, emoji, duration, index }: VideoCardProps) {
  const [playing, setPlaying] = useState(false);

  /* Gradient backgrounds cycling through brand palette */
  const gradients = [
    "from-[#A8CF36] to-[#739620]",
    "from-[#8fb82a] to-[#A8CF36]",
    "from-[#739620] to-[#bedd72]",
  ];
  const grad = gradients[index % gradients.length];

  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden shadow-card",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted",
        "cursor-pointer"
      )}
      onClick={() => setPlaying((v) => !v)}
      role="button"
      tabIndex={0}
      aria-label={playing ? `Dừng video ${title}` : `Xem video ${title}`}
      onKeyDown={(e) => e.key === "Enter" && setPlaying((v) => !v)}
    >
      {/* Thumbnail area */}
      <div className={cn("relative aspect-video bg-gradient-to-br flex items-center justify-center", grad)}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 -translate-x-8 translate-y-8" />

        {/* Emoji / fish graphic */}
        <span
          className={cn(
            "text-[72px] select-none relative z-10",
            "transition-transform duration-400",
            playing ? "scale-90 opacity-50" : "group-hover:scale-110"
          )}
          aria-hidden
        >
          {emoji}
        </span>

        {/* Play/pause overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center z-20",
          "transition-all duration-300",
          playing ? "bg-black/30" : "bg-transparent group-hover:bg-black/15"
        )}>
          <div className={cn(
            "w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg",
            "transition-all duration-300",
            playing ? "scale-100" : "scale-90 group-hover:scale-100"
          )}>
            {playing
              ? <div className="flex gap-1"><div className="w-1.5 h-5 bg-surface-800 rounded-full" /><div className="w-1.5 h-5 bg-surface-800 rounded-full" /></div>
              : <Play size={22} className="text-surface-800 ml-0.5" aria-hidden />
            }
          </div>
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-2 right-3 z-20 text-xs font-semibold text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {duration}
        </span>

        {/* "Video thực tế" label */}
        <span className="absolute top-3 left-3 z-20 text-xs font-bold text-white bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
           Video thực tế
        </span>
      </div>

      {/* Card info */}
      <div className="bg-white px-4 py-3.5 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-surface-800">{title}</h3>
        <span className="text-xs text-surface-400 flex items-center gap-1">
          {playing ? <Volume2 size={13} aria-hidden /> : <VolumeX size={13} aria-hidden />}
          {playing ? "Đang phát" : "Nhấn xem"}
        </span>
      </div>
    </div>
  );
}

export function VideoShowcase() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {PLACEHOLDER_VIDEOS.map((v, i) => (
          <VideoCard key={v.id} title={v.title} emoji={v.emoji} duration={v.duration} index={i} />
        ))}
      </div>

      {/* Note about admin upload */}
      <p className="text-center text-sm text-surface-400 mt-6 italic">
         Video được cập nhật thường xuyên từ cửa hàng — quản lý qua trang Admin
      </p>
    </div>
  );
}
