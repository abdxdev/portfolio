import type { SearchResult } from "./types";

// ── RAWG search ───────────────────────────────────────────────────
export async function searchGames(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("search", query);
  url.searchParams.set("page_size", "8");
  url.searchParams.set("key", "c542e67aec3a4340908f9de9e86038af");
  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map(
    (g: {
      id: number;
      name: string;
      background_image: string | null;
      slug: string;
      released: string;
      rating: number;
    }) => ({
      id: g.id,
      title: g.name,
      image: g.background_image,
      url: `https://rawg.io/games/${g.slug}`,
      extra: [g.released?.slice(0, 4), g.rating ? `★ ${g.rating}` : ""]
        .filter(Boolean)
        .join(" · "),
    })
  );
}

// ── AniList search ────────────────────────────────────────────────
export async function searchAnime(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const gql = {
    query: `
      query ($search: String) {
        Page(perPage: 8) {
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title { english romaji }
            coverImage { medium large }
            siteUrl
            seasonYear
            averageScore
          }
        }
      }
    `,
    variables: { search: query },
  };
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gql),
  });
  if (!res.ok) return [];
  const { data } = await res.json();
  return (data?.Page?.media || []).map(
    (a: {
      id: number;
      title: { english: string | null; romaji: string };
      coverImage: { medium: string; large: string };
      siteUrl: string;
      seasonYear: number | null;
      averageScore: number | null;
    }) => ({
      id: a.id,
      title: a.title.english || a.title.romaji,
      image: a.coverImage.large || a.coverImage.medium,
      url: a.siteUrl,
      extra: [a.seasonYear, a.averageScore ? `${a.averageScore}%` : ""]
        .filter(Boolean)
        .join(" · "),
    })
  );
}
