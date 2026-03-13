"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Inbox, Search, X, Trash2, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseRecommendation } from "@/components/recommend-picker";
import { ChatView, type ChatMessage } from "@/components/chat-view";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Session {
  sessionId: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  hasUnreplied: boolean;
}

export default function ConversationsPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [msgSearch, setMsgSearch] = useState("");
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const router = useRouter();
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

  const handleReply = async () => {
    if (!reply.trim() || !selectedSession || !password || isSubmitting) return;
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
          replyTo: replyTo?.id,
        }),
      });
      if (response.ok) {
        setReply("");
        setReplyTo(null);
        await fetchMessages(selectedSession);
        await fetchSessions();
      }
    } catch {
      // Silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecommend = async (encoded: string) => {
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
          replyTo: replyTo?.id,
        }),
      });
      if (response.ok) {
        setReplyTo(null);
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

  const handleUndelete = async (messageId: number) => {
    if (!password) return;
    try {
      const response = await fetch(
        `/api/conversation?password=${password}&id=${messageId}`,
        { method: "PATCH" }
      );
      if (response.ok && selectedSession) {
        await fetchMessages(selectedSession);
        await fetchSessions();
      }
    } catch {
      // Silently fail
    }
  };

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
              setReplyTo(null);
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => { setChatSearchOpen(!chatSearchOpen); setMsgSearch(""); }}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  if (!selectedSession || !password) return;
                  try {
                    const response = await fetch(
                      `/api/conversation?password=${password}&clearAll=true&sessionId=${selectedSession}`,
                      { method: "DELETE" }
                    );
                    if (response.ok) {
                      setMessages([]);
                      setMsgSearch("");
                      setChatSearchOpen(false);
                      setReplyTo(null);
                      await fetchSessions();
                    }
                  } catch {
                    // Silently fail
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  if (!selectedSession || !password) return;
                  try {
                    const response = await fetch(
                      `/api/conversation?password=${password}&clearAll=true&hard=true&sessionId=${selectedSession}`,
                      { method: "DELETE" }
                    );
                    if (response.ok) {
                      setSelectedSession(null);
                      setMessages([]);
                      setMsgSearch("");
                      setChatSearchOpen(false);
                      setReplyTo(null);
                      await fetchSessions();
                    }
                  } catch {
                    // Silently fail
                  }
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Delete Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chat view — same component as visitor side, enlarged + admin features */}
        <ChatView
          messages={messages}
          input={reply}
          onInputChange={setReply}
          onSubmit={handleReply}
          onRecommend={handleRecommend}
          onDelete={handleDelete}
          onUndelete={handleUndelete}
          isSubmitting={isSubmitting}
          isAdmin
          messagesClassName="flex-1 min-h-0"
          placeholder="Reply..."
          showDateSeparators
          searchOpen={chatSearchOpen}
          msgSearch={msgSearch}
          onSearchChange={setMsgSearch}
          replyTo={replyTo}
          onSetReplyTo={setReplyTo}
        />
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
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-lg font-semibold shrink-0">Conversations</h1>
        <div className="flex items-center gap-2 rounded-md border border-input bg-transparent shadow-xs px-3 py-1.5 max-w-xs w-full dark:bg-input/30">
          <Search className="h-3 w-3 text-muted-foreground shrink-0" />
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
              <X className="h-3 w-3" />
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
        <div className="space-y-1">
          {filteredSessions.map((session) => (
            <button
              key={session.sessionId}
              onClick={() => {
                // Navigate to conversation detail route including admin password
                if (password) {
                  router.push(`/conversation/${session.sessionId}?password=${encodeURIComponent(password)}`);
                }
                setReplyTo(null);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
            >
              {/* Unread dot */}
              <div className="w-2 shrink-0 flex justify-center">
                {session.hasUnreplied && (
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm truncate ${session.hasUnreplied ? "font-semibold" : "font-medium"}`}
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
              <span className="text-[11px] bg-muted text-muted-foreground tabular-nums shrink-0 rounded-full px-1.5 py-0.5 min-w-5 text-center">
                {session.messageCount}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
