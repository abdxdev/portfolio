"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import BlurText from "@/components/BlurText";

function TriggerWorkflowContent() {
  const searchParams = useSearchParams();
  const redirectUri =
    searchParams.get("redirect_uri") ?? "https://github.com/abdxdev";

  const hasRedirected = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        window.location.href = redirectUri;
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [redirectUri]);

  return (
    <>
      <BlurText
        text="Updating README…"
        delay={200}
        animateBy="words"
        direction="top"
        className="text-4xl font-semibold tracking-tight text-foreground"
      />
      <p className="text-sm text-muted-foreground">
        Changes will appear in ~15 seconds.
      </p>
      <p className="text-xs text-muted-foreground animate-pulse">
        Redirecting to GitHub…
      </p>
    </>
  );
}

export default function TriggerWorkflowPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <Suspense>
        <TriggerWorkflowContent />
      </Suspense>
    </div>
  );
}