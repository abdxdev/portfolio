import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  const dirPath = path.join(process.cwd(), 'src', 'app', ...segments);

  const VALID_ENDPOINTS = fs.readdirSync(
    dirPath,
    { withFileTypes: true }
  )
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('['))
    .map(dirent => dirent.name);
  const params = request.nextUrl.searchParams;
  const selectedEndpoints = [...params.keys()].length > 0
    ? VALID_ENDPOINTS.filter(name => params.get(name) === 'true')
    : VALID_ENDPOINTS;

  const basePath = `/${segments.join('/')}`;
  const endpoints = selectedEndpoints.map(name => `${basePath}/${name}`);
  const dataResponses = await Promise.all(
    endpoints.map(async endpoint => {
      const res = await fetch(`${request.nextUrl.origin}${endpoint}`);
      return res.json();
    })
  );
  const combined = selectedEndpoints.reduce((acc, name, i) => {
    acc[name] = dataResponses[i];
    return acc;
  }, {} as Record<string, unknown>);
  return NextResponse.json(combined);
}