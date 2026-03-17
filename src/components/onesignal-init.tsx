"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

let initialized = false;

function onSubscriptionChange(event: any) {
  const id = event?.current?.id;
  if (id && event?.current?.optedIn) {
    fetch("/api/push-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: id }),
    }).catch(() => { });
  } else if (!event?.current?.optedIn) {
    fetch("/api/push-subscription", { method: "DELETE" }).catch(() => { });
  }
}

export function OneSignalInit() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    if (process.env.VERCEL_ENV !== "production") return;

    OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
      safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
      notifyButton: { enable: false } as any,
    }).then(() => {
      OneSignal.User.PushSubscription.addEventListener("change", onSubscriptionChange);
    });
  }, []);

  return null;
}
