import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-semibold tracking-wide px-2.5 py-1 border",
  {
    variants: {
      variant: {
        default:   "bg-surface-100 text-surface-700 border-surface-200",
        brand:     "bg-brand-50 text-brand-700 border-brand-200",
        success:   "bg-brand-50 text-brand-700 border-brand-200",
        new:       "bg-brand-600 text-white border-brand-600",
        featured:  "bg-accent-warm text-white border-accent-warm",
        out:       "bg-surface-100 text-surface-500 border-surface-200",
        pending:   "bg-amber-50 text-amber-700 border-amber-200",
        completed: "bg-brand-50 text-brand-700 border-brand-200",
        danger:    "bg-red-50 text-red-700 border-red-200",
        info:      "bg-blue-50 text-blue-700 border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
