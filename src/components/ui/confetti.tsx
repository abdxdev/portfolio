"use client"
import type { ReactNode } from "react"
import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react"
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from "canvas-confetti"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"

type Api = {
  fire: (options?: ConfettiOptions) => void
}

type Props = React.ComponentPropsWithRef<"canvas"> & {
  options?: ConfettiOptions
  globalOptions?: ConfettiGlobalOptions
  manualstart?: boolean
  children?: ReactNode
}

export type ConfettiRef = Api | null

const ConfettiContext = createContext<Api>({} as Api)

const ConfettiComponent = forwardRef<ConfettiRef, Props>((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    children,
    ...rest
  } = props
  const instanceRef = useRef<ConfettiInstance | null>(null)

  const canvasRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node !== null) {
        if (instanceRef.current) return
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        })
      } else {
        if (instanceRef.current) {
          instanceRef.current.reset()
          instanceRef.current = null
        }
      }
    },
    [globalOptions]
  )

  const fire = useCallback(
    async (opts = {}) => {
      try {
        await instanceRef.current?.({ ...options, ...opts })
      } catch (error) {
        console.error("Confetti error:", error)
      }
    },
    [options]
  )

  const api = useMemo(() => ({ fire }), [fire])

  useImperativeHandle(ref, () => api, [api])

  useEffect(() => {
    if (!manualstart) {
      ;(async () => {
        try {
          await fire()
        } catch (error) {
          console.error("Confetti effect error:", error)
        }
      })()
    }
  }, [manualstart, fire])

  return (
    <ConfettiContext.Provider value={api}>
      <canvas ref={canvasRef} {...rest} />
      {children}
    </ConfettiContext.Provider>
  )
})

ConfettiComponent.displayName = "Confetti"
export const Confetti = ConfettiComponent

interface ConfettiButtonProps extends React.ComponentProps<"button"> {
  options?: ConfettiOptions & ConfettiGlobalOptions & { canvas?: HTMLCanvasElement }
  manualstart?: boolean
}

export type ConfettiButtonRef = { fire: () => void }

const ConfettiButtonComponent = forwardRef<ConfettiButtonRef, ConfettiButtonProps>(
  ({ options, manualstart = false, children, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const fire = useCallback(async () => {
      try {
        const rect = buttonRef.current?.getBoundingClientRect()
        if (!rect) return
        await confetti({
          ...options,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          },
        })
      } catch (error) {
        console.error("Confetti button error:", error)
      }
    }, [options])

    useImperativeHandle(ref, () => ({ fire }), [fire])

    return (
      <Button ref={buttonRef} onClick={manualstart ? undefined : fire} {...props}>
        {children}
      </Button>
    )
  }
)

ConfettiButtonComponent.displayName = "ConfettiButton"
export const ConfettiButton = ConfettiButtonComponent