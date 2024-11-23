import { ThemeToggler } from "@/components/ThemeToggler";
import { Sidebar } from "@/components/Sidebar";
import { AboutMe } from "@/components/AboutMe";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
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
  );
}
