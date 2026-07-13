"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Product, Category } from "@/types";
import { useRouter } from "next/navigation";

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
}

const STATUS_FILTERS = [
  { key: "all",       label: "Tất cả" },
  { key: "new",       label: "Mới về" },
  { key: "featured",  label: "Nổi bật" },
  { key: "available", label: "Còn hàng" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["key"];

export function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const router = useRouter();
  const [search, setSearch]               = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      if (p.status === "hidden") return false;
      if (activeCategory && p.categorySlug !== activeCategory) return false;
      if (statusFilter === "new"       && !p.tags.includes("new"))       return false;
      if (statusFilter === "featured"  && !p.tags.includes("featured"))  return false;
      if (statusFilter === "available" && p.status !== "available")      return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.latin.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [initialProducts, activeCategory, statusFilter, search]);

  const clearFilters = useCallback(() => {
    setSearch(""); setActiveCategory(null); setStatusFilter("all");
  }, []);

  const hasActiveFilters = search || activeCategory || statusFilter !== "all";

  return (
    <div className="section-pad bg-white">
      <div className="container-site">

        {/* Category pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
              activeCategory === null
                ? "text-surface-900 border-transparent shadow-sm"
                : "bg-white text-surface-600 border-surface-200 hover:border-surface-400"
            )}
            style={activeCategory === null ? { backgroundColor: "#A8CF36", borderColor: "#A8CF36" } : {}}
          >
            Tất cả danh mục
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                activeCategory === cat.slug
                  ? "text-surface-900 border-transparent shadow-sm"
                  : "bg-white text-surface-600 border-surface-200 hover:border-surface-400"
              )}
              style={activeCategory === cat.slug ? { backgroundColor: "#A8CF36", borderColor: "#A8CF36" } : {}}
            >
              <span aria-hidden>{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, loài, danh mục..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-surface-200 bg-white text-sm outline-none transition-all hover:border-surface-300 focus:border-brand-400 focus:ring-3 focus:ring-brand-100"
              aria-label="Tìm kiếm sản phẩm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600" aria-label="Xóa">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                  statusFilter === f.key
                    ? "bg-surface-800 text-white border-surface-800"
                    : "bg-white text-surface-600 border-surface-200 hover:border-surface-400"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              <X size={13} aria-hidden /> Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-surface-400">
            <span className="font-semibold text-surface-700">{filtered.length}</span> sản phẩm
          </p>
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <SlidersHorizontal size={14} aria-hidden />
            <span>Sắp xếp: Mặc định</span>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon=""
            title="Không tìm thấy sản phẩm"
            description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
            action={{ label: "Xóa bộ lọc", onClick: clearFilters }}
          />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6" role="list">
            {filtered.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
