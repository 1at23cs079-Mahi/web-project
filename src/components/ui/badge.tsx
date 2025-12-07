import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 hover:shadow-[0_0_10px_hsl(190_100%_50%/0.5)]",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_0_10px_hsl(270_91%_65%/0.5)]",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 hover:shadow-[0_0_10px_hsl(0_84%_60%/0.5)]",
        outline: "text-foreground border-primary/50 hover:border-primary hover:shadow-[0_0_8px_hsl(190_100%_50%/0.3)]",
        neonCyan: "border-cyan-500/50 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_12px_hsl(185_94%_48%/0.5)]",
        neonPurple: "border-purple-500/50 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:shadow-[0_0_12px_hsl(270_91%_65%/0.5)]",
        neonPink: "border-pink-500/50 bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 hover:shadow-[0_0_12px_hsl(330_90%_60%/0.5)]",
        neonGreen: "border-green-500/50 bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:shadow-[0_0_12px_hsl(150_100%_50%/0.5)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
