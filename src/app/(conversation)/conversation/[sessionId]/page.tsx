"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Trash2, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatView, type ChatMessage } from "@/components/chat-view";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useReplyNotifications,
  NotificationCheckboxItem,
  NotificationPromptBanner,
} from "@/components/notification-prompt";
import { highlight } from "@/lib/highlight";

export default function ConversationSessionPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string | undefined;
  const password = search?.get("password") || null;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [msgSearch, setMsgSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  useEffect(() => {
    if (!password) {
      router.replace("/conversation");
    }
  }, [password, router]);

  const { enabled: notifEnabled, loading: notifLoading, toggle: toggleNotifications, showPrompt: notifShowPrompt, enableFromPrompt, dismissPrompt } =
    useReplyNotifications(messages);

  const fetchMessages = useCallback(async () => {
    if (!password) return;
    try {
      let url = "/api/conversation";
      if (password && sessionId) url += `?password=${encodeURIComponent(String(password))}&sessionId=${encodeURIComponent(String(sessionId))}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [password, sessionId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleRecommend = async (encoded: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (password) headers["Authorization"] = `Bearer ${password}`;
      const body: any = { message: encoded, replyTo: replyTo?.id };
      if (sessionId) body.sessionId = sessionId;
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setReplyTo(null);
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

  const handleClearChat = async () => {
    try {
      let url = "/api/conversation?clearAll=true";
      if (password && sessionId) url += `&password=${encodeURIComponent(String(password))}&sessionId=${encodeURIComponent(String(sessionId))}`;
      const response = await fetch(url, { method: "DELETE" });
      if (response.ok) {
        setMessages([]);
        setInput("");
        setReplyTo(null);
        setSearchOpen(false);
        setMsgSearch("");
      }
    } catch {
      // Silently fail
    }
  };

  const handleUndelete = async (messageId: number) => {
    if (!password) return;
    try {
      const url = `/api/conversation?password=${encodeURIComponent(String(password))}&id=${messageId}`;
      const response = await fetch(url, { method: "PATCH" });
      if (response.ok) await fetchMessages();
    } catch {
      // Silently fail
    }
  };

  const handleDeleteSession = async () => {
    if (!password || !sessionId) return;
    try {
      const url = `/api/conversation?password=${encodeURIComponent(String(password))}&clearAll=true&hard=true&sessionId=${encodeURIComponent(String(sessionId))}`;
      const response = await fetch(url, { method: "DELETE" });
      if (response.ok) {
        router.push(`/conversations?password=${encodeURIComponent(String(password))}`);
      }
    } catch {
      // Silently fail
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (password) headers["Authorization"] = `Bearer ${password}`;
      const body: any = { message: input, replyTo: replyTo?.id };
      if (sessionId) body.sessionId = sessionId;
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setInput("");
        setReplyTo(null);
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

  const handleDelete = async (messageId: number) => {
    try {
      let url = `/api/conversation?id=${messageId}`;
      if (password) url += `&password=${encodeURIComponent(String(password))}`;
      const response = await fetch(url, { method: "DELETE" });
      if (response.ok) await fetchMessages();
    } catch {
      // Silently fail
    }
  };

  if (!sessionId || !password) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b mb-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Link href={`/conversations?password=${encodeURIComponent(String(password))}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold flex-1">Conversation</h1>
        {messages.length > 0 && (
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
                onClick={() => { setSearchOpen(!searchOpen); setMsgSearch(""); }}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </DropdownMenuItem>
              <NotificationCheckboxItem
                enabled={notifEnabled}
                loading={notifLoading}
                onToggle={toggleNotifications}
              />
              <DropdownMenuItem
                onClick={handleClearChat}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await handleDeleteSession();
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Full-screen chat */}
      <ChatView
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onRecommend={handleRecommend}
        onDelete={handleDelete}
        onUndelete={handleUndelete}
        isAdmin={!!password}
        isSubmitting={isSubmitting}
        isLoading={isLoading}
        placeholder="Type a message"
        showDoodle={!isLoading && messages.length === 0}
        error={error}
        emptyMessage={
          <p className="text-sm text-muted-foreground text-center py-3">
            Drop me a message — it's anonymous and I'll reply here. Or recommend a{" "}
            <Button variant="link" className="text-green-500 p-0 h-auto"
              onClick={() => {
                highlight("game-recommendation", "#00C950");
              }}>
              game
            </Button>
            {" "}or{" "}
            <Button variant="link" className="text-violet-500 p-0 h-auto"
              onClick={() => {
                highlight("anime-recommendation", "#8E51FF");
              }}>
              anime
            </Button>
            {" "}you think I'd like!
          </p>
        }
        messagesClassName="flex-1 min-h-0"
        searchOpen={searchOpen}
        msgSearch={msgSearch}
        onSearchChange={setMsgSearch}
        replyTo={replyTo}
        onSetReplyTo={setReplyTo}
        afterMessages={notifShowPrompt && (
          <NotificationPromptBanner
            onEnable={enableFromPrompt}
            onDismiss={dismissPrompt}
            loading={notifLoading}
          />
        )}
      />
    </div>
  );
}