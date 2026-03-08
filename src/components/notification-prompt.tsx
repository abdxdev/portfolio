"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

const NOTIF_KEY = "conversation_notif";
const LAST_SEEN_KEY = "conversation_last_seen_id";

async function saveSubscription() {
  const w = window as any;
  // Poll briefly because the subscription id may not be set synchronously after optIn
  for (let i = 0; i < 10; i++) {
    const playerId = w.OneSignal?.User?.PushSubscription?.id;
    if (playerId) {
      await fetch("/api/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      }).catch(() => { });
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function requestAndGrant(
  messages: { id: number }[],
  setEnabled: (v: boolean) => void
) {
  const w = window as any;
  if (!w.OneSignal) return false;

  await w.OneSignal.Notifications.requestPermission();

  try {
    await w.OneSignal.User.PushSubscription.optIn();
  } catch { /* ignore if already opted in */ }

  let optedIn = false;
  for (let i = 0; i < 20; i++) {
    if (w.OneSignal.User?.PushSubscription?.optedIn) { optedIn = true; break; }
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!optedIn) return false;

  localStorage.setItem(NOTIF_KEY, "granted");
  setEnabled(true);
  const maxId = messages.length > 0 ? Math.max(...messages.map((m) => m.id)) : 0;
  localStorage.setItem(LAST_SEEN_KEY, String(maxId));

  saveSubscription();
  return true;
}

export function useReplyNotifications(messages: { id: number; is_admin: boolean; message: string }[]) {
  const [enabled, setEnabled] = useState(false);
  const prevCountRef = useRef<number>(0);
  const askedThisSession = useRef(false);

  useEffect(() => {
    setEnabled(localStorage.getItem(NOTIF_KEY) === "granted");
  }, []);

  useEffect(() => {
    if (askedThisSession.current) return;
    const state = localStorage.getItem(NOTIF_KEY);
    if (state === "granted" || state === "denied") return;
    if (!messages.some((m) => !m.is_admin)) return;

    askedThisSession.current = true;
    toast("Want to know when I reply?", {
      description: "Enable notifications so you don't miss my response.",
      duration: 8000,
      action: {
        label: "Enable",
        onClick: async () => {
          const granted = await requestAndGrant(messages, setEnabled);
          if (granted) toast.success("Notifications enabled!");
          else localStorage.setItem(NOTIF_KEY, "denied");
        },
      },
    });
  }, [messages]);

  useEffect(() => {
    if (!enabled || messages.length === 0) return;
    const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || "0");

    const maxId = Math.max(...messages.map((m) => m.id));
    localStorage.setItem(LAST_SEEN_KEY, String(maxId));
    prevCountRef.current = messages.length;
  }, [messages, enabled]);

  const toggle = useCallback(async () => {
    if (enabled) {
      setEnabled(false);
      localStorage.setItem(NOTIF_KEY, "denied");
      (window as any).OneSignal?.User?.PushSubscription?.optOut();
    } else {
      await requestAndGrant(messages, setEnabled);
    }
  }, [enabled, messages]);

  return { enabled, toggle };
}

export function NotificationCheckboxItem({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <DropdownMenuItem
      onSelect={(e) => e.preventDefault()}
      onClick={onToggle}
      className="flex items-center justify-between"
    >
      <span className="flex items-center gap-2">
        <Bell className="h-4 w-4 mr-2" />
        Notifications
      </span>
      <Switch checked={enabled} className="pointer-events-none scale-75" />
    </DropdownMenuItem>
  );
}

export function NotificationToggleRow({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-1.5 rounded-md cursor-pointer group" onClick={onToggle}>
      <span className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        <Bell className="h-3.5 w-3.5" />
        Reply notifications
      </span>
      <Switch checked={enabled} onCheckedChange={onToggle} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
