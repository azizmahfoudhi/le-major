import * as React from "react";
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type AlertVariant = "default" | "info" | "success" | "warning" | "error";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onDismiss?: () => void;
}

const variantClasses: Record<AlertVariant, string> = {
  default: "bg-white text-gray-900 border-gray-200",
  info: "border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600",
  success: "border-green-200 bg-green-50 text-green-900 [&>svg]:text-green-600",
  warning: "border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600",
  error: "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600",
};

const icons: Record<AlertVariant, React.ElementType> = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", title, children, onDismiss, ...props }, ref) => {
    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <Icon className="h-5 w-5" />
        {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
        <div className="text-sm [&_p]:leading-relaxed">{children}</div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute right-4 top-4 rounded-md p-1 transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";

export { Alert };
