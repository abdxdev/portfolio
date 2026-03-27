import { useEffect, useState } from "react";
import { LinkIcon } from "lucide-react";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { WordRotate } from "@/components/ui/word-rotate";

export const AboutMe = ({ id }: { id?: string }) => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    fetch("/assets/json/description.json")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json) && json.every((v) => typeof v === "string"))
          setLines(json.map((s: string) => s.trim()).filter(Boolean));
      })
      .catch(() => {});
  }, []);

  const [intro, ...rest] = lines;

  return (
    <section id={id}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center group">
            About Me
            <a
              href={`#${id}`}
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Link to About Me section"
            >
              <LinkIcon className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          {intro && (
            <p className="text-sm text-muted-foreground leading-relaxed border-b pb-5 mb-5">{intro}</p>
          )}
          <div className="h-10 flex items-center">
            {rest.length > 0 && (
              <WordRotate
                words={rest}
                duration={4000}
                className="text-sm text-muted-foreground leading-relaxed"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};