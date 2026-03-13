import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/db/init';
import { Resend } from "resend";
import { FROM_FULL, FROM_ADDRESS, FROM_DISPLAY, SITE_URL, ADMIN_EMAIL } from "@/lib/constants";
import { emailLayout, emailH1, emailRow, emailP, emailButton } from "@/lib/email";

async function sendEmailNotification(message: string, sessionId: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const conversationUrl = `${SITE_URL}/conversation/${encodeURIComponent(sessionId)}?password=${encodeURIComponent(String(process.env.ADMIN_PASSWORD))}`;

  const html = emailLayout(
    emailH1("New anonymous message") +
    emailRow("Message", `<p style="margin:0;font-size:15px;line-height:1.6;color:#09090b;white-space:pre-wrap;">${message}</p>`, false) +
    emailRow("Session ID", `<code style="font-size:13px;color:#71717a;">${sessionId}</code>`) +
    emailButton("Open conversation →", conversationUrl),
    "New anonymous message on your portfolio"
  );

  await resend.emails.send({
    from: `Portfolio <${FROM_ADDRESS}>`,
    to: ADMIN_EMAIL,
    subject: "New anonymous message on your portfolio",
    html,
  });
}

function parse_message(message: string): string {
  let body = message;
  const recMatch = message.match(/^%%REC%%([\s\S]+)%%REC%%$/);
  if (recMatch) {
    try {
      const rec = JSON.parse(recMatch[1]);
      const emoji = rec.type === 'game' ? '🎮' : '📺';
      body = `${emoji} Recommended: ${rec.title}`;
    } catch { /* use raw message */ }
  }
  return body;
}

async function sendPushToSession(sessionId: string, message: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('conversation_push_subscriptions')
    .select('player_id')
    .eq('session_id', sessionId)
    .single();

  if (!data?.player_id) return;

  let body = parse_message(message);
  if (body.length > 120) body = body.slice(0, 120) + '\u2026';

  await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      target_channel: 'push',
      include_subscription_ids: [data.player_id],
      headings: { en: 'New reply' },
      contents: { en: body },
      url: `${SITE_URL}/conversation`,
    }),
  });
}

// POST: Send a message (anonymous user or admin reply)
export async function POST(request: Request) {
  try {
    const { message, sessionId: targetSessionId, replyTo } = await request.json();
    const authHeader = request.headers.get('Authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const isAdmin = authHeader === `Bearer ${adminPassword}` && !!adminPassword;

    let sessionId: string;

    if (isAdmin && targetSessionId) {
      sessionId = targetSessionId;
    } else {
      const cookieStore = await cookies();
      sessionId = cookieStore.get('conversation_session')?.value || crypto.randomUUID();
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('portfolio_conversations').insert({
      session_id: sessionId,
      message: message.trim(),
      is_admin: isAdmin,
      created_at: new Date().toISOString(),
      reply_to: replyTo ? Number(replyTo) : null,
    });

    if (error) throw error;

    if (isAdmin && sessionId) {
      sendPushToSession(sessionId, message.trim()).catch(() => { });
    }

    const response = NextResponse.json({ message: 'Message sent', sessionId }, { status: 201 });

    if (!isAdmin) {
      sendEmailNotification(parse_message(message), sessionId).catch(() => { });
      response.cookies.set('conversation_session', sessionId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
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
        const { data, error } = await supabase
          .from('portfolio_conversations')
          .select('*')
          .eq('session_id', targetSessionId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const unseenUserIds = (data || [] as any[]).filter(
          (m: any) => !m.is_admin && !m.last_seen_at && !m.is_deleted
        ).map((m: any) => m.id);
        if (unseenUserIds.length > 0) {
          supabase
            .from('portfolio_conversations')
            .update({ last_seen_at: new Date().toISOString() })
            .in('id', unseenUserIds)
            .then(() => { });
        }

        return NextResponse.json({ messages: data });
      }

      const { data, error } = await supabase
        .from('portfolio_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      type ConvRow = { id: number; session_id: string; message: string; is_admin: boolean; created_at: string; reply_to: number | null; is_deleted: boolean };
      const rows = (data || []) as ConvRow[];

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

      const sessionMessages: Record<string, ConvRow[]> = {};
      for (const msg of rows) {
        if (msg.is_deleted) continue;
        if (!sessionMessages[msg.session_id]) {
          sessionMessages[msg.session_id] = [];
        }
        sessionMessages[msg.session_id].push(msg);
      }

      for (const [sid, msgs] of Object.entries(sessionMessages)) {
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

    const filtered = (data || []).filter((msg: { is_deleted?: boolean }) => !msg.is_deleted);

    const unseenAdminIds = (data || [] as any[]).filter(
      (m: any) => m.is_admin && !m.last_seen_at && !m.is_deleted
    ).map((m: any) => m.id);
    if (unseenAdminIds.length > 0) {
      supabase
        .from('portfolio_conversations')
        .update({ last_seen_at: new Date().toISOString() })
        .in('id', unseenAdminIds)
        .then(() => { });
    }

    return NextResponse.json({ messages: filtered });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Error fetching conversation' }, { status: 500 });
  }
}

// DELETE: Soft-delete a message by id, or all session messages with clearAll=true
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    const messageId = searchParams.get('id');
    const clearAll = searchParams.get('clearAll') === 'true';
    const adminPassword = process.env.ADMIN_PASSWORD;

    const isAdmin = !!adminPassword && !!password && password === adminPassword;

    const supabase = getSupabase();

    if (clearAll) {
      const hardDelete = searchParams.get('hard') === 'true';
      const targetSessionId = searchParams.get('sessionId');

      if (isAdmin && targetSessionId) {
        if (hardDelete) {
          const { error } = await supabase
            .from('portfolio_conversations')
            .delete()
            .eq('session_id', targetSessionId);

          if (error) throw error;
          return NextResponse.json({ message: 'Session permanently deleted' });
        }

        const { error } = await supabase
          .from('portfolio_conversations')
          .update({ is_deleted: true })
          .eq('session_id', targetSessionId);

        if (error) throw error;
        return NextResponse.json({ message: 'All messages cleared' });
      }

      const cookieStore = await cookies();
      const sessionId = cookieStore.get('conversation_session')?.value;

      if (!sessionId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { error } = await supabase
        .from('portfolio_conversations')
        .update({ is_deleted: true })
        .eq('session_id', sessionId);

      if (error) throw error;
      return NextResponse.json({ message: 'All messages cleared' });
    }

    if (!messageId) {
      return NextResponse.json({ error: 'Message id is required' }, { status: 400 });
    }

    if (isAdmin) {
      const { error } = await supabase
        .from('portfolio_conversations')
        .update({ is_deleted: true })
        .eq('id', Number(messageId));

      if (error) throw error;
      return NextResponse.json({ message: 'Deleted' });
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('conversation_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('portfolio_conversations')
      .update({ is_deleted: true })
      .eq('id', Number(messageId))
      .eq('session_id', sessionId)
      .eq('is_admin', false);

    if (error) throw error;
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Error deleting message' }, { status: 500 });
  }
}

// PATCH: Undelete a message (admin only)
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    const messageId = searchParams.get('id');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!messageId) {
      return NextResponse.json({ error: 'Message id is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('portfolio_conversations')
      .update({ is_deleted: false })
      .eq('id', Number(messageId));

    if (error) throw error;
    return NextResponse.json({ message: 'Restored' });
  } catch (error) {
    console.error('Error restoring message:', error);
    return NextResponse.json({ error: 'Error restoring message' }, { status: 500 });
  }
}