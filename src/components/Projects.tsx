"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Github, Globe, LinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Autoplay from "embla-carousel-autoplay";

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

export const Projects = ({ id, repoName }: { id?: string, repoName?: string }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [failedImages, setFailedImages] = useState<Record<number, Set<number>>>({});
  const [loadedImages, setLoadedImages] = useState<Record<number, Set<number>>>({});
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = (projectIndex: number, imageIndex: number) => {
    setFailedImages((prev) => {
      const updated = { ...prev };
      if (!updated[projectIndex]) {
        updated[projectIndex] = new Set();
      }
      updated[projectIndex].add(imageIndex);
      return updated;
    });
  };

  const handleImageLoaded = (projectIndex: number, imageIndex: number) => {
    setLoadedImages((prev) => {
      const updated = { ...prev };
      if (!updated[projectIndex]) {
        updated[projectIndex] = new Set();
      }
      updated[projectIndex].add(imageIndex);
      return updated;
    });
  };

  const openImageDialog = (projectIndex: number, name: string | null, isDefaultThumbnail = false) => {
    setSelectedProjectIndex(projectIndex);
    setSelectedName(name);
    setIsDialogOpen(true);
    if (isDefaultThumbnail) {
      setFailedImages((prev) => {
        const updated = { ...prev };
        if (!updated[projectIndex]) {
          updated[projectIndex] = new Set();
        }
        updated[projectIndex].add(-1);
        return updated;
      });
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/projects?source=github&username=${repoName}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProjects(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching repositories:", error);
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [repoName]);

  if (isLoading) {
    return (
      <section id={id}>
        <h2 className="text-xl font-bold mb-4">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="pt-6 h-full">
                <div className="flex flex-col h-full">
                  <Skeleton className="w-full aspect-video max-w-xs mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <div className="mt-auto flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id={id}>
      <h2 className="text-xl font-bold mb-4 flex items-center group">
        Featured Projects
        <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
        </a>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.slice(0, visibleCount).map((project, projectIndex) => {
          const allImagesFailed = project.thumbnails.every(
            (_, imageIndex) => failedImages[projectIndex]?.has(imageIndex)
          );
          const hasValidImages = project.thumbnails.some(
            (_, imageIndex) => !failedImages[projectIndex]?.has(imageIndex)
          );

          return (
            <Card key={projectIndex} className="transition-opacity duration-500 ease-in-out">
              <CardContent className="pt-6 h-full">
                <div className="flex flex-col h-full">
                  <Carousel
                    plugins={[
                      Autoplay({
                        delay: 5000,
                      }),
                    ]}
                    className="w-full max-w-xs pb-4"
                  >
                    <CarouselContent>
                      {!hasValidImages || allImagesFailed ? (
                        <CarouselItem>
                          <div>
                            <Card className="w-full h-full overflow-hidden">
                              <CardContent className="p-0">
                                <div className="aspect-video overflow-hidden relative">
                                  <Image
                                    src={project.default_image_url}
                                    alt="Default Thumbnail"
                                    width={400}
                                    height={300}
                                    className="w-full h-full object-cover cursor-pointer transition-all duration-500 ease-in-out dark:invert"
                                    onClick={() => openImageDialog(projectIndex, project.title, true)}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ) : (
                        project.thumbnails.map((thumb, imageIndex) => {
                          if (failedImages[projectIndex]?.has(imageIndex)) {
                            return null;
                          }

                          const isImageLoaded = loadedImages[projectIndex]?.has(imageIndex);

                          return (
                            <CarouselItem key={imageIndex}>
                              <div>
                                <Card className="w-full h-full overflow-hidden">
                                  <CardContent className="p-0">
                                    <div className="aspect-video overflow-hidden relative">
                                      {!isImageLoaded && (
                                        <div className="absolute inset-0 bg-accent animate-pulse" />
                                      )}
                                      <Image
                                        src={thumb}
                                        alt={`Screenshot ${imageIndex + 1}`}
                                        width={400}
                                        height={300}
                                        className={cn(
                                          "w-full h-full object-cover cursor-pointer transition-all duration-500 ease-in-out",
                                          isImageLoaded ? "opacity-100" : "opacity-0"
                                        )}
                                        onLoad={() => {
                                          handleImageLoaded(projectIndex, imageIndex);
                                        }}
                                        onError={() =>
                                          handleImageError(projectIndex, imageIndex)
                                        }
                                        onClick={() => openImageDialog(projectIndex, project.title)}
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </CarouselItem>
                          );
                        })
                      )}
                    </CarouselContent>
                  </Carousel>
                  <div className="flex justify-between items-start mb-1">
                    <Link
                      href={project.repo.html_url}
                      className="font-semibold text-primary hover:underline"
                    >
                      {project.title}
                      {project.priority === 0 && (
                        <span className="text-yellow-500 ml-2" title="Featured Project">★</span>
                      )}
                    </Link>

                    <div className="flex gap-1.5 items-center">
                      {project.workingOn && (
                        <Badge className="bg-green-500/20 dark:bg-green-600/30 text-green-700 dark:text-green-400 hover:bg-green-500/30">
                          Active
                        </Badge>
                      )}
                      {project.isUniversityProject && (
                        <Badge className="bg-blue-500/20 dark:bg-blue-600/30 text-blue-700 dark:text-blue-400 hover:bg-blue-500/30">
                          University
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {project.repo.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={cn(
                          "size-4 rounded-full",
                          project.repo.language ? techColors[project.repo.language] : techColors.Default ||
                            techColors.Default
                        )}
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {project.repo.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {project.repo.homepage && (
                        <Link
                          href={project.repo.homepage}
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="size-4" />
                          <span>Site</span>
                        </Link>
                      )}
                      <Link
                        href={project.repo.html_url}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Github className="size-4" />
                        <span>GitHub</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More Button */}
      {visibleCount < projects.length && (
        <div className="flex justify-end mt-4">
          <Button
            variant="ghost"
            onClick={() => setVisibleCount(visibleCount + 4)}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Image Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-screen-xl p-0 overflow-hidden bg-transparent border-0">
          {selectedProjectIndex !== null && (
            <div className="bg-black bg-opacity-20 backdrop-blur-sm p-2 rounded-lg">
              <Carousel opts={{ align: "center" }} className="w-full max-w-7xl mx-auto">
                <CarouselContent>
                  {projects[selectedProjectIndex].thumbnails
                    .filter((_, index) => !failedImages[selectedProjectIndex]?.has(index))
                    .map((image, index) => (
                      <CarouselItem key={index} className="flex items-center justify-center">
                        <Image
                          src={image}
                          alt={selectedName || "Project Screenshot"}
                          width={1920}
                          height={1080}
                          className="w-full h-auto max-h-[80vh] object-contain rounded"
                        />
                      </CarouselItem>
                    ))}
                  {failedImages[selectedProjectIndex]?.has(-1) && (
                    <CarouselItem className="flex items-center justify-center">
                      <Image
                        src={projects[selectedProjectIndex].default_image_url}
                        alt={selectedName || "Default Thumbnail"}
                        width={1920}
                        height={1080}
                        className="w-full h-auto max-h-[80vh] object-contain rounded"
                      />
                    </CarouselItem>
                  )}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};