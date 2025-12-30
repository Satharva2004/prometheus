"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const liquidbuttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-xl font-body text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
  {
    variants: {
      variant: {
        default: "text-foreground hover:scale-[1.02]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        sm: "h-9 px-4 py-2 text-xs",
        default: "h-10 px-5 py-2.5",
        lg: "h-11 px-6 py-3",
        xl: "h-12 px-8 py-3.5",
        xxl: "h-14 px-10 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function GlassFilter() {
  return (
    <svg className="absolute w-0 h-0" aria-hidden="true">
      <defs>
        <filter id="glass-distortion" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.015"
            numOctaves="2"
            seed="3"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.5" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.3" result="finalBlur" />
          <feMerge>
            <feMergeNode in="finalBlur" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
  asChild?: boolean;
}

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: LiquidButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <>
      <GlassFilter />
      <Comp
        className={cn(
          liquidbuttonVariants({ variant, size, className }),
          "relative group"
        )}
        {...props}
      >
        {/* Frosted glass background layer */}
        <span
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-card/90 via-card/70 to-card/50 opacity-90 group-hover:opacity-100 transition-opacity duration-500"
          style={{ filter: "url(#glass-distortion)" }}
        />

        {/* Subtle refraction glow */}
        <span
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, hsl(var(--foreground) / 0.08), transparent 50%)",
          }}
        />

        {/* Glass border */}
        <span
          className="absolute inset-0 rounded-xl backdrop-blur-sm border border-border/40 group-hover:border-border/60 transition-colors duration-300"
        />

        {/* Inner shadow for depth */}
        <span
          className="absolute inset-[1px] rounded-xl"
          style={{
            boxShadow: "inset 0 1px 2px hsl(var(--background) / 0.5)",
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2 text-foreground/90 group-hover:text-foreground transition-colors duration-300">
          {children}
        </span>
      </Comp>
    </>
  );
}

export { LiquidButton, liquidbuttonVariants };