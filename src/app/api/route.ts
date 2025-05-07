import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const dir = request.nextUrl.pathname;
  console.debug('dir', dir);

  // Try with 'src' prefix first (for local development)
  let basePath = path.join(process.cwd(), 'src', 'app', dir);
  
  // Check if the directory exists with 'src'
  if (!fs.existsSync(basePath)) {
    // If not, try without 'src' (for Vercel deployment)
    basePath = path.join(process.cwd(), 'app', dir);
    
    // If this path also doesn't exist, log an error
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

  const endpoints = VALID_ENDPOINTS.map(name => (
    `${dir}/${name}`
  ));
  return NextResponse.json({ endpoints });
}