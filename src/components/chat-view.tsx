"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Search, X, ChevronDown, Reply, Trash2, Undo2, Copy, CheckCheck, ArchiveRestore } from "lucide-react";
import {
  RecommendPicker,
  parseRecommendation,
  RecommendationCard,
} from "@/components/recommend-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,

  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaTrashRestore } from "react-icons/fa";
import { toast } from "sonner";

// ── Shared message type ───────────────────────────────────────────
export interface ChatMessage {
  id: number;
  session_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  reply_to: number | null;
  is_deleted: boolean;
  last_seen_at: string | null;
}

// ── Props ─────────────────────────────────────────────────────────
export interface ChatViewProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  onRecommend: (encoded: string) => void;
  onDelete: (messageId: number) => void;
  onUndelete?: (messageId: number) => void;
  isSubmitting: boolean;
  isAdmin?: boolean;
  messagesClassName?: string;
  placeholder?: string;
  showDoodle?: boolean;
  error?: string | null;
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
  showDateSeparators?: boolean;
  searchOpen: boolean;
  msgSearch: string;
  onSearchChange: (v: string) => void;
  replyTo: ChatMessage | null;
  onSetReplyTo: (msg: ChatMessage | null) => void;
  afterMessages?: React.ReactNode;
}

// ── Helpers ───────────────────────────────────────────────────────
const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ── Component ─────────────────────────────────────────────────────
export function ChatView({
  messages,
  input,
  onInputChange,
  onSubmit,
  onRecommend,
  onDelete,
  onUndelete,
  isSubmitting,
  isAdmin = false,
  messagesClassName = "max-h-60",
  placeholder = "Type a message",
  showDoodle = false,
  error,
  isLoading = false,
  emptyMessage,
  showDateSeparators = false,
  searchOpen,
  msgSearch,
  onSearchChange,
  replyTo,
  onSetReplyTo,
  afterMessages,
}: ChatViewProps) {
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const idPrefix = isAdmin ? "admin-msg" : "msg";

  const isSelf = (msg: ChatMessage) => (isAdmin ? msg.is_admin : !msg.is_admin);

  const getReplyPreview = (replyId: number | null) => {
    if (!replyId) return null;
    const found = messages.find((m) => m.id === replyId);
    if (!found) return null;
    const rec = parseRecommendation(found.message);
    return rec ? `${rec.type === "game" ? "🎮" : "📺"} ${rec.title}` : found.message;
  };

  const scrollToMessage = (messageId: number) => {
    const el = document.getElementById(`${idPrefix}-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(messageId);
      setTimeout(() => setHighlightedId(null), 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting) onSubmit();
    }
  };

  const filtered = messages.filter((msg) => {
    if (!msgSearch.trim()) return true;
    const term = msgSearch.toLowerCase();
    const rec = parseRecommendation(msg.message);
    if (rec) return rec.title.toLowerCase().includes(term);
    return msg.message.toLowerCase().includes(term);
  });

  const replyPreviewText = replyTo
    ? (() => {
      const rec = parseRecommendation(replyTo.message);
      return rec ? `${rec.type === "game" ? "🎮" : "📺"} ${rec.title}` : replyTo.message;
    })()
    : null;

  // ── Loading ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Empty ───────────────────────────────────────────────────────
  if (messages.length === 0 && emptyMessage) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 flex items-center justify-center">
          {emptyMessage}
        </div>
        <div className="mt-auto">
          <RecommendPicker
            onRecommend={onRecommend}
            messageValue={input}
            onMessageChange={onInputChange}
            onMessageSubmit={onSubmit}
            isSubmitting={isSubmitting}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            showDoodle={showDoodle}
            replyPreview={replyPreviewText}
            onCancelReply={() => onSetReplyTo(null)}
          />
        </div>
        {error && toast.error(error)}
      </div>
    );
  }

  return (
    <div className="space-y-3 flex flex-col flex-1 min-h-0">
      {/* Search */}
      {searchOpen && (
        <div className="flex items-center gap-2 rounded-md border border-input bg-transparent shadow-xs px-3 py-1.5 dark:bg-input/30">
          <Search className="h-3 w-3 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search messages"
            value={msgSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {msgSearch && (
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={() => onSearchChange("")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Clear Search</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      {/* Messages */}
      <div ref={containerRef} className={`overflow-y-auto space-y-1.5 pr-1 ${messagesClassName}`}>
        {filtered.map((msg, i) => {
          const self = isSelf(msg);
          const rec = parseRecommendation(msg.message);
          const replyPrev = getReplyPreview(msg.reply_to);
          const canDelete = isAdmin || self;
          const isDeleted = msg.is_deleted;

          // Date separator
          const showDate =
            showDateSeparators &&
            (i === 0 ||
              new Date(msg.created_at).toDateString() !==
              new Date(filtered[i - 1].created_at).toDateString());

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
              <div
                id={`${idPrefix}-${msg.id}`}
                className={`group/msg flex ${self ? "justify-end" : "justify-start"} transition-colors duration-500 rounded-lg ${highlightedId === msg.id ? "bg-primary/10" : ""
                  }`}
              >
                <div
                  className={`flex items-center gap-1 max-w-[85%] ${self ? "flex-row-reverse" : "flex-row"
                    }`}
                >
                  <div className="min-w-0">
                    {/* Reply preview */}
                    {replyPrev && (
                      <button
                        onClick={() => msg.reply_to && scrollToMessage(msg.reply_to)}
                        className={`text-[11px] text-muted-foreground mb-0.5 px-3 truncate block w-full hover:text-foreground transition-colors cursor-pointer ${self ? "text-right" : "text-left"
                          }`}
                      >
                        <Reply className="inline h-3 w-3 mr-1" />
                        {replyPrev}
                      </button>
                    )}

                    {/* Deleted message (admin view) */}
                    {isDeleted ? (
                      isAdmin ? (
                        <div
                          className={`rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed border border-dashed border-destructive/30 ${self ? "rounded-br-sm" : "rounded-bl-sm"
                            }`}
                        >
                          {rec ? (
                            <div className="opacity-50">
                              <RecommendationCard rec={rec} />
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap wrap-break-word text-muted-foreground/60">
                              {msg.message}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-destructive/60 font-medium">
                              deleted
                            </span>
                            <span className="text-[10px] text-muted-foreground/40">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        </div>
                      ) : null /* visitor never sees deleted */
                    ) : rec ? (
                      /* Recommendation card */
                      <div>
                        <RecommendationCard rec={rec} />
                        <p
                          className={`text-[10px] mt-1 text-muted-foreground flex items-center gap-1 ${self ? "justify-end" : ""
                            }`}
                        >
                          {formatTime(msg.created_at)}
                          {self && msg.last_seen_at && (
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="cursor-pointer">
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">Seen at {formatTime(msg.last_seen_at)}</TooltipContent>
                            </Tooltip>
                          )}
                        </p>
                      </div>
                    ) : (
                      /* Normal text bubble */
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${self
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                          }`}
                      >
                        <p className="whitespace-pre-wrap wrap-break-word">{msg.message}</p>
                        <p
                          className={`text-[10px] mt-0.5 flex items-center gap-1 ${self ? "text-primary-foreground/50 justify-end" : "text-muted-foreground"
                            }`}
                        >
                          {formatTime(msg.created_at)}
                          {self && msg.last_seen_at && (
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="cursor-pointer">
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">Seen at {formatTime(msg.last_seen_at)}</TooltipContent>
                            </Tooltip>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dropdown */}
                  {!isDeleted && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="md:opacity-0 md:group-hover/msg:opacity-100 transition-opacity p-1 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0">
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align={self ? "end" : "start"}
                        className="min-w-0"
                      >
                        <Tooltip>
                          <TooltipTrigger>
                            <DropdownMenuItem onClick={() => onSetReplyTo(msg)}>
                              <Reply className="h-3.5 w-3.5" />
                            </DropdownMenuItem>
                          </TooltipTrigger>
                          <TooltipContent side="top">Reply</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            <DropdownMenuItem
                              onClick={() => {
                                const rec = parseRecommendation(msg.message);
                                const text = rec ? rec.title : msg.message;
                                navigator.clipboard.writeText(text);
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </DropdownMenuItem>
                          </TooltipTrigger>
                          <TooltipContent side="top">Copy</TooltipContent>
                        </Tooltip>
                        {canDelete && (
                          <Tooltip>
                            <TooltipTrigger>
                              <DropdownMenuItem
                                onClick={() => onDelete(msg.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </DropdownMenuItem>
                            </TooltipTrigger>
                            <TooltipContent side="top">Delete</TooltipContent>
                          </Tooltip>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Undelete dropdown for admin on deleted messages */}
                  {isDeleted && isAdmin && onUndelete && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="md:opacity-0 md:group-hover/msg:opacity-100 transition-opacity p-1 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0">
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={self ? "end" : "start"} className="min-w-0">
                        <Tooltip>
                          <TooltipTrigger>
                            <DropdownMenuItem onClick={() => onUndelete(msg.id)}>
                              <ArchiveRestore className="h-3.5 w-3.5" />
                            </DropdownMenuItem>
                          </TooltipTrigger>
                          <TooltipContent side="top">Restore</TooltipContent>
                        </Tooltip>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-[11px] text-muted-foreground text-center py-2">No matches</p>
        )}
      </div>

      {afterMessages}

      {/* Input */}
      <RecommendPicker
        onRecommend={onRecommend}
        messageValue={input}
        onMessageChange={onInputChange}
        onMessageSubmit={onSubmit}
        isSubmitting={isSubmitting}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        replyPreview={replyPreviewText}
        onCancelReply={() => onSetReplyTo(null)}
      />
      {error && toast.error(error)}
    </div>
  );
}
