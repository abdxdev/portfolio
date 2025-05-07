import { NextResponse } from 'next/server';
import friends from '@/data/friends.json';

export async function GET() {
  const enriched = await Promise.all(friends.map(async (friend) => {
    const res = await fetch(`https://api.github.com/users/${friend.github_username}`);
    let r;
    if (res.ok) {
      r = await res.json();
    } else {
      console.error(`Failed to fetch GitHub user ${friend.github_username}`);
      r = { login: friend.github_username, name: friend.github_username };
    }
    return {
      ...friend,
      avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${r.name}`,
      github_url: `https://github.com/${friend.github_username}`,
      linkedin_url: `https://www.linkedin.com/in/${friend.linkedin_username}`,
      github_name: r.name,
      github_avatar: `https://github.com/${r.login}.png?size=150`,
    };
  }));
  return NextResponse.json(enriched);
}