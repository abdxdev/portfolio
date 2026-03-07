export type PickerMode = "game" | "anime";
export type PickerView = "search" | "list";

export interface Recommendation {
  type: "game" | "anime";
  title: string;
  image: string | null;
  url: string;
  extra: string;
}

export interface SearchResult {
  id: number;
  title: string;
  image: string | null;
  url: string;
  extra: string;
  listStatus?: string | null;
}

export interface PortfolioAnime {
  title: string;
  site_url: string;
  cover_image: string;
  status: string;
}

export interface PortfolioGame {
  name: string;
  slug: string;
  background_image: string;
  rawg_link: string;
  released: string;
  rating: number;
  status: string;
}
