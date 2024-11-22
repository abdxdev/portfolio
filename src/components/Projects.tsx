"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

type Repo = {
    name: string;
    description: string | null;
    language: string | null;
    html_url: string;
    created_at: string;
};

type Project = {
    title: string;
    description: string;
    tech: string;
    link: string;
    createdAt: string;
};

export const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(
                    "https://api.github.com/users/abdbbdii/repos"
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data: Repo[] = await response.json();
                const TitleCase = (str: string) => {
                    str = str.replaceAll("-", " ").replaceAll("_", " ")
                    return str.split(' ').map(function(word) {
                        return word.replace(word[0], word[0].toUpperCase());
                    }).join(' ');
                };
                
                // Filter and map repositories
                const filteredProjects = data
                .filter(
                    (repo) =>
                        repo.description &&
                    repo.description.endsWith(":add")
                )
                .map((repo) => ({
                        title: TitleCase(repo.name),
                        description: repo.description!.replace(" :add", ""),
                        tech: repo.language || "Default",
                        link: repo.html_url,
                        createdAt: repo.created_at,
                    }));
                
                filteredProjects.sort((a, b) => {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                setProjects(filteredProjects);
            } catch (error) {
                console.error("Error fetching repositories:", error);
            }
        };

        fetchProjects();
    }, []);

    return (
        <>
            <h2 className="text-xl font-bold mb-4">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {projects.map((project, index) => (
                    <Card key={index}>
                        <CardContent className="pt-6 h-full">
                            <div className="flex flex-col h-full">
                                <Link
                                    href={project.link}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    {project.title}
                                </Link>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">
                                    {project.description}
                                </p>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className={cn(
                                                "size-4 rounded-full",
                                                techColors[project.tech] || techColors.Default
                                            )}
                                        />
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {project.tech}
                                        </span>
                                    </div>
                                    <Link
                                        href={project.link}
                                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                        View Project
                                        <ExternalLink className="inline-block size-3" />
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
};
