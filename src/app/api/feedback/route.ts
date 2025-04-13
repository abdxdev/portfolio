import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
});

export async function POST(request: Request) {
    try {
        const { feedback, sentiment, createdAt } = await request.json();

        const cookieStore = await cookies();
        let sessionId = cookieStore.get('feedback_session')?.value;
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            cookieStore.set('feedback_session', sessionId);
        }

        if (typeof feedback !== 'string' || typeof sentiment !== 'string' || typeof createdAt !== 'string') {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
        }

        const query = {
            text: 'INSERT INTO feedbacks (content, sentiment, created_at, session_id) VALUES ($1, $2, $3, $4)',
            values: [feedback, sentiment, createdAt, sessionId],
        };

        await pool.query(query);

        return NextResponse.json({ message: 'Feedback submitted successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return NextResponse.json({ error: 'Error submitting feedback' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const result = await pool.query('SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT $1', [100]);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({ error: 'Error fetching feedback' }, { status: 500 });
    }
}