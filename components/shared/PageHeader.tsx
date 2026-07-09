import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Breadcrumb } from "@/types";

interface PageHeaderProps {
  breadcrumbs?: Breadcrumb[];
  title?: React.ReactNode;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "gradient-hero border-b border-surface-200",
        "py-6 md:py-8",
        className
      )}
    >
      <div className="container-site">
        {/* Breadcrumbs — every item (link, current-page span, and the
            ChevronRight separator) shares the same line-height and
            vertical-alignment strategy via inline-flex + items-center +
            leading-none. The previous version mixed a plain <span> and
            <Link> with default inline baseline alignment next to an SVG
            icon (which defaults to baseline too, but with different
            effective metrics than text) — at certain font-weight/size
            combinations this produced a visible 1-2px vertical offset
            between the chevron and the text, and between link vs.
            current-page text. Forcing every child onto the same
            cross-axis alignment removes the dependency on font metrics
            entirely. flex-wrap added so long breadcrumb trails wrap
            cleanly on narrow mobile viewports instead of overflowing. */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-surface-400 mb-4 leading-none"
            aria-label="Breadcrumb"
          >
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 leading-none">
                {i > 0 && (
                  <ChevronRight size={14} className="text-surface-300 shrink-0 block" aria-hidden />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="inline-flex items-center leading-none hover:text-brand-600 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="inline-flex items-center leading-none text-surface-600 font-medium">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title area */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-display font-light text-surface-800">
              {title && title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-base text-surface-500">{subtitle}</p>
            )}
          </div>
          {children && (
            <div className="shrink-0">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
