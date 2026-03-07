import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary"
}

export function InteractiveHoverButton({
  children,
  className,
  variant = "default",
  ...props
}: InteractiveHoverButtonProps) {
  const isSecondary = variant === "secondary"

  return (
    <button
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold",
        isSecondary
          ? "bg-primary text-primary-foreground"
          : "bg-background text-foreground",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]",
            isSecondary ? "bg-background" : "bg-primary"
          )}
        ></div>
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
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  )
}
