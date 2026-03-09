import { NextResponse } from 'next/server';

interface Game {
  background_image_cropped: string;
  status: string;
  background_image: string;
  name: string;
  slug: string;
  rawg_link: string;
  released: string;
  rating: number;
}

const STATUSES = [
  'beaten',
  'playing',
  'yet',
  'toplay',
  'dropped',
  'owned',
];

export async function GET() {
  const username = "abdxdev";

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
        allGames.push({
          name: game.name,
          slug: game.slug,
          background_image: game.background_image,
          background_image_cropped: `https://media.rawg.io/media/crop/600/400/${game.background_image.split('/').slice(-3).join('/')}`,
          rawg_link: `https://rawg.io/games/${game.slug}`,
          released: game.released,
          rating: game.rating,
          status: status,
        });
      }

      if (!data.next) break;
      page += 1;
    }
  }

  return NextResponse.json(allGames);
}
