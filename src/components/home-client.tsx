"use client";

import { useState, useEffect } from "react";
import { LayoutGroup } from "motion/react";
import { AboutMe } from "@/components/about-me";
import { ApiButton } from "@/components/api-button";
import { Experience } from "@/components/experience";
import LightRays from "@/components/LightRays";
import { Projects } from "@/components/projects";
import { Contact } from "@/components/contact";
import { Sidebar } from "@/components/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IntroOverlay } from "@/components/intro-overlay";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";
import { SettingsButton } from "@/components/settings-button";
import { useAnimationSettings } from "@/components/animation-settings";
import ClickSpark from "@/components/ClickSpark";

export const HomeClient = () => {
  const [introComplete, setIntroComplete] = useState(false);
  const [blurPhaseComplete, setBlurPhaseComplete] = useState(false);
  const { settings } = useAnimationSettings();
  const [isDark, setIsDark] = useState(false);

  // Skip blur phase gate when intro animation is disabled
  const showContent = !settings.introAnimation || blurPhaseComplete;

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const content = (
    <LayoutGroup>
      {settings.introAnimation && !introComplete && (
        <IntroOverlay
          onComplete={() => setIntroComplete(true)}
          onBlurComplete={() => setBlurPhaseComplete(true)}
        />
      )}
      {/* Single HomeContent instance to avoid duplicate layoutId.
          On mobile (no h-screen), the body scrolls natively.
          On md+, h-screen constrains height so ScrollArea provides a custom scrollbar. */}
      <ScrollArea className="bg-background min-h-screen md:h-screen relative w-full p-0">
        {showContent && <HomeContent settings={settings} />}
      </ScrollArea>
    </LayoutGroup>
  );

  return settings.clickSparks ? <ClickSpark sparkColor={isDark ? '#fff' : '#000'}>{content}</ClickSpark> : content;
};

const HomeContent = ({ settings }: { settings: ReturnType<typeof useAnimationSettings>["settings"] }) => (
  <div className="relative w-full h-full">
    {settings.lightRays && (
      <div className="absolute inset-x-0 top-0 h-screen z-1 pointer-events-none opacity-30 mask-[linear-gradient(to_bottom,black_40%,transparent_100%)]">
        <LightRays />
      </div>
    )}
    <div className="sticky top-0 right-0 z-50">
      <div className="m-4 absolute right-0 top-0 flex items-center">
        <ApiButton />
        <SettingsButton />
        <AnimatedThemeToggler />
      </div>
    </div>
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="sr-only">
        <h1>Abdul Rahman - Software Engineer & UI/UX Designer</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6">
        <Sidebar />
        <main className="md:col-span-2 gap-6 flex flex-col">
          <AboutMe id="about-me" />
          <Experience id="experience" />
          <Contact id="contact" />
          <Projects id="projects" />
        </main>
        <footer className="md:col-span-3 text-center text-sm opacity-50">
          &copy; {new Date().getFullYear()} abdxdev.
        </footer>
      </div>
    </div>
  </div>
);
