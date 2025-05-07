import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  return NextResponse.json({
    endpoints: {
      me: `${origin}/api/me`,
      feedback: `${origin}/api/feedback`
    }
  });
}