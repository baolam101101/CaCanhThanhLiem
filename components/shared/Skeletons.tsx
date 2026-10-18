import React from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Placeholder layouts shown by the route loading.tsx files while a page
// fetches its data. Each roughly matches the page it stands in for, so
// the content lands where the grey blocks were instead of jumping.
// ============================================================

export function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden className={cn("skeleton rounded-lg", className)} style={style} />;
}

/** Wraps a skeleton so screen readers announce one "loading" message. */
function Loading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">Đang tải…</span>
      {children}
    </div>
  );
}

function PageHeaderSkeleton() {
  return (
    <div className="gradient-hero border-b border-surface-200 py-6 md:py-8">
      <div className="container-site flex flex-col gap-3">
        <Bone className="h-3 w-40" />
        <Bone className="h-9 w-72 max-w-full" />
        <Bone className="h-4 w-96 max-w-full" />
      </div>
    </div>
  );
}

function CardGrid({ count, media, twoUp = true }: { count: number; media: string; twoUp?: boolean }) {
  return (
    <div className={cn("grid gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4", twoUp ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
          <Bone className={cn("rounded-none", twoUp ? "aspect-square sm:aspect-[4/3]" : media)} />
          <div className="p-4 flex flex-col gap-2.5">
            <Bone className="h-3 w-20" />
            <Bone className="h-5 w-4/5" />
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <Loading>
      <Bone className="rounded-none w-full aspect-[16/7] md:aspect-[16/5]" />
      <div className="container-site py-12 md:py-16 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <Bone className="h-3 w-28" />
          <Bone className="h-8 w-72 max-w-full" />
        </div>
        <CardGrid count={4} media="aspect-[4/3]" />
      </div>
    </Loading>
  );
}

export function ListPageSkeleton({ media = "aspect-[4/3]", filters = true }: { media?: string; filters?: boolean }) {
  return (
    <Loading>
      <PageHeaderSkeleton />
      <div className="container-site py-10 md:py-12 flex flex-col gap-8">
        {filters && (
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => <Bone key={i} className="h-9 w-24 rounded-full" />)}
          </div>
        )}
        <CardGrid count={8} media={media} twoUp={filters} />
      </div>
    </Loading>
  );
}

export function ProductDetailSkeleton() {
  return (
    <Loading>
      <PageHeaderSkeleton />
      <div className="container-site py-10 md:py-12 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Bone className="w-full aspect-[4/3] rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => <Bone key={i} className="w-20 h-16 rounded-xl" />)}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Bone className="h-3 w-24" />
          <Bone className="h-9 w-3/4" />
          <Bone className="h-6 w-28 rounded-full" />
          <div className="flex flex-col gap-2 pt-2">
            {Array.from({ length: 5 }).map((_, i) => <Bone key={i} className={cn("h-3.5", i === 4 ? "w-1/2" : "w-full")} />)}
          </div>
          <Bone className="h-12 w-48 rounded-xl mt-2" />
        </div>
      </div>
    </Loading>
  );
}

export function ArticleSkeleton() {
  return (
    <Loading>
      <PageHeaderSkeleton />
      <div className="container-site py-10 md:py-12 max-w-3xl flex flex-col gap-4">
        <Bone className="w-full aspect-[16/9] rounded-2xl" />
        {Array.from({ length: 8 }).map((_, i) => <Bone key={i} className={cn("h-3.5", i % 4 === 3 ? "w-2/3" : "w-full")} />)}
      </div>
    </Loading>
  );
}

/** Admin pages: title row, then a list of rows. Renders inside AdminShell. */
export function AdminPageSkeleton() {
  return (
    <Loading>
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3">
        <div className="flex flex-col gap-2">
          <Bone className="h-8 w-56" />
          <Bone className="h-3.5 w-24" />
        </div>
        <Bone className="h-10 w-36 rounded-xl" />
      </div>
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-surface-200 flex items-center gap-3 px-4 py-3.5">
            <Bone className="w-14 h-10 shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <Bone className="h-3.5 w-1/2" />
              <Bone className="h-3 w-24" />
            </div>
            <Bone className="h-8 w-24 shrink-0" />
          </div>
        ))}
      </div>
    </Loading>
  );
}
