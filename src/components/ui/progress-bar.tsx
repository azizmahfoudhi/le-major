import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  colorVariant?: "default" | "gold" | "success" | "warning" | "danger";
  /** Override the indicator bar's className directly */
  indicatorClassName?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, showLabel = false, colorVariant = "default", indicatorClassName, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const colorClasses: Record<string, string> = {
      default: "bg-navy-600",
      gold: "bg-gold-500",
      success: "bg-green-500",
      warning: "bg-amber-500",
      danger: "bg-red-500",
    };

    return (
      <div className="w-full" ref={ref} {...props}>
        {showLabel && (
          <div className="mb-1 flex justify-between text-sm font-medium">
            <span>Progression</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={cn("h-2 w-full overflow-hidden rounded-full bg-gray-200", className)}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-in-out",
              indicatorClassName || colorClasses[colorVariant]
            )}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
