import Image from "next/image";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SlideText } from "./slide-text";
import { statusLabel } from "./utils";
import type { PickerMode, SearchResult } from "./types";

interface ResultRowProps {
  item: SearchResult;
  showBadge?: boolean;
  mode: PickerMode;
  onSelect: (item: SearchResult) => void;
}

export function ResultRow({
  item,
  showBadge = true,
  mode,
  onSelect,
}: ResultRowProps) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="group/row w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/60 transition-colors text-left overflow-hidden"
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={item.title}
          width={mode === "game" ? 48 : 36}
          height={mode === "game" ? 32 : 48}
          className={`rounded object-cover shrink-0 ${mode === "game" ? "w-12 h-8" : "w-9 h-12"
            }`}
          unoptimized
        />
      ) : (
        <div
          className={`rounded bg-muted shrink-0 ${mode === "game" ? "w-12 h-8" : "w-9 h-12"
            }`}
        />
      )}
      <div className="min-w-0 flex-1 overflow-hidden">
        <SlideText text={item.title} />
        <div className="flex items-center gap-1.5 min-w-0">
          {item.extra && (
            <p className="text-[11px] text-muted-foreground truncate">
              {item.extra}
            </p>
          )}
          {showBadge && item.listStatus && (
            <Badge
              variant="outline"
              className="shrink-0 text-[9px] px-1 py-0 gap-0.5 text-emerald-600 border-emerald-600/30 whitespace-nowrap"
            >
              <Check className="h-2 w-2" />
              {statusLabel(mode, item.listStatus)}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
