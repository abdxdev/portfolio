import { NextResponse } from 'next/server';
import socials from '@/data/socials.json';

export async function GET() {
  return NextResponse.json(socials);
}