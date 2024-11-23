"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThemeToggler = () => {
    const [darkMode, setDarkMode] = useState<boolean>(false);

    // Initialize theme on mount
    useEffect(() => {
        const root = window.document.documentElement;
        const storedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        const initialTheme = storedTheme === "dark" || (!storedTheme && prefersDark);
        setDarkMode(initialTheme);

        root.classList.toggle("dark", initialTheme); // Sync theme with the DOM
    }, []);

    // Toggle theme
    const toggleTheme = () => {
        const root = window.document.documentElement;
        const newTheme = darkMode ? "light" : "dark";

        root.classList.toggle("dark", !darkMode);
        localStorage.setItem("theme", newTheme);
        setDarkMode(!darkMode);
    };

    return (
        <Button
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            className="m-4 absolute right-0 top-0"
        >
            {darkMode ? <Sun /> : <Moon />}
        </Button>
    );
};
