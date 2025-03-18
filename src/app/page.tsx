import { ThemeToggler } from "@/components/ThemeToggler";
import { Sidebar } from "@/components/Sidebar";
import { AboutMe } from "@/components/AboutMe";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  return (
    <ScrollArea className="bg-background min-h-screen h-screen overflow-y-auto relative w-full rounded-md border p-0">
      <div className="relative w-full h-full">
      <div className="absolute inset-0 isolate contain-strict z-[1] pointer-events-none">
        <div className="absolute left-0 top-0 h-[1280px] w-[560px] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]"></div>
        <div className="absolute left-0 top-0 h-[1280px] w-[240px] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]"></div>
        <div className="absolute left-0 top-0 h-[1280px] w-[240px] -translate-y-[350px] -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]"></div>
      </div>
      <div className="sticky top-0 right-0">
        {/* Theme Toggler */}
        <ThemeToggler />
      </div>
      <div className="container max-w-screen-lg mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* (Profile and Skills) Sidebar Section */}
          <Sidebar />
          {/* Main Section */}
          <main className="md:col-span-2">
            {/* About Me Section */}
            <AboutMe />
            {/* Experience Section */}
            <Experience />
            {/* Projects Section */}
            <Projects />
          </main>
        </div>
      </div>
      </div>
    </ScrollArea>
  );
}
