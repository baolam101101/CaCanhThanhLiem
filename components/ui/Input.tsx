import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-surface-600 tracking-wide"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-hidden>*</span>
            )}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-white px-4 py-2.5 text-sm",
              "text-surface-800 placeholder:text-surface-400",
              "border-surface-200 outline-none",
              "transition-all duration-200",
              "hover:border-surface-300",
              "focus:border-brand-400 focus:ring-3 focus:ring-brand-100",
              "disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed",
              error && "border-red-400 focus:border-red-400 focus:ring-red-100",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={13} className="shrink-0" aria-hidden /> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-surface-400">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
