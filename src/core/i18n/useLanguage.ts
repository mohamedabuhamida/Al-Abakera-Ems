"use client";

import { useEffect, useSyncExternalStore } from "react";

export type Language = "ar" | "en";

const storageKey = "al-abakera-language";
const eventName = "al-abakera-language-change";

function isLanguage(value: string | null | undefined): value is Language {
  return value === "ar" || value === "en";
}

function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "ar";

  const htmlLanguage = document.documentElement.dataset.lang;
  if (isLanguage(htmlLanguage)) return htmlLanguage;

  const savedLanguage = localStorage.getItem(storageKey);
  if (isLanguage(savedLanguage)) return savedLanguage;

  return "ar";
}

function getServerSnapshot(): Language {
  return "ar";
}

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", callback);
  };
}

export function applyLanguage(language: Language) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.lang = language;
  localStorage.setItem(storageKey, language);
  window.dispatchEvent(new Event(eventName));
}

export function useLanguage() {
  const language = useSyncExternalStore(
    subscribe,
    getStoredLanguage,
    getServerSnapshot
  );

  useEffect(() => {
    applyLanguage(getStoredLanguage());
  }, []);

  return {
    language,
    direction: language === "ar" ? "rtl" : "ltr",
    isArabic: language === "ar",
    setLanguage: applyLanguage,
    toggleLanguage: () => applyLanguage(language === "ar" ? "en" : "ar"),
  };
}
