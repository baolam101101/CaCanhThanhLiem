import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-semibold text-surface-600 tracking-wide"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-hidden>*</span>
            )}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[120px] w-full rounded-xl border bg-white px-4 py-3 text-sm",
            "text-surface-800 placeholder:text-surface-400",
            "border-surface-200 outline-none resize-y",
            "transition-all duration-200",
            "hover:border-surface-300",
            "focus:border-brand-400 focus:ring-3 focus:ring-brand-100",
            "disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed",
            error && "border-red-400 focus:border-red-400 focus:ring-red-100",
            className
          )}
          ref={ref}
          {...props}
        />
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
Textarea.displayName = "Textarea";

export { Textarea };
