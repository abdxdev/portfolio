import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/db/init';

// POST: Send a message (anonymous user or admin reply)
export async function POST(request: Request) {
  try {
    const { message, sessionId: targetSessionId } = await request.json();
    const authHeader = request.headers.get('Authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const isAdmin = authHeader === `Bearer ${adminPassword}` && !!adminPassword;

    let sessionId: string;

    if (isAdmin && targetSessionId) {
      // Admin replying to a specific session
      sessionId = targetSessionId;
    } else {
      // Anonymous user - use/create session from cookie
      const cookieStore = await cookies();
      sessionId = cookieStore.get('conversation_session')?.value || crypto.randomUUID();
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('portfolio_conversations').insert({
      session_id: sessionId,
      message: message.trim(),
      is_admin: isAdmin,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    const response = NextResponse.json({ message: 'Message sent', sessionId }, { status: 201 });

    if (!isAdmin) {
      response.cookies.set('conversation_session', sessionId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Error sending message' }, { status: 500 });
  }
}

// GET: Fetch messages
// - Anonymous users: get their own session messages (via cookie)
// - Admin: get all sessions grouped (with password)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    const adminPassword = process.env.ADMIN_PASSWORD;
    const targetSessionId = searchParams.get('sessionId');

    const isAdmin = !!adminPassword && !!password && password === adminPassword;

    const supabase = getSupabase();

    if (isAdmin) {
      if (targetSessionId) {
        // Get messages for a specific session
        const { data, error } = await supabase
          .from('portfolio_conversations')
          .select('*')
          .eq('session_id', targetSessionId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return NextResponse.json({ messages: data });
      }

      // Get all sessions with their latest message
      const { data, error } = await supabase
        .from('portfolio_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      type ConvRow = { id: number; session_id: string; message: string; is_admin: boolean; created_at: string };
      const rows = (data || []) as ConvRow[];

      // Group by session_id
      const sessions: Record<string, {
        sessionId: string;
        lastMessage: string;
        lastMessageAt: string;
        messageCount: number;
        hasUnreplied: boolean;
      }> = {};

      for (const msg of rows) {
        if (!sessions[msg.session_id]) {
          sessions[msg.session_id] = {
            sessionId: msg.session_id,
            lastMessage: msg.message,
            lastMessageAt: msg.created_at,
            messageCount: 0,
            hasUnreplied: false,
          };
        }
        sessions[msg.session_id].messageCount++;
      }

      // Check if last message in each session is from user (unreplied)
      const sessionMessages: Record<string, ConvRow[]> = {};
      for (const msg of rows) {
        if (!sessionMessages[msg.session_id]) {
          sessionMessages[msg.session_id] = [];
        }
        sessionMessages[msg.session_id].push(msg);
      }

      for (const [sid, msgs] of Object.entries(sessionMessages)) {
        // msgs are ordered desc, so first is latest
        if (msgs.length > 0 && !msgs[0].is_admin) {
          sessions[sid].hasUnreplied = true;
        }
      }

      return NextResponse.json({
        sessions: Object.values(sessions).sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        ),
      });
    }

    // Anonymous user: get their own conversation
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('conversation_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ messages: [] });
    }

    const { data, error } = await supabase
      .from('portfolio_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages: data });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Error fetching conversation' }, { status: 500 });
  }
}

// DELETE: Admin deletes a message by id
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    const messageId = searchParams.get('id');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || !password || password !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!messageId) {
      return NextResponse.json({ error: 'Message id is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('portfolio_conversations')
      .delete()
      .eq('id', Number(messageId));

    if (error) throw error;

    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Error deleting message' }, { status: 500 });
  }
}
