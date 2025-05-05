"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';

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
          // Redirect to home page if unauthorized
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
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p>Loading feedback...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Feedback Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {feedbacks.length === 0 ? (
              <p className="text-muted-foreground">No feedback responses yet.</p>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          feedback.sentiment === 'upvote' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {feedback.sentiment.toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(feedback.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{feedback.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}