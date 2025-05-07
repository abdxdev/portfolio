import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VALID_ENDPOINTS = fs.readdirSync(
  path.join(process.cwd(), 'src', 'app', 'api', 'me'),
  { withFileTypes: true }
)
  .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('['))
  .map(dirent => dirent.name);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  let endpointsList = VALID_ENDPOINTS.filter(ep => searchParams.get(ep) === 'true');
  if (endpointsList.length === 0) endpointsList = VALID_ENDPOINTS;
  const origin = new URL(request.url).origin;
  const results = await Promise.all(
    endpointsList.map(async endpoint => {
      const res = await fetch(`${origin}/api/me/${endpoint}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${res.status}`);
      }
      return res.json();
    })
  );

  const responseData = Object.fromEntries(
    endpointsList.map((ep, i) => [ep, results[i]])
  );
  return NextResponse.json(responseData);
}