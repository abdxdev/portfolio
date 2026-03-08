"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import OneSignal from "react-onesignal";

const NOTIF_KEY = "conversation_notif";
const LAST_SEEN_KEY = "conversation_last_seen_id";

function waitForOptIn(timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    if (OneSignal.User.PushSubscription.optedIn) {
      resolve(true);
      return;
    }
    const timer = setTimeout(() => resolve(false), timeoutMs);
    const handler = (event: any) => {
      if (event?.current?.optedIn) {
        clearTimeout(timer);
        OneSignal.User.PushSubscription.removeEventListener("change", handler);
        resolve(true);
      }
    };
    OneSignal.User.PushSubscription.addEventListener("change", handler);
  });
}

async function requestAndGrant(
  messages: { id: number }[],
  setEnabled: (v: boolean) => void
) {
  await OneSignal.Notifications.requestPermission();

  try {
    await OneSignal.User.PushSubscription.optIn();
  } catch { /* ignore if already opted in */ }

  const optedIn = await waitForOptIn();
  if (!optedIn) return false;

  localStorage.setItem(NOTIF_KEY, "granted");
  setEnabled(true);
  const maxId = messages.length > 0 ? Math.max(...messages.map((m) => m.id)) : 0;
  localStorage.setItem(LAST_SEEN_KEY, String(maxId));
  return true;
}

const NOTIF_SYNC_EVENT = "notif-sync";

export function useReplyNotifications(messages: { id: number; is_admin: boolean; message: string }[]) {
  const [enabled, setEnabled] = useState(false);
  const prevCountRef = useRef<number>(0);
  const askedThisSession = useRef(false);

  useEffect(() => {
    setEnabled(localStorage.getItem(NOTIF_KEY) === "granted");
    const onStorage = (e: StorageEvent) => {
      if (e.key === NOTIF_KEY) setEnabled(e.newValue === "granted");
    };
    const onSync = () => setEnabled(localStorage.getItem(NOTIF_KEY) === "granted");
    window.addEventListener("storage", onStorage);
    window.addEventListener(NOTIF_SYNC_EVENT, onSync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(NOTIF_SYNC_EVENT, onSync);
    };
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
      window.dispatchEvent(new Event(NOTIF_SYNC_EVENT));
      OneSignal.User.PushSubscription.optOut();
    } else {
      await requestAndGrant(messages, setEnabled);
      window.dispatchEvent(new Event(NOTIF_SYNC_EVENT));
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
