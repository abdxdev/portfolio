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
            About Me
            <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Link to About Me section">
              <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            <p>
              Software engineer with hands-on experience building backend systems, desktop applications, and developer tools, passionate about automation, clean code, and creating solutions that improve productivity.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}