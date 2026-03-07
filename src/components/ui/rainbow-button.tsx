import React from "react"
import { cva, VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { InteractiveHoverButton } from "./interactive-hover-button"

const rainbowButtonVariants = cva(
  "relative cursor-pointer group animate-rainbow",
  {
    variants: {
      variant: {
        default:
          "border-0 bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] bg-[length:200%] text-primary-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.125rem)_solid_transparent] dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
        outline:
          "border border-input border-b-transparent bg-[linear-gradient(#ffffff,#ffffff),linear-gradient(#ffffff_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] bg-[length:200%] text-accent-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] dark:bg-[linear-gradient(#0a0a0a,#0a0a0a),linear-gradient(#0a0a0a_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type RainbowButtonProps = React.ComponentProps<typeof Button> &
  VariantProps<typeof rainbowButtonVariants>

function RainbowButton({
  className,
  variant = "default",
  ...props
}: RainbowButtonProps) {
  return (
    <div className="relative w-full">
      <div className="absolute bottom-[-20%] left-1/2 z-0 h-1/5 w-3/5 -translate-x-1/2 animate-rainbow bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] bg-[length:200%] [filter:blur(0.75rem)]" />
      <InteractiveHoverButton variant="secondary"
        className={cn(rainbowButtonVariants({ variant }), className)}
        {...props}
      />
    </div>
  )
}

export { RainbowButton, rainbowButtonVariants, type RainbowButtonProps }
