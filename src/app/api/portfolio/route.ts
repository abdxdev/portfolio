import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function GET(request: NextRequest) {
  const VALID_ENDPOINTS = fs.readdirSync(__dirname, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('['))
    .map(dirent => dirent.name);
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);

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