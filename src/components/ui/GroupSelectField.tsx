"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface GroupSelectFieldProps {
  label: string;
  value: string[];
  options: Array<{ value: string; label: string }>;
  onChange: (values: string[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  language: string;
}

export function GroupSelectField({
  label,
  value,
  options,
  onChange,
  isLoading,
  placeholder,
  language,
}: GroupSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="input-field w-full min-h-[42px] text-start flex items-center gap-2 flex-wrap"
          disabled={isLoading}
        >
          {value.length === 0 ? (
            <span className="text-on-surface-variant/70">
              {placeholder || "اختر المجموعات"}
            </span>
          ) : (
            value.map((v) => {
              const option = options.find((o) => o.value === v);
              return (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 rounded-sm bg-primary-fixed px-2 py-0.5 text-xs text-on-primary-fixed-variant"
                >
                  {option?.label}
                </span>
              );
            })
          )}
          {isLoading && <Loader2 size={16} className="animate-spin ml-auto" />}
        </button>
        {isOpen && !isLoading && (
          <div className="absolute z-10 mt-1 w-full rounded-default border border-outline bg-surface-container-low p-2 shadow-lg max-h-48 overflow-y-auto">
            {options.length === 0 ? (
              <div className="p-2 text-center text-sm text-on-surface-variant">
                {language === "ar"
                  ? "لا توجد مجموعات متاحة"
                  : "No groups available"}
              </div>
            ) : (
              options.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-sm p-2 hover:bg-surface-container-high"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-on-surface">{option.label}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}