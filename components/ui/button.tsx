import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "outline"
  | "ghost"
  | "destructive"
  | "secondary";
type Size = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  default:
    "bg-marca text-slate-950 font-semibold hover:bg-marca-dark shadow-[0_4px_20px_-4px_rgba(251,191,36,0.5)]",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  outline:
    "border border-slate-700 bg-slate-900/40 text-slate-100 hover:bg-slate-800 hover:border-slate-600",
  ghost: "text-slate-200 hover:bg-slate-800",
  destructive: "bg-marca-rojo text-white hover:bg-red-600",
};

const sizes: Record<Size, string> = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/60 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
