"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "jc-app.theme";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    const prefers =
      stored === "dark" ||
      (stored === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(prefers);
    document.documentElement.classList.toggle("dark", prefers);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      className="text-slate-400 transition-colors hover:text-earth-500"
    >
      {dark ? (
        <Sun className="h-4 w-4" strokeWidth={1.25} />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.25} />
      )}
    </button>
  );
}
