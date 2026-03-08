"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Loader2, X } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const prevCountRef = useRef<number>(0);
  const promptShownRef = useRef(false);

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
    if (promptShownRef.current) return;
    const state = localStorage.getItem(NOTIF_KEY);
    if (state === "granted" || state === "denied") return;
    if (!messages.some((m) => !m.is_admin)) return;
    promptShownRef.current = true;
    setShowPrompt(true);
  }, [messages]);

  useEffect(() => {
    if (!enabled || messages.length === 0) return;
    const maxId = Math.max(...messages.map((m) => m.id));
    localStorage.setItem(LAST_SEEN_KEY, String(maxId));
    prevCountRef.current = messages.length;
  }, [messages, enabled]);

  const toggle = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (enabled) {
        setEnabled(false);
        localStorage.setItem(NOTIF_KEY, "denied");
        window.dispatchEvent(new Event(NOTIF_SYNC_EVENT));
        OneSignal.User.PushSubscription.optOut();
        fetch('/api/push-subscription', { method: 'DELETE' }).catch(() => { });
      } else {
        await requestAndGrant(messages, setEnabled);
        window.dispatchEvent(new Event(NOTIF_SYNC_EVENT));
      }
    } finally {
      setLoading(false);
    }
  }, [enabled, loading, messages]);

  const enableFromPrompt = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const granted = await requestAndGrant(messages, setEnabled);
      window.dispatchEvent(new Event(NOTIF_SYNC_EVENT));
      if (!granted) localStorage.setItem(NOTIF_KEY, "denied");
    } finally {
      setLoading(false);
      setShowPrompt(false);
    }
  }, [loading, messages]);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(NOTIF_KEY, "denied");
  }, []);

  return { enabled, loading, toggle, showPrompt, enableFromPrompt, dismissPrompt };
}

export function NotificationPromptBanner({
  onEnable,
  onDismiss,
  loading,
}: {
  onEnable: () => void;
  onDismiss: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex justify-center py-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
        <Bell className="h-3 w-3 shrink-0" />
        <span>Get notified when I reply?</span>
        <button
          onClick={onEnable}
          disabled={loading}
          className="text-primary font-medium hover:underline disabled:opacity-50 flex items-center"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Enable"}
        </button>
        <button onClick={onDismiss} className="hover:text-foreground transition-colors">
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export function NotificationCheckboxItem({ enabled, loading, onToggle }: { enabled: boolean; loading?: boolean; onToggle: () => void }) {
  return (
    <DropdownMenuItem
      onSelect={(e) => e.preventDefault()}
      onClick={onToggle}
      disabled={loading}
      className="flex items-center justify-between"
    >
      <span className="flex items-center gap-2">
        <Bell className="h-4 w-4 mr-2" />
        Notifications
      </span>
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        : <Switch checked={enabled} className="pointer-events-none scale-75" />}
    </DropdownMenuItem>
  );
}

export function NotificationToggleRow({ enabled, loading, onToggle }: { enabled: boolean; loading?: boolean; onToggle: () => void }) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 rounded-md group ${loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      onClick={loading ? undefined : onToggle}
    >
      <span className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        <Bell className="h-3.5 w-3.5" />
        Reply notifications
      </span>
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        : <Switch checked={enabled} onCheckedChange={onToggle} onClick={(e) => e.stopPropagation()} />}
    </div>
  );
}
