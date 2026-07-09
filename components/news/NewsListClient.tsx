"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { NewsCard } from "@/components/news/NewsCard";
import type { NewsArticle } from "@/types";

const PAGE_SIZE = 6;

export function NewsListClient({ initialNews }: { initialNews: NewsArticle[] }) {
  const [query,    setQuery]    = useState("");
  const [visible,  setVisible]  = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (!query.trim()) return initialNews;
    const q = query.toLowerCase();
    return initialNews.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.content.some((b) => "text" in b && b.text.toLowerCase().includes(q))
    );
  }, [initialNews, query]);

  const shown   = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div className="container-site py-10 md:py-14">
      {/* Search */}
      <div className="relative max-w-md mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
          placeholder="Tìm theo tiêu đề hoặc nội dung..."
          className="w-full h-12 pl-11 pr-4 rounded-xl border border-surface-200 bg-white text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 transition-all"
        />
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-20 text-surface-400">
          <p className="text-sm">Không tìm thấy tin tức phù hợp.</p>
        </div>
      ) : (
        <>
          {/* Desktop/tablet: 2 columns. Mobile: 1 column. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {shown.map((article) => (
              <NewsCard key={article.id} article={article} variant="row" />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="px-6 py-3 rounded-xl border border-surface-200 bg-white text-sm font-medium text-surface-700 hover:border-brand-400 hover:text-brand-700 transition-all shadow-sm"
              >
                Xem thêm tin tức
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
