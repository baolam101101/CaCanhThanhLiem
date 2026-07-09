import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import type { NewsArticle } from "@/types";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface NewsCardProps {
  article: NewsArticle;
  // "row" = image left, text right (default list layout per spec).
  // "compact" = stacked, used for the related-articles strip.
  variant?: "row" | "compact";
}

export function NewsCard({ article, variant = "row" }: NewsCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/news/${article.slug}`}
        className="group block bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-card hover:shadow-float hover:-translate-y-1 transition-all duration-300"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-100">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-400 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>
        <div className="p-4">
          <p className="text-xs text-surface-400 flex items-center gap-1.5 mb-1.5">
            <Calendar size={12} aria-hidden /> {formatDate(article.createdAt)}
          </p>
          <h3 className="text-sm font-semibold text-surface-800 line-clamp-2 group-hover:text-brand-700 transition-colors">
            {article.title}
          </h3>
        </div>
      </Link>
    );
  }

  // Row layout: image left, content right — matches the spec example.
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex gap-4 bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-card hover:shadow-float hover:-translate-y-0.5 transition-all duration-300 p-3"
    >
      <div className="relative w-32 sm:w-44 shrink-0 rounded-xl overflow-hidden bg-surface-100 aspect-square sm:aspect-[4/3]">
        <Image
          src={article.featuredImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-400 group-hover:scale-105"
          sizes="(max-width: 640px) 128px, 176px"
        />
      </div>
      <div className="flex-1 min-w-0 py-1 flex flex-col">
        <h3 className="font-display font-semibold text-base sm:text-lg text-surface-800 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-surface-400 flex items-center gap-1.5 mt-1.5 mb-2">
          <Calendar size={12} aria-hidden /> {formatDate(article.createdAt)}
        </p>
        <p className="text-sm text-surface-500 leading-relaxed line-clamp-2 sm:line-clamp-3">
          {article.excerpt}
        </p>
      </div>
    </Link>
  );
}
