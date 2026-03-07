import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { Recommendation } from "./types";
import { SlantBadge } from "@/components/svg/slant-badge";

const badgeColors: Record<Recommendation["type"], { bg: string; text: string }> = {
  game: { bg: "bg-green-500", text: "text-white" },
  anime: { bg: "bg-violet-500", text: "text-white" },
};

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const colors = badgeColors[rec.type];
  const label = rec.type === "game" ? "Game" : "Anime";

  return (
    <a
      href={rec.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border bg-card overflow-hidden hover:border-primary/40 transition-colors group w-50"
    >
      {/* Image + slant badge */}
      <div className="relative w-full aspect-video overflow-hidden bg-muted">
        {rec.image && (
          <Image
            src={rec.image}
            alt={rec.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        )}
        {/* nt badge anchored to bottom-right of image */}
        <SlantBadge label={label} variant={rec.type} />
      </div>

      <div className="p-2.5 space-y-1">
        <div className="flex items-start gap-1.5">
          <p className="text-[13px] font-medium leading-tight line-clamp-2 flex-1">
            {rec.title}
          </p>
          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {rec.extra && (
          <p className="text-[11px] text-muted-foreground">{rec.extra}</p>
        )}
      </div>
    </a>
  );
}
