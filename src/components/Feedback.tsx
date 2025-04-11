"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Send } from "lucide-react";

export const Feedback = () => {
    const [feedback, setFeedback] = useState("");
    const [sentiment, setSentiment] = useState<"like" | "dislike" | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!feedback && !sentiment) return;
        
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feedback,
                    sentiment,
                    createdAt: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                setFeedback("");
                setSentiment(null);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Button 
                            variant={sentiment === "like" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setSentiment("like")}
                        >
                            <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant={sentiment === "dislike" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setSentiment("dislike")}
                        >
                            <ThumbsDown className="h-4 w-4" />
                        </Button>
                    </div>
                    <Textarea
                        placeholder="Share your thoughts anonymously..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <Button 
                        className="w-full" 
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!feedback && !sentiment)}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Send Anonymously
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};