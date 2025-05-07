import { NextRequest, NextResponse } from 'next/server';
import socials from '@/data/socials.json';
import { filterItemsByQuery } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const matched = filterItemsByQuery(socials, searchParams, 'name');
  if (matched.length === 0) {
    return NextResponse.json({ error: 'Social not found' }, { status: 404 });
  }
  // return single object when only one match
  if (matched.length === 1) {
    return NextResponse.json(matched[0]);
  }
  return NextResponse.json(matched);
}