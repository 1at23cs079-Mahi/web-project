import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_hsl(190_100%_50%/0.5),0_0_40px_hsl(190_100%_50%/0.3)] hover:-translate-y-0.5 active:translate-y-0",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-[0_0_20px_hsl(0_84%_60%/0.5)] hover:-translate-y-0.5 active:translate-y-0",
        outline: "border border-primary/50 bg-background hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_15px_hsl(190_100%_50%/0.3)] hover:-translate-y-0.5 active:translate-y-0 active:bg-primary/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_0_20px_hsl(270_91%_65%/0.5),0_0_40px_hsl(270_91%_65%/0.3)] hover:-translate-y-0.5 active:translate-y-0",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground hover:shadow-[0_0_10px_hsl(330_90%_60%/0.2)] active:bg-accent/30",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        neonCyan: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_20px_hsl(185_94%_48%/0.5),0_0_40px_hsl(185_94%_48%/0.3)] hover:-translate-y-0.5 active:translate-y-0 active:bg-cyan-500/40",
        neonPurple: "bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_20px_hsl(270_91%_65%/0.5),0_0_40px_hsl(270_91%_65%/0.3)] hover:-translate-y-0.5 active:translate-y-0 active:bg-purple-500/40",
        neonPink: "bg-pink-500/20 text-pink-400 border border-pink-500/50 hover:bg-pink-500/30 hover:border-pink-400 hover:shadow-[0_0_20px_hsl(330_90%_60%/0.5),0_0_40px_hsl(330_90%_60%/0.3)] hover:-translate-y-0.5 active:translate-y-0 active:bg-pink-500/40",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
