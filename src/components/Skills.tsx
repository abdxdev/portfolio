import { LinkIcon } from "lucide-react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const skills = [
  "Python",
  "C/C++",
  "C#",
  "JavaScript",
  "SQL",
  "HTML",
  // "XML",
  // "Markdown",
  "LaTeX",
  "CSS",
  // "VS Code",
  // "Visual Studio",
  // "Jupyter",
  // "Git",
  // "Github",
  // "GitLab",
  "Django",
  "Flask",
  "Streamlit",
  "Tkinter",
  "Flet",
  "Reflex",
  ".NET",
  "Win UI 3",
  // "Docker",
  // "Vercel",
  // "Render",
  // "Azure",
  // "MySQL",
  // "PostgreSQL",
  // "SQLite",
  // "Microsoft SQL Server",
  // "Access",
  // "OpenAI",
  // "Discord",
  // "WhatsApp",
  // "Google",
  // "Adobe Illustrator",
  // "Adobe Photoshop",
  // "Adobe Premiere Pro",
  // "Adobe After Effects",
  // "Figma",
  // "Spline",
  // "Blender",
  // "Windows",
  // "Linux",
  // "Android"
]


export const Skills = ({ id }: { id?: string }) => {
  return (
    <section id={id}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center group">
            Skills
            <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <Badge key={i} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
