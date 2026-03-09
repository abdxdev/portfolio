"use client";
import { useEffect } from "react";
import BlurText from "@/components/BlurText";
import ShinyText from "@/components/ShinyText";

export default function WorkflowContent() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/api/update-readme";
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <BlurText
        text="Updating GitHub Profile..."
        className="text-4xl font-semibold tracking-tight text-foreground"
      />
      <p className="text-sm text-muted-foreground">
        Changes will appear in ~15 seconds.
      </p>
      <ShinyText className="text-xs">
        Redirecting to GitHub...
      </ShinyText>
    </>
  );
}