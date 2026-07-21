"use client";

import { Loader2 ,ChevronDown, Search } from "lucide-react";
import { ReactNode , useMemo, useState } from "react";
import { useLanguage } from "@/core/i18n/useLanguage";

interface FieldProps {
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function Field({
  label,
  value,
  type = "text",
  required,
  readOnly,
  placeholder,
  onChange,
}: FieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      {type === "textarea" ? (
        <textarea
          value={value}
          required={required}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="input-field w-full min-h-[100px] read-only:bg-surface-container-low read-only:text-on-surface-variant"
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={value}
          required={required}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="input-field w-full read-only:bg-surface-container-low read-only:text-on-surface-variant"
        />
      )}
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string | ReactNode }>;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
  disabled,
}: SelectFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-field w-full"
        required={required}
        disabled={disabled}
      >
        <option value="">{placeholder || "اختر"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface SearchableSelectFieldProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  searchPlaceholder?: string;
  isLoading?: boolean;
}

export function SearchableSelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
  searchPlaceholder,
  isLoading,
}: SearchableSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { language } = useLanguage(); // You'll need to add this import

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchTerm]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="input-field w-full text-start flex items-center justify-between"
          disabled={isLoading}
        >
          <span
            className={
              selectedOption ? "text-on-surface" : "text-on-surface-variant/70"
            }
          >
            {selectedOption?.label || placeholder || "اختر"}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && !isLoading && (
          <div className="absolute z-10 mt-1 w-full rounded-default border border-outline bg-surface-container-low shadow-lg max-h-64 overflow-hidden">
            <div className="p-2 border-b border-outline-variant">
              <div className="flex items-center gap-2 rounded-sm border border-outline-variant bg-surface-container-low px-3">
                <Search size={14} className="text-on-surface-variant" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder || "ابحث..."}
                  className="w-full border-none bg-transparent py-1.5 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="p-2 text-center text-sm text-on-surface-variant">
                  {language === "ar" ? "لا توجد نتائج" : "No results found"}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full text-start rounded-sm px-3 py-2 text-sm transition-colors hover:bg-surface-container-high ${
                      value === option.value
                        ? "bg-primary-fixed text-on-primary-fixed-variant"
                        : "text-on-surface"
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
        {isLoading && (
          <div className="absolute z-10 mt-1 w-full rounded-default border border-outline bg-surface-container-low p-4 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}