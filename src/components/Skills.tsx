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
    "XML",
    "Markdown",
    "LaTeX",
    "CSS",
    "VS Code",
    "Visual Studio",
    "Jupyter",
    "Git",
    "Github",
    "GitLab",
    "Django",
    "Flask",
    "Streamlit",
    "Tkinter",
    "Flet",
    "Reflex",
    ".NET",
    "Win UI 3",
    "Docker",
    "Vercel",
    "Render",
    "Azure",
    "MySQL",
    "PostgreSQL",
    "SQLite",
    "Microsoft SQL Server",
    "Access",
    "OpenAI",
    "Discord",
    "WhatsApp",
    "Google",
    "Adobe Illustrator",
    "Adobe Photoshop",
    "Adobe Premiere Pro",
    "Adobe After Effects",
    "Figma",
    "Spline",
    "Blender",
    "Windows",
    "Linux",
    "Android"
]


export const Skills = () => {
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Skills</CardTitle>
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
    )
}