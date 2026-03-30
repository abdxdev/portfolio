"use client";

import { useState, useEffect } from "react";
import { LayoutGroup } from "motion/react";
import { AboutMe } from "@/components/about-me";
import { Experience } from "@/components/experience";
import { LightRays } from "@/components/ui/light-rays";
import { Projects } from "@/components/projects";
import { Contact } from "@/components/contact";
import { Skills } from "./skills";
import { Profile } from "./profile";
import { Conversation } from "./conversation";
import { Education } from "./education";
import { Blogs } from "./blogs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IntroOverlay } from "@/components/intro-overlay";
import { ToggleTheme } from "./ui/toggle-theme";
import { SettingsButton } from "@/components/settings-button";
import { useAnimationSettings } from "@/components/animation-settings";
import ClickSpark from "@/components/ClickSpark";
import Signature from "@/components/svg/signature";

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
      <div className="absolute inset-x-0 top-0 h-screen z-1 pointer-events-none opacity-70">
        <LightRays />
      </div>
    )}
    <div className="sticky top-0 right-0 z-50">
      <div className="m-4 absolute right-0 top-0 flex items-center">
        <SettingsButton />
        <ToggleTheme animationType="circle-spread" duration={600} />
      </div>
    </div>
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="sr-only">
        <h1>Abdul Rahman - Software Engineer & UI/UX Designer</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="md:col-span-1 gap-6 flex flex-col">
          <Profile />
          <div className="md:hidden block" >
            <AboutMe id="about-me" />
          </div>
          <Skills id="skills" />
          <Education id="education" />
          <Conversation id="conversation" />
          <Blogs id="blogs" />
        </aside>
        <main className="md:col-span-2 gap-6 flex flex-col">
          <div className="md:block hidden" >
            <AboutMe id="about-me" />
          </div>
          <Experience id="experience" />
          <Contact id="contact" />
          <Projects id="projects" />
        </main>
        <footer className="md:col-span-3 text-center text-sm overflow-hidden text-muted-foreground">
          <Signature className="w-full max-h-20" />
          <p>&copy; {new Date().getFullYear()} abdxdev.</p>
          {/* <div className="pointer-events-none select-none w-full flex items-center justify-center text-primary">
            <svg
              viewBox="0 0 100 25"
              className="w-full h-auto"
              style={{
                fontFamily: '"Latin Modern Roman", "Computer Modern Roman", serif',
                fontStyle: 'italic',
                fill: 'currentColor',
              }}
            >
              <text x="50%" y="190%" textAnchor="middle" fontSize="65">
                &alpha;&beta;&delta;
              </text>
            </ svg>
          </div> */}
        </footer>
      </div>
    </div>
  </div>
);
