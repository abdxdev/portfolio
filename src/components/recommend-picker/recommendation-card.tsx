import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Recommendation } from "./types";

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <a
      href={rec.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border bg-card overflow-hidden hover:border-primary/40 transition-colors group max-w-60"
    >
      {rec.image && (
        <div className="relative w-full aspect-video overflow-hidden bg-muted">
          <Image
            src={rec.image}
            alt={rec.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </div>
      )}
      <div className="p-2.5 space-y-1">
        <div className="flex items-start gap-1.5">
          <Badge
            variant="secondary"
            className="shrink-0 text-[10px] px-1.5 py-0"
          >
            {rec.type === "game" ? "🎮 Game" : "📺 Anime"}
          </Badge>
          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[13px] font-medium leading-tight line-clamp-2">
          {rec.title}
        </p>
        {rec.extra && (
          <p className="text-[11px] text-muted-foreground">{rec.extra}</p>
        )}
      </div>
    </a>
  );
}
