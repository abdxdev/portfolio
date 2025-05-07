import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const dir = request.nextUrl.pathname;
  console.debug('dir', dir);

  const VALID_ENDPOINTS = fs.readdirSync(
    path.join('src', 'app', dir),
    { withFileTypes: true }
  )
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('['))
    .map(dirent => dirent.name);

  const endpoints = VALID_ENDPOINTS.map(name => (
    `${dir}/${name}`
  ));
  return NextResponse.json({ endpoints });
}