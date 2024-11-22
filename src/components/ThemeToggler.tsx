"use client";

// src/components/ThemeToggler.tsx
import { useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggler() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        const storedTheme = localStorage.getItem('theme');
        const isDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) root.classList.add('dark');
        else root.classList.remove('dark');

        setDarkMode(isDark);
    }, []);

    const toggleTheme = () => {
        const root = window.document.documentElement;
        const newTheme = darkMode ? 'light' : 'dark';

        root.classList.toggle('dark', !darkMode);
        localStorage.setItem('theme', newTheme);
        setDarkMode(!darkMode);
    };

    return (
        // far right
        <button onClick={toggleTheme} className="rounded-full absolute right-4 top-4">
            {darkMode ? (
                <FaSun className="size-5" />
            ) : (
                <FaMoon className="size-5" />
            )}
        </button>
    );
}
