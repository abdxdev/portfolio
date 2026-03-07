"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkIcon, Loader2, Search, X } from "lucide-react";
import { RecommendPicker, parseRecommendation, RecommendationCard } from "@/components/recommend-picker";

interface Message {
  id: number;
  session_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export const Conversation = ({ id }: { id?: string }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [msgSearch, setMsgSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/conversation");
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRecommendSelect = async (encoded: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: encoded }),
      });
      if (response.ok) {
        await fetchMessages();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send recommendation");
      }
    } catch {
      setError("Failed to send recommendation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        setInput("");
        await fetchMessages();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send message");
      }
    } catch {
      setError("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <section id={id}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center group">
            Say Hello
            <a
              href={`#${id}`}
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <LinkIcon className="h-5 w-5 text-primary/80 hover:text-primary" />
            </a>
            {messages.length > 0 && (
              <button
                onClick={() => { setSearchOpen(!searchOpen); setMsgSearch(""); }}
                className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Messages */}
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length > 0 ? (
            <>
              {searchOpen && (
                <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5">
                  <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search messages"
                    value={msgSearch}
                    onChange={(e) => setMsgSearch(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                  />
                  {msgSearch && (
                    <button
                      onClick={() => setMsgSearch("")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
              <div ref={messagesContainerRef} className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {messages
                  .filter((msg) => {
                    if (!msgSearch.trim()) return true;
                    const term = msgSearch.toLowerCase();
                    const rec = parseRecommendation(msg.message);
                    if (rec) return rec.title.toLowerCase().includes(term);
                    return msg.message.toLowerCase().includes(term);
                  })
                  .map((msg) => {
                    const rec = parseRecommendation(msg.message);
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
                      >
                        {rec ? (
                          <div className="max-w-[85%]">
                            <RecommendationCard rec={rec} />
                            <p
                              className={`text-[10px] mt-1 ${msg.is_admin ? "text-muted-foreground" : "text-muted-foreground text-right"
                                }`}
                            >
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${msg.is_admin
                              ? "bg-muted text-foreground rounded-bl-sm"
                              : "bg-primary text-primary-foreground rounded-br-sm"
                              }`}
                          >
                            <p className="whitespace-pre-wrap wrap-break-word">{msg.message}</p>
                            <p
                              className={`text-[10px] mt-0.5 ${msg.is_admin
                                ? "text-muted-foreground"
                                : "text-primary-foreground/50"
                                }`}
                            >
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                {messages.filter((msg) => {
                  if (!msgSearch.trim()) return true;
                  const term = msgSearch.toLowerCase();
                  const rec = parseRecommendation(msg.message);
                  if (rec) return rec.title.toLowerCase().includes(term);
                  return msg.message.toLowerCase().includes(term);
                }).length === 0 && (
                    <p className="text-[11px] text-muted-foreground text-center py-2">No matches</p>
                  )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-3">
              Drop me a message — it's anonymous and I'll reply here. Or recommend a <span className="text-green-500">game</span> or <span className="text-violet-500">anime</span> you think I'd like!
            </p>
          )}

          {/* Input */}
          <RecommendPicker
            onRecommend={handleRecommendSelect}
            messageValue={input}
            onMessageChange={setInput}
            onMessageSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            placeholder="Type a message"
            onKeyDown={handleKeyDown}
            showDoodle={!isLoading && messages.length === 0}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </section>
  );
};
