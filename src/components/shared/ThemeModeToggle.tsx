"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const storageKey = "al-abakera-theme";

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  localStorage.setItem(storageKey, mode);
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const savedMode = localStorage.getItem(storageKey);
  if (savedMode === "light" || savedMode === "dark") return savedMode;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

type ThemeModeToggleProps = {
  variant?: "segmented" | "icon";
};

export default function ThemeModeToggle({
  variant = "segmented",
}: ThemeModeToggleProps) {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  function chooseMode(nextMode: ThemeMode) {
    setMode(nextMode);
  }

  if (variant === "icon") {
    const nextMode = mode === "dark" ? "light" : "dark";
    const Icon = mode === "dark" ? Sun : Moon;

    return (
      <button
        type="button"
        onClick={() => chooseMode(nextMode)}
        aria-label={`Switch to ${nextMode} mode`}
        className="icon-button"
        title={`Switch to ${nextMode} mode`}
      >
        <Icon size={20} />
      </button>
    );
  }

  return (
    <div className="inline-flex rounded-default border border-outline-variant bg-surface-container-low p-1">
      <button
        type="button"
        onClick={() => chooseMode("light")}
        aria-pressed={mode === "light"}
        className={`inline-flex h-8 items-center gap-2 rounded-sm px-3 text-xs font-semibold transition ${
          mode === "light"
            ? "bg-surface-container-lowest text-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <Sun size={14} />
        Light
      </button>
      <button
        type="button"
        onClick={() => chooseMode("dark")}
        aria-pressed={mode === "dark"}
        className={`inline-flex h-8 items-center gap-2 rounded-sm px-3 text-xs font-semibold transition ${
          mode === "dark"
            ? "bg-surface-container-lowest text-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <Moon size={14} />
        Dark
      </button>
    </div>
  );
}
