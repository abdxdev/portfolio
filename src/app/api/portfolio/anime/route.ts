import { NextRequest, NextResponse } from 'next/server';
import { fetchWithDbCache } from '@/lib/db/cache';

const GRAPHQL_URL = 'https://graphql.anilist.co';
const QUERY = `
query ($username: String) {
  MediaListCollection(userName: $username, type: ANIME) {
    lists {
      entries {
        media {
          title { romaji english }
          siteUrl
          coverImage { large }
        }
        status
      }
    }
  }
}
`;

export async function GET(request: NextRequest) {
  const username = "abdxdev";
  const shouldRefresh = request.nextUrl.searchParams.get('refresh') === 'true';

  try {
    const anime = await fetchWithDbCache('portfolio_anime', async () => {
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query: QUERY, variables: { username } }),
      });

      if (!response.ok) {
        throw new Error(`AniList API error: ${response.status}, message: ${await response.text()}`);
      }

      const { data } = await response.json();
      const collections = data?.MediaListCollection?.lists || [];

      interface AnimeEntry {
        media: {
          title: {
            romaji: string;
            english: string | null;
          };
          siteUrl: string;
          coverImage: {
            large: string;
          };
        };
        status: string;
      }

      interface AnimeList {
        entries: AnimeEntry[];
      }

      return collections.flatMap((list: AnimeList) => {
        return list.entries.map((entry: AnimeEntry) => {
          const { media, status } = entry;
          return {
            title: media.title.english || media.title.romaji,
            site_url: media.siteUrl,
            cover_image: media.coverImage.large,
            status,
          };
        });
      });
    }, shouldRefresh);

    return NextResponse.json(anime);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}