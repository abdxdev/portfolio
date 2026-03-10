import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const body = request.method === 'POST' ? await request.text() : '';
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!key.startsWith('x-')) headers[key] = value;
  });

  const r = {
    scheme: request.nextUrl.protocol.replace(':', ''),
    path: request.nextUrl.pathname,
    absolute_uri: request.nextUrl.href,
    content_type: request.headers.get('content-type'),
    encoding: 'utf-8',
    method: request.method,
    GET: Object.fromEntries(request.nextUrl.searchParams),
    POST: body,
    headers,
    data: body,
  };
  console.log(r);
  return NextResponse.json(r);
}
