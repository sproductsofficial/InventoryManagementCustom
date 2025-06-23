// Button component for shadcn/ui
import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "destructive";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", asChild = false, ...props }, ref) => {
    const Comp: any = asChild ? "span" : "button";
    let base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ";
    let variantClass = "";
    switch (variant) {
      case "ghost":
        variantClass = "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800";
        break;
      case "destructive":
        variantClass = "bg-rose-500 text-white hover:bg-rose-600";
        break;
      case "default":
      default:
        variantClass = "bg-primary text-white hover:bg-primary/90";
        break;
    }
    return (
      <Comp ref={ref} className={`${base} ${variantClass} ${className}`} {...props} />
    );
  }
);
Button.displayName = "Button";
