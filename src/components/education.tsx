"use client";
import { CalendarDays, LinkIcon } from "lucide-react";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";

const education = [
  {
    role: "Bachelors in Computer Science",
    company: "University of Engineering and Technology, Lahore",
    duration: "2023 – 2027 (Expected)",
    description: "CGPA: 3.51 / 4.00",
  },
];

export const Education = ({ id }: { id?: string }) => {
  return (
    <section id={id}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center group">
            Education
            <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-6">
            {education.map((j, i) => (
              <li key={i} className="last:pb-0 border-b last:border-b-0 pb-6">
                <h3 className="font-semibold">{j.role}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{j.company}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="size-3 shrink-0" />
                    {j.duration}
                  </p>
                  <p className="text-xs text-muted-foreground">{j.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
};