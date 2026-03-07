"use client";

import { useEffect } from "react";
import { useAnimationSettings } from "@/components/animation-settings";

/**
 * Global provider that enables Windows 10 Fluent "Reveal Highlight" on every
 * <Card> (identified by `data-slot="card"`).  Mount once in the root layout.
 *
 * It listens for mousemove on the document and sets --mouse-x / --mouse-y
 * CSS custom properties on every card so the CSS radial-gradient follows the
 * cursor across the whole page — matching the Windows 10 Settings look.
 */
export function SpotlightProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useAnimationSettings();

  useEffect(() => {
    if (!settings.cardHover) {
      // Clear any existing values when disabled
      const cards = document.querySelectorAll<HTMLElement>('[data-slot="card"]');
      cards.forEach((card) => {
        card.style.removeProperty("--mouse-x");
        card.style.removeProperty("--mouse-y");
      });
      return;
    }

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        const cards = document.querySelectorAll<HTMLElement>(
          '[data-slot="card"]'
        );
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        });
        rafId = null;
      });
    };

    const handleMouseLeave = () => {
      const cards = document.querySelectorAll<HTMLElement>(
        '[data-slot="card"]'
      );
      cards.forEach((card) => {
        card.style.removeProperty("--mouse-x");
        card.style.removeProperty("--mouse-y");
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [settings.cardHover]);

  return <>{children}</>;
}

