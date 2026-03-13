"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface AnimationSettings {
  cardHover: boolean;
  lightRays: boolean;
  clickSparks: boolean;
  introAnimation: boolean;
  shinyText: boolean;
  expandableCard: boolean;
}

interface AnimationSettingsContextValue {
  settings: AnimationSettings;
  toggle: (key: keyof AnimationSettings) => void;
  setAll: (enabled: boolean) => void;
}

const STORAGE_KEY = "animation-settings";

function getIsMd() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

function getDefaults(): AnimationSettings {
  const isMd = getIsMd();
  return {
    cardHover: !isMd,
    lightRays: true,
    clickSparks: !isMd,
    introAnimation: true,
    shinyText: true,
    expandableCard: true,
  };
}

const AnimationSettingsContext =
  createContext<AnimationSettingsContextValue | null>(null);

export function AnimationSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<AnimationSettings>(getDefaults);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AnimationSettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const toggle = useCallback((key: keyof AnimationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setAll = useCallback((enabled: boolean) => {
    setSettings({
      cardHover: enabled,
      lightRays: enabled,
      clickSparks: enabled,
      introAnimation: enabled,
      shinyText: enabled,
      expandableCard: enabled,
    });
  }, []);

  return (
    <AnimationSettingsContext.Provider value={{ settings, toggle, setAll }}>
      {children}
    </AnimationSettingsContext.Provider>
  );
}

export function useAnimationSettings() {
  const ctx = useContext(AnimationSettingsContext);
  if (!ctx)
    throw new Error(
      "useAnimationSettings must be used within AnimationSettingsProvider"
    );
  return ctx;
}
