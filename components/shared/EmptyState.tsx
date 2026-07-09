import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = "",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-20 px-6",
        className
      )}
    >
      <span className="text-6xl mb-5 opacity-40" role="img" aria-hidden>
        {icon}
      </span>
      <h3 className="font-display text-2xl font-light text-surface-600 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-surface-400 max-w-xs leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
