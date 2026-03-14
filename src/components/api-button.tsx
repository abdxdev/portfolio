"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const ApiButton = () => {
  return (
    <Link href="/docs">
      <Button
        variant="ghost"
        // size="icon"
        className="relative"
        aria-label="View API"
      >
        API
        <ExternalLink />
      </Button>
    </Link>
  );
};
