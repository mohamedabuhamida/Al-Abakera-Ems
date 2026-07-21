"use client";

import { useLanguage } from "@/core/i18n/useLanguage";
import { Languages } from "lucide-react";

type LanguageToggleProps = {
  variant?: "icon" | "segmented";
};

export default function LanguageToggle({
  variant = "icon",
}: LanguageToggleProps) {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === "segmented") {
    return (
      <div className="inline-flex rounded-default border border-outline-variant bg-surface-container-low p-1">
        <button
          type="button"
          onClick={() => setLanguage("ar")}
          aria-pressed={language === "ar"}
          className={`inline-flex h-8 items-center rounded-sm px-3 text-xs font-semibold transition ${
            language === "ar"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          عربي
        </button>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          aria-pressed={language === "en"}
          className={`inline-flex h-8 items-center rounded-sm px-3 text-xs font-semibold transition ${
            language === "en"
              ? "bg-surface-container-lowest text-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className="icon-button gap-1.5 text-xs font-semibold"
      title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Languages size={18} />
      <span>{language === "ar" ? "EN" : "AR"}</span>
    </button>
  );
}
