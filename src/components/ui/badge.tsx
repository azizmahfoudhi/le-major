import * as React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "secondary" | "gold" | "success" | "warning" | "destructive" | "danger" | "error" | "info" | "outline";
type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-navy-900 text-white hover:bg-navy-800",
  secondary: "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200",
  gold: "border-transparent bg-gold-500 text-white hover:bg-gold-600",
  success: "border-transparent bg-green-500 text-white hover:bg-green-600",
  warning: "border-transparent bg-amber-500 text-white hover:bg-amber-600",
  destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
  danger: "border-transparent bg-red-500 text-white hover:bg-red-600",
  error: "border-transparent bg-red-500 text-white hover:bg-red-600",
  info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
  outline: "text-gray-700 border-gray-300",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

function Badge({ className, variant = "default", size = "sm", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
