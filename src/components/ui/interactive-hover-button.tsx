import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import React from "react"

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary"
  icon?: React.ReactNode
  startIcon?: React.ReactNode
}

export const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ children, className, variant = "default", icon, startIcon, ...props }, ref) => {
    const isSecondary = variant === "secondary"

    return (
      <button
        ref={ref}
        className={cn(
          "group relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold isolate",
          isSecondary
            ? "bg-primary text-primary-foreground"
            : "bg-background text-foreground",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {startIcon ? (
            <div className="flex items-center justify-center relative">
              <div
                className={cn(
                  "absolute h-2 w-2 scale-0 rounded-full transition-all duration-300 group-hover:scale-[100.8]",
                  isSecondary ? "bg-background" : "bg-primary"
                )}
              ></div>
              <span className="z-10 group-hover:opacity-0 transition-all duration-300">
                {startIcon}
              </span>
            </div>
          ) : (
            <div
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]",
                isSecondary ? "bg-background" : "bg-primary"
              )}
            ></div>
          )}
          <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
            {children}
          </span>
        </div>
        <div
          className={cn(
            "absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100",
            isSecondary ? "text-primary" : "text-primary-foreground"
          )}
        >
          <span>{children}</span>
          {icon ? icon : <ArrowRight className="h-4 w-4" />}
        </div>
      </button>
    )
  })
InteractiveHoverButton.displayName = "InteractiveHoverButton"
