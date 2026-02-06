"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowBigUp, ArrowBigDown, MessageSquare } from 'lucide-react';

interface FeedbackResponse {
  id: number;
  content: string;
  sentiment: string;
  created_at: string;
  session_id: string;
}

export default function FeedbackResponses() {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const password = new URLSearchParams(window.location.search).get('password');
        const response = await fetch(`/api/feedback?password=${password || ''}`);

        if (response.status === 401 || response.status === 403) {
          router.replace('/');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch feedback');
        }

        const data = await response.json();
        setFeedbacks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [router]);

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground animate-pulse">Loading feedback...</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Feedback</h1>
        <span className="text-sm text-muted-foreground">({feedbacks.length})</span>
      </div>

      {feedbacks.length === 0 ? (
        <p className="text-muted-foreground text-sm">No feedback yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {feedbacks.map((feedback) => (
            <li key={feedback.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex gap-3">
                <div className="pt-0.5">
                  {feedback.sentiment === 'upvote' ? (
                    <ArrowBigUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowBigDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {feedback.content && (
                    <p className="text-sm text-foreground">{feedback.content}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(feedback.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}