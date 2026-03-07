"use client";

import { useState } from "react";
import { LayoutGroup } from "motion/react";
import { AboutMe } from "@/components/about-me";
import { ApiButton } from "@/components/api-button";
import { Experience } from "@/components/experience";
import LightRays from "@/components/LightRays";
import { Projects } from "@/components/projects";
import { Sidebar } from "@/components/sidebar";
// import { ModeToggle } from "@/components/theme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IntroOverlay } from "@/components/intro-overlay";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

export const HomeClient = () => {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <LayoutGroup>
      {!introComplete && (
        <IntroOverlay onComplete={() => setIntroComplete(true)} />
      )}
      <ScrollArea className="bg-background min-h-screen h-screen overflow-y-auto relative w-full p-0">
        <div className="relative w-full h-full">
          {/* Light Rays Effect */}
          <div className="absolute inset-0 z-1 pointer-events-none opacity-30">
            <LightRays />
          </div>
          <div className="sticky top-0 right-0 z-50">
            {/* Theme Toggler */}
            <div className="m-4 absolute right-0 top-0 gap-2 flex items-center">
              <ApiButton />
              <AnimatedThemeToggler />
              {/* <ModeToggle /> */}
            </div>
          </div>
          <div className="container max-w-5xl mx-auto px-4 py-8">
            <header className="sr-only">
              <h1>Abdul Rahman - Software Developer & UI/UX Designer</h1>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6">
              {/* (Profile and Skills) Sidebar Section */}
              <Sidebar />
              {/* Main Section */}
              <main className="md:col-span-2">
                {/* About Me Section */}
                <AboutMe id="about-me" />
                {/* Experience Section */}
                <Experience id="experience" />
                {/* Projects Section */}
                <Projects id="projects" />
              </main>
            </div>
          </div>
        </div>
      </ScrollArea>
    </LayoutGroup>
  );
};
