"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Inbox,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseRecommendation, RecommendationCard, RecommendPicker } from "@/components/recommend-picker";

interface Session {
  sessionId: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  hasUnreplied: boolean;
}

interface Message {
  id: number;
  session_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export default function ConversationAdmin() {
  const [password, setPassword] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [msgSearch, setMsgSearch] = useState("");
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const pw = new URLSearchParams(window.location.search).get("password");
    if (!pw) {
      router.replace("/");
      return;
    }
    setPassword(pw);
  }, [router]);

  const fetchSessions = useCallback(async () => {
    if (!password) return;
    try {
      const response = await fetch(`/api/conversation?password=${password}`);
      if (response.status === 401 || response.status === 403) {
        router.replace("/");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [password, router]);

  const fetchMessages = useCallback(
    async (sessionId: string) => {
      if (!password) return;
      try {
        const response = await fetch(
          `/api/conversation?password=${password}&sessionId=${sessionId}`
        );
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(data.messages || []);
      } catch {
        // Silently fail
      }
    },
    [password]
  );

  useEffect(() => {
    if (password) {
      fetchSessions();
      const interval = setInterval(fetchSessions, 15000);
      return () => clearInterval(interval);
    }
  }, [password, fetchSessions]);

  useEffect(() => {
    if (selectedSession && password) {
      fetchMessages(selectedSession);
      pollingRef.current = setInterval(
        () => fetchMessages(selectedSession),
        5000
      );
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [selectedSession, password, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = async () => {
    if (!reply.trim() || !selectedSession || !password) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          message: reply,
          sessionId: selectedSession,
        }),
      });

      if (response.ok) {
        setReply("");
        await fetchMessages(selectedSession);
        await fetchSessions();
      }
    } catch {
      // Silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!password) return;
    try {
      const response = await fetch(
        `/api/conversation?password=${password}&id=${messageId}`,
        { method: "DELETE" }
      );
      if (response.ok && selectedSession) {
        await fetchMessages(selectedSession);
        await fetchSessions();
      }
    } catch {
      // Silently fail
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  if (!password) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // ── Session detail ──────────────────────────────────────────────
  if (selectedSession) {
    return (
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Header bar */}
        <div className="flex items-center gap-3 pb-4 border-b mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => {
              setSelectedSession(null);
              setMessages([]);
              setMsgSearch("");
              setChatSearchOpen(false);
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {selectedSession.slice(0, 8)}
            </p>
            <p className="text-xs text-muted-foreground">
              {messages.length} message{messages.length !== 1 && "s"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => { setChatSearchOpen(!chatSearchOpen); setMsgSearch(""); }}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {chatSearchOpen && (
          <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 mb-3">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search messages..."
              value={msgSearch}
              onChange={(e) => setMsgSearch(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {msgSearch && (
              <button
                onClick={() => setMsgSearch("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-2 pb-2 pr-1">
          {messages
            .filter((msg) => {
              if (!msgSearch.trim()) return true;
              const term = msgSearch.toLowerCase();
              const rec = parseRecommendation(msg.message);
              if (rec) return rec.title.toLowerCase().includes(term);
              return msg.message.toLowerCase().includes(term);
            })
            .map((msg, i, filtered) => {
            const showDate =
              i === 0 ||
              new Date(msg.created_at).toDateString() !==
                new Date(filtered[i - 1].created_at).toDateString();

            return (
              <div key={msg.id}>
                {showDate && (
                  <p className="text-[11px] text-muted-foreground text-center my-3">
                    {new Date(msg.created_at).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
                {(() => {
                  const rec = parseRecommendation(msg.message);
                  return (
                    <div
                      className={`group/msg flex ${msg.is_admin ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-end gap-1">
                        {msg.is_admin && (
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive"
                            title="Delete message"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                        {rec ? (
                          <div className="max-w-[75%]">
                            <RecommendationCard rec={rec} />
                            <p className={`text-[10px] mt-1 ${msg.is_admin ? "text-muted-foreground text-right" : "text-muted-foreground"}`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                              msg.is_admin
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted rounded-bl-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap wrap-break-word">
                              {msg.message}
                            </p>
                            <p
                              className={`text-[10px] mt-0.5 ${
                                msg.is_admin
                                  ? "text-primary-foreground/50"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        )}
                        {!msg.is_admin && (
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive"
                            title="Delete message"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply bar */}
        <div className="pt-4 border-t">
          <RecommendPicker
            onRecommend={async (encoded) => {
              if (!selectedSession || !password) return;
              setIsSubmitting(true);
              try {
                const response = await fetch("/api/conversation", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${password}`,
                  },
                  body: JSON.stringify({
                    message: encoded,
                    sessionId: selectedSession,
                  }),
                });
                if (response.ok) {
                  await fetchMessages(selectedSession);
                  await fetchSessions();
                }
              } catch {}
              finally { setIsSubmitting(false); }
            }}
            messageValue={reply}
            onMessageChange={setReply}
            onMessageSubmit={handleReply}
            isSubmitting={isSubmitting}
            placeholder="Reply..."
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    );
  }

  const filteredSessions = sessions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const rec = parseRecommendation(s.lastMessage);
    const preview = rec ? rec.title : s.lastMessage;
    return (
      s.sessionId.toLowerCase().includes(q) ||
      preview.toLowerCase().includes(q)
    );
  });

  // ── Sessions list ───────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-lg font-semibold shrink-0">Conversations</h1>
        <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 max-w-xs w-full">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Inbox className="h-8 w-8 mb-3 opacity-40" />
          <p className="text-sm">{search ? "No matches" : "No conversations yet"}</p>
        </div>
      ) : (
        <div className="divide-y">
          {filteredSessions.map((session) => (
            <button
              key={session.sessionId}
              onClick={() => setSelectedSession(session.sessionId)}
              className="w-full flex items-center gap-3 py-3.5 px-1 text-left hover:bg-muted/40 rounded-lg transition-colors -mx-1"
            >
              {/* Unread dot */}
              <div className="w-2 shrink-0 flex justify-center">
                {session.hasUnreplied && (
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`text-sm truncate ${
                      session.hasUnreplied ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {session.sessionId.slice(0, 8)}
                  </span>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {relativeTime(session.lastMessageAt)}
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                  {(() => {
                    const rec = parseRecommendation(session.lastMessage);
                    if (rec) return `${rec.type === "game" ? "🎮" : "📺"} Recommended: ${rec.title}`;
                    return session.lastMessage;
                  })()}
                </p>
              </div>

              {/* Badge */}
              <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                {session.messageCount}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
