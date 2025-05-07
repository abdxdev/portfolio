import { NextRequest, NextResponse } from 'next/server';
import { filterItemsByQuery } from '@/lib/utils';
import socials from '@/data/socials.json';

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
  const { searchParams } = request.nextUrl;
  let username = searchParams.get('username');
  if (!username) {
    const matched = filterItemsByQuery(socials, new URLSearchParams([['anilist', 'true']]), 'name');
    if (matched.length === 0) {
      return NextResponse.json({ error: 'AniList social not found' }, { status: 404 });
    }
    username = matched[0].username;
  }
  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query: QUERY, variables: { username } }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: `AniList API error: ${response.status}` }, { status: response.status });
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

  const anime = collections.flatMap((list: AnimeList) => {
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

  return NextResponse.json(anime);
}