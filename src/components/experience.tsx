"use client";
import { useEffect, useState } from "react";
import { CalendarDays, LinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BackendDeveloperIcon from "@/components/svg/backend-developer";
import GraphicDesignerIcon from "@/components/svg/graphic-designer";

const IconMap: Record<string, any> = {
  BackendDeveloperIcon,
  GraphicDesignerIcon,
};

type Job = {
  role: string;
  company: string;
  logo: string;
  duration: string;
  description: string;
  images: string[];
};

export const Experience = ({ id }: { id?: string }) => {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetch('/assets/json/experience.json')
      .then(res => res.json())
      .then((data: Job[]) => setJobs(data))
      .catch(console.error);
  }, []);

  if (jobs.length === 0) return null;

  return (
    <section id={id}>
      <h2 className="flex items-center group">
        Work Experience
        <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
        </a>
      </h2>
      <Card>
        <CardContent>
          <ul className="space-y-8">
            {jobs.map((j, i) => {
              const Logo = IconMap[j.logo] || BackendDeveloperIcon;
              return (
                <li key={i} className="border-b last:border-b-0 pb-6 mb-6 last:mb-0 last:pb-0">
                  {/* Job Details */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Logo className="fill-primary w-10 h-10 rounded-md border shadow-md object-cover p-1.5" />
                    </div>

                    <div>
                      <h3 className="font-semibold">{j.role}</h3>
                      <p className="text-sm text-muted-foreground">{j.company}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 flex items-center">
                    <CalendarDays className="size-3 mr-2" />
                    {j.duration}
                  </p>
                  <p className="text-sm mt-2">{j.description}</p>
                  {j.images && j.images.length > 0 && (
                    <div className="mt-4 flex overflow-x-auto gap-2 snap-x no-scrollbar">
                      {j.images.map((img, imgIndex) => (
                        <div key={imgIndex} className="relative shrink-0 w-auto h-24 sm:h-32 rounded-md overflow-hidden border shadow-sm snap-start">
                          <img
                            src={img}
                            alt={`${j.role} at ${j.company} preview ${imgIndex + 1}`}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
};
