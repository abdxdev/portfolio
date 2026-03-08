"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkIcon, Search, Expand, EllipsisVertical, Trash2 } from "lucide-react";
import { parseRecommendation } from "@/components/recommend-picker";
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

export const Conversation = ({ id }: { id?: string }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [msgSearch, setMsgSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  const { enabled: notifEnabled, loading: notifLoading, toggle: toggleNotifications, showPrompt: notifShowPrompt, enableFromPrompt, dismissPrompt } =
    useReplyNotifications(messages);

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

  const handleRecommend = async (encoded: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: encoded, replyTo: replyTo?.id }),
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
      const response = await fetch("/api/conversation?clearAll=true", {
        method: "DELETE",
      });
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

  const handleSubmit = async () => {
    if (!input.trim() || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, replyTo: replyTo?.id }),
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
      const response = await fetch(`/api/conversation?id=${messageId}`, {
        method: "DELETE",
      });
      if (response.ok) await fetchMessages();
    } catch {
      // Silently fail
    }
  };

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
                    <EllipsisVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => { setSearchOpen(!searchOpen); setMsgSearch(""); }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/conversation">
                      <Expand className="h-4 w-4 mr-2" />
                      Full Screen
                    </Link>
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
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChatView
            messages={messages}
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onRecommend={handleRecommend}
            onDelete={handleDelete}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            placeholder="Type a message"
            showDoodle={!isLoading && messages.length === 0}
            error={error}
            emptyMessage={
              <p className="text-sm text-muted-foreground text-center py-3">
                Drop me a message — it's anonymous and I'll reply here. Or recommend a{" "}
                <span className="text-green-500">game</span> or{" "}
                <span className="text-violet-500">anime</span> you think I'd like!
              </p>
            }
            messagesClassName="max-h-60"
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
        </CardContent>
      </Card>
    </section>
  );
};
