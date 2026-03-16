"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, LinkIcon } from "lucide-react";
import { FaGithub, FaGlobe } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpandableCard } from "@/components/ui/expandable-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import MarkdownRenderer from "./markdown-renderer";
import { useAnimationSettings } from "./animation-settings";

const techColors: Record<string, string> = {
  "React": "bg-blue-500",
  "React Native": "bg-green-500",
  "Vue.js": "bg-purple-500",
  "Python": "bg-yellow-500",
  "C++": "bg-red-500",
  "C#": "bg-purple-500",
  "Java": "bg-orange-500",
  "JavaScript": "bg-yellow-500",
  "TSQL": "bg-blue-500",
  "Default": "bg-gray-500",
  "TypeScript": "bg-blue-500",
};

const PROJECTS_NUM = 6;

function ProjectItem({ project }: { project: Project }) {
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [isLoadingReadme, setIsLoadingReadme] = useState(false);
  const { settings } = useAnimationSettings();

  useEffect(() => {
    const fetchReadme = async () => {
      setIsLoadingReadme(true);
      try {
        const res = await fetch(`https://raw.githubusercontent.com/abdxdev/${project.raw_name}/${project.default_branch || 'main'}/README.md`);
        if (res.ok) {
          const text = await res.text();
          setReadmeContent(text);
        } else {
          setReadmeContent("No README available for this project.");
        }
      } catch (err) {
        setReadmeContent("Failed to load README.");
      } finally {
        setIsLoadingReadme(false);
      }
    };

    fetchReadme();
  }, [project.raw_name, project.default_branch]);

  const images = project.thumbnails && project.thumbnails.length > 0
    ? project.thumbnails
    : [project.default_image_url];

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const CarouselContentRender = (isExpanded: boolean) => (
    <Carousel
      opts={{ startIndex: isExpanded ? current : 0, align: "start" }}
      plugins={!isExpanded ? [Autoplay({ delay: 5000 })] : undefined}
      setApi={isExpanded ? undefined : setApi}
      className="w-full h-full"
    >
      <CarouselContent className="h-full ml-0">
        {images.map((src, index) => (
          <CarouselItem key={index} className="pl-0 basis-full">
            <div className="relative aspect-video w-full">
              <img
                src={src}
                alt={`${project.title} screenshot ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );

  const BadgesNode = (project.working_on || project.is_university_project) ? (
    <span className="flex gap-1.5 items-center">
      {project.working_on && (
        <Badge className="bg-green-500/20 dark:bg-green-600/30 text-green-700 dark:text-green-400 hover:bg-green-500/30 font-medium px-2 py-0">
          Active
        </Badge>
      )}
      {project.is_university_project && (
        <Badge className="bg-blue-500/20 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 font-medium px-2 py-0">
          University
        </Badge>
      )}
    </span>
  ) : null;

  const LinksNode = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2 mr-4">
        <div
          className={cn(
            "size-3.5 rounded-full",
            project.language ? techColors[project.language] : techColors.Default ||
              techColors.Default
          )}
        />
        <span className="text-xs font-medium text-muted-foreground mr-2">
          {project.language}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {project.homepage && (
          <a
            href={project.homepage}
            className="flex items-center gap-1 text-sm hover:underline z-20 relative pointer-events-auto"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <FaGlobe className="size-4" />
            <span>Site</span>
          </a>
        )}
        <a
          href={project.html_url}
          className="flex items-center gap-1 text-sm hover:underline z-20 relative pointer-events-auto"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <FaGithub className="size-4" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );

  const TitleNode = (
    <span className="py-1 content-between items-center">
      <span className="mr-2">
        {project.title}
      </span>

      {project.priority === 0 && (
        <span className="text-yellow-500 text-2xl relative top-0.5 mr-2 inline" title="Featured Project">★</span>
      )}
      {BadgesNode && (
        <span className="inline-flex gap-1.5 items-center align-middle my-2">
          {project.working_on && (
            <Badge className="bg-green-500/20 dark:bg-green-600/30 text-green-700 dark:text-green-400 hover:bg-green-500/30 font-medium px-2 py-0">
              Active
            </Badge>
          )}
          {project.is_university_project && (
            <Badge className="bg-blue-500/20 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 font-medium px-2 py-0">
              University
            </Badge>
          )}
        </span>
      )}
    </span>
  );

  return (
    <ExpandableCard
      title={TitleNode}
      src={images[0]}
      customImageNode={CarouselContentRender}
      links={LinksNode}
      description={project.description}
      disableAnimation={!settings.expandableCard}
      classNameExpanded="[&_h4]:text-black dark:[&_h4]:text-white [&_h4]:font-medium"
      className="h-full"
    >
      <div className="pb-8 min-w-0 overflow-hidden">
        {isLoadingReadme ? (
          <div className="whitespace-pre-wrap font-sans text-sm text-zinc-500">Loading README...</div>
        ) : (
          <MarkdownRenderer content={readmeContent || "No README available for this project."} />
        )}
      </div>
    </ExpandableCard>
  );
}

export const Projects = ({ id }: { id?: string }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [visibleCount, setVisibleCount] = useState(PROJECTS_NUM);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/portfolio/projects");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: Project[] = await response.json();
        data.sort((a, b) => {
          const ap = a.priority ?? (a.working_on ? 0 : Infinity);
          const bp = b.priority ?? (b.working_on ? 0 : Infinity);
          return ap - bp || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setProjects(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching repositories:", error);
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id={id}>
      <h2 className="flex items-center group">
        Featured Projects
        <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
        </a>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: PROJECTS_NUM }).map((_, index) => (
            <Card key={index} className="overflow-hidden p-0">
              <Skeleton className="w-full aspect-video rounded-none" />
              <div className="p-4 px-5 pb-5 flex items-start justify-between">
                <div className="flex flex-col flex-1 gap-2">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-5 w-2/3" />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-3.5 rounded-full" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                </div>
                <Skeleton className="size-8 rounded-full ml-4 shrink-0" />
              </div>
            </Card>
          ))
        ) : (
          projects.slice(0, visibleCount).map((project, projectIndex) => (
            <ProjectItem key={projectIndex} project={project} />
          ))
        )}
      </div>

      {visibleCount < projects.length && (
        <div className="flex justify-end mt-4">
          <Button
            variant="ghost"
            onClick={() => setVisibleCount(visibleCount + 100)}
            className="gap-1"
          >
            Show All
            <ChevronDown />
          </Button>
        </div>
      )}
    </section>
  );
};