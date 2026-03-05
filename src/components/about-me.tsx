import { LinkIcon } from "lucide-react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent
} from "@/components/ui/card";

export const AboutMe = ({ id }: { id?: string }) => {
  return (
    <section id={id} aria-labelledby="about-heading">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center group">
            <h2 id="about-heading">About Me</h2>
            <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Link to About Me section">
              <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert text-muted-foreground">
            <p>
              Software developer and designer specializing in Python, C/C++, Django, Flask, and UI/UX design. Creator of VS Code extensions and innovative software solutions.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}