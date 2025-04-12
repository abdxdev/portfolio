"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, LinkIcon, ArrowBigUp, ArrowBigDown, Loader2 } from "lucide-react";

export const Feedback = ({ id }: { id?: string }) => {
    const [feedback, setFeedback] = useState("");
    const [sentiment, setSentiment] = useState<"upvote" | "downvote" | null>(null);
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
        <section id={id}>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center group">
                        Feedback
                        <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
                        </a>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Button
                                variant={sentiment === "upvote" ? "default" : "outline"}
                                onClick={() => setSentiment(sentiment === "upvote" ? null : "upvote")}
                                className="w-full"
                            >
                                <ArrowBigUp />
                                Upvote
                            </Button>
                            <Button
                                variant={sentiment === "downvote" ? "default" : "outline"}
                                onClick={() => setSentiment(sentiment === "downvote" ? null : "downvote")}
                                className="w-full"
                            >
                                <ArrowBigDown />
                                Downvote
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Share your thoughts anonymously..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                        <Button
                            className="w-full flex items-center justify-center"
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!feedback && !sentiment)}
                            variant={(isSubmitting || (!feedback && !sentiment) ? "outline" : "default")}
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Send />
                            )}
                            Send Anonymously
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
};