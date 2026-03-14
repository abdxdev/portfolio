'use client'
import { useImperativeHandle, useRef, HTMLAttributes, Ref } from 'react'

const SHAKE_CSS = `
@keyframes shake-x {
  0%   { transform: translateX(0); }
  10%  { transform: translateX(-8px); }
  20%  { transform: translateX(8px); }
  30%  { transform: translateX(-8px); }
  40%  { transform: translateX(8px); }
  50%  { transform: translateX(-4px); }
  60%  { transform: translateX(4px); }
  70%  { transform: translateX(-2px); }
  80%  { transform: translateX(2px); }
  90%  { transform: translateX(-1px); }
  100% { transform: translateX(0); }
}
.shake {
  animation: shake-x 0.4s ease-in-out both;
}
`

export interface ShakeHandle {
  shake: () => void
}

interface ShakeElementProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<ShakeHandle>
}

export function ShakeElement({ children, className, ref, ...props }: ShakeElementProps) {
  const divRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    shake() {
      const el = divRef.current
      if (!el) return
      el.classList.remove('shake')
      void el.offsetWidth
      el.classList.add('shake')
      setTimeout(() => el.classList.remove('shake'), 400)
    },
  }))

  return (
    <>
      <style>{SHAKE_CSS}</style>
      <div ref={divRef} className={className} {...props}>
        {children}
      </div>
    </>
  )
}