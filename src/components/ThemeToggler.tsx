"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const ThemeToggler = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialTheme = storedTheme === "dark" || (!storedTheme && prefersDark);
    setDarkMode(initialTheme);

    root.classList.toggle("dark", initialTheme);
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const newTheme = darkMode ? "light" : "dark";

    root.classList.toggle("dark", !darkMode);
    localStorage.setItem("theme", newTheme);
    setDarkMode(!darkMode);
  };

  return (
    <div className="m-4 absolute right-0 top-0 gap-2 flex items-center">
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
      <Button
        onClick={toggleTheme}
        variant="ghost"
        size="icon"
      >
        {darkMode ? <Sun /> : <Moon />}
      </Button>
    </div>
  );
};
