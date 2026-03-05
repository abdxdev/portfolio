import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/db/init';

export async function POST(request: Request) {
    try {
        const { feedback, sentiment, createdAt } = await request.json();

        if (typeof feedback !== 'string' || typeof sentiment !== 'string' || typeof createdAt !== 'string') {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
        }

        const cookieStore = await cookies();
        let sessionId = cookieStore.get('feedback_session')?.value;
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            cookieStore.set('feedback_session', sessionId);
        }

        const supabase = getSupabase();
        const { error } = await supabase.from('portfolio_feedbacks').insert({
            content: feedback,
            sentiment,
            created_at: createdAt,
            session_id: sessionId,
        });

        if (error) throw error;

        const response = NextResponse.json({ message: 'Feedback submitted successfully' }, { status: 201 });
        response.cookies.set('feedback_session', sessionId);

        return response;
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return NextResponse.json({ error: 'Error submitting feedback' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const password = searchParams.get('password');
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword || !password || password !== adminPassword) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('portfolio_feedbacks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({ error: 'Error fetching feedback' }, { status: 500 });
    }
}