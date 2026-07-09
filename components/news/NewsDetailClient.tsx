"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MediaPreviewModal } from "@/components/admin/MediaPreviewModal";
import { computeCroppedImageStyle } from "@/components/admin/ImageCropTool";
import type { NewsArticle, NewsContentBlock } from "@/types";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function NewsDetailClient({ article }: { article: NewsArticle }) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  return (
    <article className="container-narrow py-6 md:py-10">
      {/* Title + date — the single authoritative article header in the body */}
      <h1 className="font-display font-semibold text-2xl md:text-3xl text-surface-800 leading-snug mb-2">
        {article.title}
      </h1>
      <p className="text-xs text-surface-400 mb-6">{formatDate(article.createdAt)}</p>

      {/* Featured image */}
      <button
        onClick={() => setPreviewSrc(article.featuredImage)}
        className="relative block w-full aspect-video rounded-2xl overflow-hidden bg-surface-100 mb-8 shadow-card hover:opacity-95 transition-opacity cursor-zoom-in"
        aria-label="Xem ảnh lớn"
      >
        <img
          src={article.featuredImage}
          alt={article.title}
          style={computeCroppedImageStyle(article.featuredImagePosX ?? 50, article.featuredImagePosY ?? 50, article.featuredImageZoom ?? 1)}
        />
      </button>

      {/* Content blocks */}
      <div className="flex flex-col gap-5">
        {article.content.map((block, i) => (
          <ContentBlockRenderer key={i} block={block} onImageClick={setPreviewSrc} />
        ))}
      </div>

      {previewSrc && (
        <MediaPreviewModal
          media={{ type: "image", src: previewSrc, name: article.title }}
          onClose={() => setPreviewSrc(null)}
        />
      )}
    </article>
  );
}

function ContentBlockRenderer({
  block,
  onImageClick,
}: {
  block: NewsContentBlock;
  onImageClick: (src: string) => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="font-display font-semibold text-xl md:text-2xl text-surface-800 mt-2">
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="text-base text-surface-600 leading-relaxed">{block.text}</p>
      );
    case "list":
      return (
        <ul className="flex flex-col gap-2 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-base text-surface-600 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ backgroundColor: "#A8CF36" }} />
              {item}
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <figure>
          <button
            onClick={() => onImageClick(block.url)}
            className="block w-full relative aspect-video rounded-xl overflow-hidden bg-surface-100 hover:opacity-95 transition-opacity cursor-zoom-in"
            aria-label="Xem ảnh lớn"
          >
            <Image src={block.url} alt={block.caption ?? ""} fill className="object-cover" sizes="720px" />
          </button>
          {block.caption && (
            <figcaption className="text-xs text-surface-400 text-center mt-2">{block.caption}</figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
}
