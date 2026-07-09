"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4" role="list">
      {categories.map((cat) => (
        <li key={cat.slug}>
          <Link
            href={`/products?category=${cat.slug}`}
            className={cn(
              "group flex flex-col items-center text-center p-4 md:p-5 rounded-2xl",
              "bg-surface-50 border border-surface-200",
              "transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-md hover:bg-brand-50 hover:border-brand-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            )}
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300" aria-hidden>
              {cat.emoji}
            </span>
            <span className="text-sm font-semibold text-surface-700 group-hover:text-brand-700 mb-1">{cat.name}</span>
            <span className="text-xs text-surface-400">{cat.count > 0 ? `${cat.count} loài` : "Xem thêm"}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
