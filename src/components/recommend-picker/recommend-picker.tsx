"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Gamepad2, List, X, Send } from "lucide-react";
import AnilistIcon from "@/components/icons/anilist";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

import type {
  PickerMode,
  PickerView,
  Recommendation,
  SearchResult,
  PortfolioAnime,
  PortfolioGame,
} from "./types";
import { statusLabel, encodeRecommendation, norm } from "./utils";
import { searchGames, searchAnime } from "./search";
import { ResultRow } from "./result-row";

// ── Accent colours per mode ───────────────────────────────────────
const modeRing: Record<PickerMode, string> = {
  game: "ring-2 ring-blue-500/40",
  anime: "ring-2 ring-violet-500/40",
};
const modeIcon: Record<PickerMode, string> = {
  game: "text-blue-500",
  anime: "text-violet-500",
};

// ── Picker component ──────────────────────────────────────────────
export function RecommendPicker({
  onRecommend,
  messageValue,
  onMessageChange,
  onMessageSubmit,
  isSubmitting,
  placeholder = "Type a message...",
  onKeyDown,
}: {
  onRecommend: (encoded: string) => void;
  messageValue: string;
  onMessageChange: (value: string) => void;
  onMessageSubmit: () => void;
  isSubmitting: boolean;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const [mode, setMode] = useState<PickerMode>("game");
  const [view, setView] = useState<PickerView>("search");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [listFilter, setListFilter] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Portfolio lists (fetched once, cached)
  const [animeList, setAnimeList] = useState<PortfolioAnime[] | null>(null);
  const [gameList, setGameList] = useState<PortfolioGame[] | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const fetchedRef = useRef<{ anime: boolean; game: boolean }>({
    anime: false,
    game: false,
  });

  // ── Dismiss helper ──────────────────────────────────────────────
  const dismiss = useCallback(() => {
    setOpen(false);
    setQuery("");
    setListFilter("");
    setResults([]);
    setView("search");
  }, []);

  const fetchPortfolioLists = useCallback(async () => {
    if (fetchedRef.current.anime && fetchedRef.current.game) return;
    setListLoading(true);
    try {
      const promises: Promise<void>[] = [];
      if (!fetchedRef.current.anime) {
        promises.push(
          fetch("/api/portfolio/anime")
            .then((res) => (res.ok ? res.json() : []))
            .then((data: PortfolioAnime[]) => {
              setAnimeList(data);
              fetchedRef.current.anime = true;
            })
        );
      }
      if (!fetchedRef.current.game) {
        promises.push(
          fetch("/api/portfolio/games")
            .then((res) => (res.ok ? res.json() : []))
            .then((data: PortfolioGame[]) => {
              setGameList(data);
              fetchedRef.current.game = true;
            })
        );
      }
      await Promise.all(promises);
    } catch {
      // Silently fail
    } finally {
      setListLoading(false);
    }
  }, []);

  const getListStatus = useCallback(
    (title: string, m: PickerMode): string | null => {
      const n = norm(title);
      if (m === "anime" && animeList) {
        const match = animeList.find((a) => norm(a.title) === n);
        return match ? match.status : null;
      }
      if (m === "game" && gameList) {
        const match = gameList.find((g) => norm(g.name) === n);
        return match ? match.status : null;
      }
      return null;
    },
    [animeList, gameList]
  );

  const enrichedResults = results.map((r) => ({
    ...r,
    listStatus: getListStatus(r.title, mode),
  }));

  const portfolioAsResults = useCallback((): SearchResult[] => {
    if (mode === "anime" && animeList) {
      return animeList.map((a, i) => ({
        id: i,
        title: a.title,
        image: a.cover_image,
        url: a.site_url,
        extra: statusLabel("anime", a.status),
        listStatus: a.status,
      }));
    }
    if (mode === "game" && gameList) {
      return gameList.map((g, i) => ({
        id: i,
        title: g.name,
        image: g.background_image,
        url: g.rawg_link,
        extra: [
          g.released?.slice(0, 4),
          g.rating ? `★ ${g.rating}` : "",
          statusLabel("game", g.status),
        ]
          .filter(Boolean)
          .join(" · "),
        listStatus: g.status,
      }));
    }
    return [];
  }, [mode, animeList, gameList]);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res =
          mode === "game" ? await searchGames(q) : await searchAnime(q);
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [mode]
  );

  // Debounced search
  useEffect(() => {
    if (!open || view !== "search") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch, open, view]);

  // Fetch portfolio lists on open
  useEffect(() => {
    if (open) fetchPortfolioLists();
  }, [open, fetchPortfolioLists]);

  // Reset search on mode change
  useEffect(() => {
    if (open) {
      setQuery("");
      setListFilter("");
      setResults([]);
      setView("search");
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open, mode]);

  const handleSelect = (item: SearchResult) => {
    const rec: Recommendation = {
      type: mode,
      title: item.title,
      image: item.image,
      url: item.url,
      extra: item.extra,
    };
    onRecommend(encodeRecommendation(rec));
    dismiss();
  };

  const fullList = portfolioAsResults();
  const filteredList = listFilter.trim()
    ? fullList.filter((r) =>
        r.title.toLowerCase().includes(listFilter.toLowerCase())
      )
    : fullList;

  // ── Toggle a mode icon ──────────────────────────────────────────
  const toggleMode = (m: PickerMode) => {
    if (open && mode === m) {
      dismiss();
    } else {
      setMode(m);
      setOpen(true);
    }
  };

  // ── Input value / placeholder / change handler ──────────────────
  const displayValue = open
    ? view === "list"
      ? listFilter
      : query
    : messageValue;

  const displayPlaceholder = open
    ? view === "list"
      ? "Filter list..."
      : mode === "game"
        ? "Search games..."
        : "Search anime..."
    : placeholder;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (open) {
      if (view === "list") setListFilter(e.target.value);
      else setQuery(e.target.value);
    } else {
      onMessageChange(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (open) {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
      }
      // Block Enter in picker mode
      if (e.key === "Enter") e.preventDefault();
      return;
    }
    if (onKeyDown) onKeyDown(e);
  };

  // Should we show the results panel?
  const hasContent =
    view === "list" || loading || enrichedResults.length > 0 || query.trim();

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-shadow ${
        open ? modeRing[mode] : ""
      }`}
    >
      {/* ── Input row ─────────────────────────────────────────── */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={displayPlaceholder}
          rows={1}
          className="pr-12 pl-18 resize-none text-[13px] min-h-10 border-0 shadow-none focus-visible:ring-0"
        />

        {/* Left icons — always visible, highlight active mode */}
        <div className="absolute left-1.5 bottom-1.5 flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${
              open && mode === "game"
                ? modeIcon.game
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Recommend a game"
            onClick={() => toggleMode("game")}
          >
            <Gamepad2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${
              open && mode === "anime"
                ? modeIcon.anime
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Recommend an anime"
            onClick={() => toggleMode("anime")}
          >
            <AnilistIcon className="h-4 w-4 fill-current" />
          </Button>
        </div>

        {/* Right controls */}
        <div className="absolute right-1.5 bottom-1.5 flex items-center gap-0.5">
          {open ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-7 w-7 ${
                  view === "list" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                title={view === "list" ? "Back to search" : "View my list"}
                onClick={() => {
                  setView(view === "list" ? "search" : "list");
                  setListFilter("");
                  setQuery("");
                  setResults([]);
                }}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Close picker"
                onClick={dismiss}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-primary disabled:opacity-30"
              onClick={onMessageSubmit}
              disabled={isSubmitting || !messageValue.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── Results panel ─────────────────────────────────────── */}
      {open && hasContent && (
        <ScrollArea className="h-72 overflow-hidden border-t">
          {view === "list" ? (
            listLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : filteredList.length > 0 ? (
              <div className="py-1">
                {filteredList.map((item) => (
                  <ResultRow
                    key={`${item.title}-${item.id}`}
                    item={item}
                    showBadge={false}
                    mode={mode}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            ) : fullList.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-8">
                List not available
              </p>
            ) : (
              <p className="text-[13px] text-muted-foreground text-center py-8">
                No matches
              </p>
            )
          ) : loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : enrichedResults.length > 0 ? (
            <div className="py-1">
              {enrichedResults.map((item) => (
                <ResultRow
                  key={item.id}
                  item={item}
                  mode={mode}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ) : query.trim() ? (
            <p className="text-[13px] text-muted-foreground text-center py-8">
              No results found
            </p>
          ) : null}
        </ScrollArea>
      )}
    </div>
  );
}
