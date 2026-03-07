"use client";

import { useState } from "react";
import { LinkIcon, ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import skillsData from "@/data/skills.json";

const portfolioSkills = skillsData
  .flatMap(category => category.skills)
  .filter(skill => skill.portfolio)
  .map(skill => skill.name);

export const Skills = ({ id }: { id?: string }) => {
  const [showAll, setShowAll] = useState(false);

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
          {showAll ? (
            <ScrollArea className="h-64">
              <div className="space-y-4 pr-4">
                {skillsData.map((category, ci) => (
                  <div key={ci}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {category.category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, si) => (
                        <Badge key={si} variant="secondary">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-wrap gap-2">
              {portfolioSkills.map((s, i) => (
                <Badge key={i} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="mt-4 w-full"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="ml-1 h-4 w-4" /></>
            ) : (
              <>Show All Skills <ChevronDown className="ml-1 h-4 w-4" /></>
            )}
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
