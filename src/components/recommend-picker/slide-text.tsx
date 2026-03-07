"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/**
 * Text that slides left on hover when it overflows its container.
 * Uses ResizeObserver for reliable measurement and proportional animation speed.
 */
export function SlideText({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const span = textRef.current;
    if (!container || !span) return;
    // Add 2px buffer for sub-pixel rounding
    const diff = span.scrollWidth - container.clientWidth + 2;
    setOverflow(diff > 2 ? diff : 0);
  }, []);

  useEffect(() => {
    measure();
    const container = containerRef.current;
    const span = textRef.current;
    if (!container || !span) return;

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(span);
    return () => ro.disconnect();
  }, [text, measure]);

  // Speed: ~40px per second, minimum 0.6s
  const duration = overflow > 0 ? Math.max(0.6, overflow / 40) : 0;

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <span
        ref={textRef}
        className="text-[13px] font-medium whitespace-nowrap inline-block"
        style={{
          transform: "translateX(0)",
          transition: `transform ${duration}s ease-in-out`,
        }}
        onMouseEnter={(e) => {
          if (overflow > 0) {
            e.currentTarget.style.transform = `translateX(-${overflow}px)`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        {text}
      </span>
    </div>
  );
}
