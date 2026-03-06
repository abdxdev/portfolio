import { LinkIcon } from "lucide-react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import skillsData from "@/data/skills.json";

// Dynamically load skills with portfolio=true
const skills = skillsData
  .flatMap(category => category.skills)
  .filter(skill => skill.portfolio)
  .map(skill => skill.name);

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
