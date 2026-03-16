"use client";
import { LinkIcon } from "lucide-react";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";

export const Blogs = ({ id }: { id?: string }) => {

  return (
    <section id={id}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center group">
            Blogs
            <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground content-center">
            Comming soon...
            <br/>
            <br/>
            I plan to share my thoughts on software development, design, and my journey as a developer. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </section>
  );
};