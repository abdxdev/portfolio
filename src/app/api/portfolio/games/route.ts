import { NextRequest, NextResponse } from 'next/server';
import { filterItemsByQuery } from '@/lib/utils';
import socials from '@/data/socials.json';

interface Game {
  background_image_cropped: string;
  status: string;
}

const STATUSES = [
  'beaten',
  'playing',
  'yet',
  'toplay',
  'dropped',
  'owned',
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  let username = searchParams.get('username');
  if (!username) {
    const matched = filterItemsByQuery(socials, new URLSearchParams([['rawg', 'true']]), 'name');
    if (matched.length === 0) {
      return NextResponse.json({ error: 'RAWG social not found' }, { status: 404 });
    }
    username = matched[0].username;
  }
  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const allGames: Game[] = [];

  for (const status of STATUSES) {
    let page = 1;
    while (true) {
      const url = new URL(`https://api.rawg.io/api/users/${username}/games`);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('statuses', status);
      url.searchParams.set('page_size', '100');
      url.searchParams.set('ordering', '-released');

      const res = await fetch(url.toString());
      if (!res.ok) {
        return NextResponse.json({ error: `RAWG API error: ${res.status}` }, { status: res.status });
      }

      const data = await res.json();
      for (const game of data.results) {
        const background_image_cropped = `https://media.rawg.io/media/crop/600/400/${game.background_image.split('/').slice(-3).join('/')}`;
        allGames.push({
          background_image_cropped,
          status: status,
          ...game,
        });
      }

      if (!data.next) break;
      page += 1;
    }
  }

  return NextResponse.json(allGames);
}
