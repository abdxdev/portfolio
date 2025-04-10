"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
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

type Project = {
    raw_name: string;
    name: string;
    description: string;
    language: string;
    html_url: string;
    created_at: string;
    thumbnails: string[];
};

type ProjectsProps = {
    repoName: string;
};

export const Projects = ({ repoName: githubUsername }: ProjectsProps) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [visibleCount, setVisibleCount] = useState(4);
    const [failedImages, setFailedImages] = useState<Record<number, Set<number>>>({});
    const [loadedImages, setLoadedImages] = useState<Record<number, Set<number>>>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState<string | null>(null);
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

    const openImageDialog = (imageUrl: string, name: string | null) => {
        setSelectedImage(imageUrl);
        setSelectedName(name);
        setIsDialogOpen(true);
    };

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://api.github.com/users/${githubUsername}/repos`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data: Project[] = await response.json();

                const snakeToTitle = (str: string) => {
                    str = str.replaceAll("-", " ").replaceAll("_", " ");
                    return str
                        .split(" ")
                        .map((word) =>
                            word.replace(word[0], word[0].toUpperCase())
                        )
                        .join(" ");
                };
                const camalToTitle = (str: string) => {
                    if (str.includes("LaTeX")) {
                        return str;
                    }
                    return str.replace(/([a-z])([A-Z])/g, "$1 $2");
                };

                const filteredProjects = data
                    .filter(
                        (repo) =>
                            repo.description &&
                            repo.description.endsWith(":add")
                    )
                    .map((repo) => ({
                        raw_name: repo.name,
                        name: camalToTitle(snakeToTitle(repo.name)),
                        description: repo.description.replace(" :add", ""),
                        language: repo.language,
                        html_url: repo.html_url,
                        created_at: repo.created_at,
                        thumbnails: Array.from({ length: 5 }, (_, i) =>
                            `https://github.com/${githubUsername}/${repo.name}/blob/main/screenshots/screenshot_${i + 1}.png?raw=true`
                        )
                    }));

                filteredProjects.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                );

                setProjects(filteredProjects);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching repositories:", error);
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [githubUsername]);

    // Render loading skeletons
    if (isLoading) {
        return (
            <>
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
            </>
        );
    }

    return (
        <>
            <h2 className="text-xl font-bold mb-4">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.slice(0, visibleCount).map((project, projectIndex) => {
                    // Determine if all images have failed or if there are no images
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
                                                                        src={`https://opengraph.githubassets.com/1/${githubUsername}/${project.raw_name}`}
                                                                        alt="Placeholder"
                                                                        width={400}
                                                                        height={300}
                                                                        className="w-full h-full object-cover cursor-pointer transition-all duration-500 ease-in-out"
                                                                        onClick={() =>
                                                                            openImageDialog(
                                                                                `https://opengraph.githubassets.com/1/${githubUsername}/${project.raw_name}`,
                                                                                project.name
                                                                            )
                                                                        }
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
                                                                                onClick={() => openImageDialog(thumb, project.name)}
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
                                    <Link
                                        href={project.html_url}
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        {project.name}
                                    </Link>
                                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                                        {project.description}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className={cn(
                                                    "size-4 rounded-full",
                                                    techColors[project.language] ||
                                                    techColors.Default
                                                )}
                                            />
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {project.language}
                                            </span>
                                        </div>
                                        <Link
                                            href={project.html_url}
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            View Project
                                            <ExternalLink className="inline-block size-3" />
                                        </Link>
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
                        <p className="font-semibold w-full h-full">Load More</p>
                    </Button>
                </div>
            )}

            {/* Image Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-screen-2xl p-0 overflow-hidden bg-transparent border-0">
                    <div className="relative w-full">

                        {selectedImage && (
                            <div className="bg-black bg-opacity-20 backdrop-blur-sm p-2 rounded-lg">
                                <Image
                                    src={selectedImage}
                                    alt={selectedName || "Project Screenshot"}
                                    width={1920}
                                    height={1080}
                                    className="w-full h-auto max-h-screen object-contain rounded"
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};