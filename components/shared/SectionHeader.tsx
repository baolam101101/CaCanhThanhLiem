import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
  titleClassName?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleClassName,
}: SectionHeaderProps) {
  const alignClasses = {
    left:   "text-left items-start",
    center: "text-center items-center",
    right:  "text-right items-end",
  };

  return (
    <div className={cn("flex flex-col gap-3", alignClasses[align], className)}>
      {eyebrow && (
        <p className="text-eyebrow">{eyebrow}</p>
      )}
      <h2
        className={cn(
          "font-display font-light text-surface-800",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-base text-surface-500 leading-relaxed",
            align === "center" && "max-w-lg mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
