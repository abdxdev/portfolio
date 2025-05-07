import { NextRequest, NextResponse } from 'next/server';

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
  const username = searchParams.get('username') || process.env.ANILIST_USERNAME;
  if (!username) {
    return NextResponse.json({ error: 'Missing username parameter' }, { status: 400 });
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

  return NextResponse.json(collections);
}