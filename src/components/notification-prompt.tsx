"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

const NOTIF_KEY = "conversation_notif";
const LAST_SEEN_KEY = "conversation_last_seen_id";

async function requestAndGrant(
  messages: { id: number }[],
  setEnabled: (v: boolean) => void
) {
  const w = window as any;
  if (w.OneSignal) {
    await w.OneSignal.Notifications.requestPermission();
    if (!w.OneSignal.User?.PushSubscription?.optedIn) {
      await w.OneSignal.User?.PushSubscription?.optIn();
    }
    if (!w.OneSignal.User?.PushSubscription?.optedIn) return false;
  } else {
    const result = await Notification.requestPermission();
    if (result !== "granted") return false;
  }
  localStorage.setItem(NOTIF_KEY, "granted");
  setEnabled(true);
  const maxId = messages.length > 0 ? Math.max(...messages.map((m) => m.id)) : 0;
  localStorage.setItem(LAST_SEEN_KEY, String(maxId));
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
    const newReplies = messages.filter((m) => m.is_admin && m.id > lastSeen);
    if (newReplies.length > 0 && prevCountRef.current > 0) {
      const latest = newReplies[newReplies.length - 1];
      const body = latest.message.length > 120 ? latest.message.slice(0, 120) + "…" : latest.message;
      new Notification("New reply", { body, icon: "/favicon.ico" });
    }
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
    <label className="flex items-center justify-between py-1.5 rounded-md cursor-pointer group" onClick={onToggle}>
      <span className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        <Bell className="h-3.5 w-3.5" />
        Notifications
      </span>
      <Switch checked={enabled} className="pointer-events-none" />
    </label>
  );
}
