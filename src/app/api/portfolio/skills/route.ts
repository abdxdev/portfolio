import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  const skills = JSON.parse(await readFile(path.join(process.cwd(), 'public/assets/json/skills.json'), 'utf-8'));
  return NextResponse.json(skills);
}