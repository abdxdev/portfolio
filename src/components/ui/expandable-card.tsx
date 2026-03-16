"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"

interface ExpandableCardProps {
  title: string | React.ReactNode
  src: string
  description: string
  children?: React.ReactNode
  className?: string
  classNameExpanded?: string
  customImageNode?: React.ReactNode | ((isExpanded: boolean) => React.ReactNode)
  links?: React.ReactNode
  disableAnimation?: boolean
  [key: string]: any
}

export function ExpandableCard({
  title,
  src,
  description,
  children,
  className,
  classNameExpanded,
  customImageNode,
  links,
  disableAnimation = false,
  ...props
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const id = React.useId()

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(false)
      }
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActive(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  // When animations are disabled, strip layoutId and transition props so
  // Framer Motion treats every element as independent (no shared-layout magic).
  const maybeLayoutId = (key: string) => (disableAnimation ? undefined : key)
  const noTransition = disableAnimation ? { duration: 0 } : undefined

  const MotionCard = motion(Card)

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={disableAnimation ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={disableAnimation ? undefined : { opacity: 0 }}
            transition={noTransition}
            className="fixed inset-0 z-10 h-full w-full backdrop-blur-md"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && (
          <div
            className={cn(
              "fixed inset-0 z-100 grid place-items-center before:pointer-events-none sm:mt-16"
            )}
          >
            <motion.div
              layoutId={maybeLayoutId(`card-${title}-${id}`)}
              ref={cardRef}
              className={cn(
                "relative flex h-full w-full max-w-[850px] flex-col overflow-auto shadow-sm [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:rounded-t-3xl bg-background dark:shadow-none",
                classNameExpanded
              )}
              {...props}
            >
              <motion.div
                layoutId={maybeLayoutId(`image-${title}-${id}`)}
                className="relative aspect-video w-full shrink-0 overflow-hidden sm:rounded-t-3xl"
              >
                {customImageNode ? (
                  typeof customImageNode === "function"
                    ? customImageNode(true)
                    : customImageNode
                ) : (
                  <img
                    src={src}
                    alt={typeof title === "string" ? title : "Image"}
                    className="h-full w-full object-cover object-center"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 z-50 h-[80px] bg-linear-to-t from-background to-transparent pointer-events-none" />
              </motion.div>
              <div className="relative h-full before:fixed before:inset-x-0 before:bottom-0 before:z-50 before:h-[70px] before:bg-linear-to-t before:from-background">
                <div className="flex h-auto items-start justify-between p-8 border-b mb-8">
                  <div className="flex-1 flex flex-col">
                    <div className="flex gap-4">
                      <motion.p
                        layoutId={maybeLayoutId(`description-${description}-${id}`)}
                        className="text-lg text-muted-foreground"
                      >
                        {description}
                      </motion.p>
                      <motion.button
                        aria-label="Close card"
                        layoutId={maybeLayoutId(`button-${title}-${id}`)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border relative z-100"
                        onClick={() => setActive(false)}
                      >
                        <motion.div
                          animate={{ rotate: active ? 45 : 0 }}
                          transition={noTransition ?? { duration: 0.4 }}
                        >
                          <Plus className="h-5 w-5" />
                        </motion.div>
                      </motion.button>

                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-0.5">
                      <motion.h3
                        layoutId={maybeLayoutId(`title-${title}-${id}`)}
                        className="text-4xl font-semibold sm:text-4xl leading-none"
                      >
                        {title}
                      </motion.h3>
                    </div>
                    {links && (
                      <motion.div
                        layoutId={maybeLayoutId(`links-${title}-${id}`)}
                        className="mt-4"
                      >
                        {links}
                      </motion.div>
                    )}
                  </div>
                </div>
                <div className="relative px-6 sm:px-8">
                  <motion.div
                    layout={!disableAnimation}
                    initial={disableAnimation ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={disableAnimation ? undefined : { opacity: 0 }}
                    className="flex flex-col gap-4 overflow-auto pb-10 text-base relative z-20 w-full min-w-0"
                  >
                    {children}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MotionCard
        role="dialog"
        aria-labelledby={`card-title-${id}`}
        aria-modal="true"
        layoutId={maybeLayoutId(`card-${title}-${id}`)}
        onClick={() => setActive(true)}
        className={cn(
          "flex cursor-pointer flex-col p-0 shadow-sm overflow-hidden",
          className
        )}
      >
        <div className="flex flex-col w-full h-full">
          <motion.div
            layoutId={maybeLayoutId(`image-${title}-${id}`)}
            className="aspect-video w-full shrink-0 relative overflow-hidden rounded-t-xl"
          >
            {customImageNode ? (
              typeof customImageNode === "function"
                ? customImageNode(false)
                : customImageNode
            ) : (
              <img
                src={src}
                alt={typeof title === "string" ? title : "Image"}
                className="h-full w-full object-cover object-center"
              />
            )}
          </motion.div>
          <div className="flex items-start justify-between p-4 px-5 pb-5 flex-1">
            <div className="flex flex-col flex-1 h-full relative top-[-4px]">
              <div className="flex gap-1">
                <motion.p
                  layoutId={maybeLayoutId(`description-${description}-${id}`)}
                  className="text-sm font-medium md:text-left text-muted-foreground"
                >
                  {description}
                </motion.p>
                <motion.button
                  aria-label="Open card"
                  layoutId={maybeLayoutId(`button-${title}-${id}`)}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 focus:outline-none mb-auto ml-4"
                  )}
                >
                  <motion.div
                    animate={{ rotate: active ? 45 : 0 }}
                    transition={noTransition ?? { duration: 0.4 }}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.div>
                </motion.button>

              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <motion.h3
                  layoutId={maybeLayoutId(`title-${title}-${id}`)}
                  className="font-semibold md:text-left text-lg leading-none"
                >
                  {title}
                </motion.h3>
              </div>
              {links && (
                <motion.div
                  layoutId={maybeLayoutId(`links-${title}-${id}`)}
                  className="mt-auto pt-3 flex w-full justify-between items-center"
                >
                  {links}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </MotionCard>
    </>
  )
}