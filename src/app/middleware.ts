import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the route is feedback-related
  if (request.nextUrl.pathname === '/feedback') {
    const password = request.nextUrl.searchParams.get('password');
    const adminPassword = process.env.ADMIN_PASSWORD;

    // If no password is provided or it's incorrect, redirect to home
    if (!adminPassword || !password || password !== adminPassword) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/feedback']
}