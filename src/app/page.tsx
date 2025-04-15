import { ThemeToggler } from "@/components/ThemeToggler";
import { Sidebar } from "@/components/Sidebar";
import { AboutMe } from "@/components/AboutMe";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { Glare } from "@/components/Glare";
import { ScrollArea } from "@/components/ui/scroll-area";
import { constructMetadata } from "@/lib/metadata";

// Per-page metadata for better SEO
export const metadata = constructMetadata({
  title: 'Abdul Rahman | Software Developer & UI/UX Designer Portfolio',
  description: 'Portfolio of Abdul Rahman (abd), a software developer specializing in Python, C/C++, Django, Flask applications and VS Code extensions development with expertise in UI/UX design.',
  keywords: 'Python developer, C/C++ programmer, Django, Flask, VS Code extensions, abdxdev, abd, UI/UX design, Adobe design, Figma, 10x Pretender, AI LaTeX Helper',
});

export default function Home() {
  return (
    <ScrollArea className="bg-background min-h-screen h-screen overflow-y-auto relative w-full p-0">
      <div className="relative w-full h-full">
      {/* Glare Effect */}
      <Glare />
      <div className="sticky top-0 right-0">
        {/* Theme Toggler */}
        <ThemeToggler />
      </div>
      <div className="container max-w-screen-lg mx-auto px-4 py-8">
        <header className="sr-only">
          <h1>Abdul Rahman - Software Developer & UI/UX Designer</h1>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* (Profile and Skills) Sidebar Section */}
          <Sidebar />
          {/* Main Section */}
          <main className="md:col-span-2">
            {/* About Me Section */}
            <AboutMe id="about-me" />
            {/* Experience Section */}
            <Experience id="experience" />
            {/* Projects Section */}
            <Projects id="projects" repoName="abdxdev" />
          </main>
        </div>
      </div>
      </div>
    </ScrollArea>
  );
}
