import { CalendarDays, LinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BackendDeveloperIcon from "@/components/icons/BackendDeveloperIcon";
import GraphicDesignerIcon from "@/components/icons/GraphicDesignerIcon";

const jobs = [
  {
    role: "Backend Developer",
    company: "Freelance (Self Employed)",
    logo: BackendDeveloperIcon,
    duration: "2023 - Present",
    description: "Developed backend systems for clients using Django, Flask, and .NET, including REST APIs, web applications, and automation scripts.",
    images: [],
  },
  {
    role: "Graphic Designer",
    company: "Freelance (Self Employed)",
    logo: GraphicDesignerIcon,
    duration: "2021 - 2023",
    description: "Directed and designed marketing materials for clients, including UI/UX design, branding, and social media content.",
    images: [],
  },
];

export const Experience = ({ id }: { id?: string }) => (
  <section id={id}>
    <h2 className="text-xl font-bold mb-4 flex items-center group">
      Work Experience
      <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
      </a>
    </h2>
    <Card className="mb-6">
      <CardContent className="pt-6">
        <ul className="space-y-8">
          {jobs.map((j, i) => (
            <li key={i} className="border-b last:border-b-0 pb-8 last:pb-0">
              {/* Job Details */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <j.logo className="fill-primary w-10 h-10 rounded-md border shadow-md object-cover p-1.5" />
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
              {/* Job Images */}
              {/* <JobImages 
                                role={j.role} 
                                link={j.link}
                                images={j.images} 
                                duration={j.duration} 
                            /> */}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </section>
);
