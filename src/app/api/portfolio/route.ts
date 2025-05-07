import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const dir = request.nextUrl.pathname;
  let basePath = path.join(process.cwd(), 'src', 'app', dir);

  if (!fs.existsSync(basePath)) {
    basePath = path.join('.next', 'server', 'app', dir);

    if (!fs.existsSync(basePath)) {
      console.error(`Directory not found: ${basePath}`);
      return NextResponse.json({ endpoints: [], error: 'Directory not found' }, { status: 404 });
    }
  }

  const VALID_ENDPOINTS = fs.readdirSync(
    basePath,
    { withFileTypes: true }
  )
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('['))
    .map(dirent => dirent.name);

  const endpoints = VALID_ENDPOINTS.map(name => `${dir}/${name}`);

  const dataResponses = await Promise.all(
    endpoints.map(async endpoint => {
      const res = await fetch(`${request.nextUrl.origin}${endpoint}`);
      return res.json();
    })
  );

  const combined = VALID_ENDPOINTS.reduce((acc, name, i) => {
    acc[name] = dataResponses[i];
    return acc;
  }, {} as Record<string, unknown>);

  return NextResponse.json(combined);
}