import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/db/init';
import { PUSH_SUBSCRIPTIONS_TBL } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { playerId } = await request.json();
    if (!playerId) return NextResponse.json({ error: 'Missing playerId' }, { status: 400 });

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('conversation_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'No session' }, { status: 400 });

    const supabase = getSupabase();
    await supabase
      .from(PUSH_SUBSCRIPTIONS_TBL)
      .upsert({ session_id: sessionId, player_id: playerId }, { onConflict: 'session_id' });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('conversation_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'No session' }, { status: 400 });

    const supabase = getSupabase();
    await supabase
      .from(PUSH_SUBSCRIPTIONS_TBL)
      .delete()
      .eq('session_id', sessionId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
