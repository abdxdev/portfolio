"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export const ApiButton = () => {
  return (
    <Link href="/api">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="View API"
      >
        API
      </Button>
    </Link>
  );
};
