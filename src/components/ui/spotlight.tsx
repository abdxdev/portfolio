"use client";

import { useEffect } from "react";
import { useAnimationSettings } from "@/components/animation-settings";
import "./spotlight.css";

const REVEAL_ATTR = "data-reveal";

const IGNORED_TAGS = new Set([
  "HTML", "BODY", "HEAD", "SCRIPT", "STYLE", "LINK",
  "META", "TITLE", "NOSCRIPT", "TEMPLATE",
  "SVG", "PATH", "G", "CIRCLE", "RECT", "LINE", "POLYLINE", "POLYGON",
  "ASIDE", "NAV", "HEADER", "FOOTER", "MAIN", "SECTION",
]);

function isSideOn(width: string, style: string, color: string): boolean {
  if (parseFloat(width) <= 0) return false;
  if (style === "none" || style === "hidden") return false;
  if (color === "transparent") return false;
  const parts = color.match(/[\d.]+/g) ?? [];
  if (parts.length === 4 && parseFloat(parts[3]) === 0) return false;
  return true;
}

function syncElement(el: Element) {
  if (IGNORED_TAGS.has(el.tagName)) return;

  const s = getComputedStyle(el);
  const pos = s.position;

  // Never touch fixed/sticky elements — they must keep their positioning
  if (pos === "fixed" || pos === "sticky") return;

  const top = isSideOn(s.borderTopWidth, s.borderTopStyle, s.borderTopColor);
  const right = isSideOn(s.borderRightWidth, s.borderRightStyle, s.borderRightColor);
  const bottom = isSideOn(s.borderBottomWidth, s.borderBottomStyle, s.borderBottomColor);
  const left = isSideOn(s.borderLeftWidth, s.borderLeftStyle, s.borderLeftColor);

  const htmlEl = el as HTMLElement;
  const anySide = top || right || bottom || left;
  const allSides = top && right && bottom && left;

  if (anySide) {
    el.setAttribute(REVEAL_ATTR, allSides ? "full" : "partial");
    // Set position:relative inline only when the element is static —
    // this cannot override fixed/sticky/absolute set by Tailwind classes
    // because inline styles lose to nothing (they always win), but we
    // only reach here when pos === "static" or "relative" already.
    if (pos === "static") {
      htmlEl.style.setProperty("position", "relative");
    }
    htmlEl.style.setProperty("--reveal-pt", top ? "1px" : "0px");
    htmlEl.style.setProperty("--reveal-pr", right ? "1px" : "0px");
    htmlEl.style.setProperty("--reveal-pb", bottom ? "1px" : "0px");
    htmlEl.style.setProperty("--reveal-pl", left ? "1px" : "0px");
  } else {
    el.removeAttribute(REVEAL_ATTR);
    // Only remove the inline position if we were the ones who set it
    if (htmlEl.style.position === "relative") {
      htmlEl.style.removeProperty("position");
    }
    htmlEl.style.removeProperty("--reveal-pt");
    htmlEl.style.removeProperty("--reveal-pr");
    htmlEl.style.removeProperty("--reveal-pb");
    htmlEl.style.removeProperty("--reveal-pl");
  }
}

function syncSubtree(root: Element | Document = document) {
  const iter = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
  let node: Node | null;
  while ((node = iter.nextNode())) {
    syncElement(node as Element);
  }
}

export function SpotlightProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useAnimationSettings();

  useEffect(() => {
    const scanId = (globalThis.requestIdleCallback ?? setTimeout)(
      () => syncSubtree()
    );

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === Node.ELEMENT_NODE) syncSubtree(n as Element);
          });
        } else if (m.type === "attributes" && m.attributeName !== REVEAL_ATTR) {
          syncElement(m.target as Element);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      observer.disconnect();
      (globalThis.cancelIdleCallback ?? clearTimeout)(scanId as number);
    };
  }, []);

  useEffect(() => {
    if (!settings.cardHover) {
      document.querySelectorAll<HTMLElement>(`[${REVEAL_ATTR}]`).forEach((el) => {
        el.style.removeProperty("--mouse-x");
        el.style.removeProperty("--mouse-y");
      });
      return;
    }

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        document.querySelectorAll<HTMLElement>(`[${REVEAL_ATTR}]`).forEach((el) => {
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        });
        rafId = null;
      });
    };

    const handleMouseLeave = () => {
      document.querySelectorAll<HTMLElement>(`[${REVEAL_ATTR}]`).forEach((el) => {
        el.style.removeProperty("--mouse-x");
        el.style.removeProperty("--mouse-y");
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [settings.cardHover]);

  return <>{children}</>;
}