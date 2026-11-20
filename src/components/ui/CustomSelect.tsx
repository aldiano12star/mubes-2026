"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface CustomSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  id?: string;
  error?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih opsi...",
  label,
  disabled = false,
  searchable,
  searchPlaceholder = "Cari opsi...",
  className = "",
  triggerClassName = "",
  dropdownClassName = "",
  id,
  error,
}: CustomSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const shouldSearch = searchable ?? options.length > 5;
  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = shouldSearch
    ? options.filter((opt) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        const matchLabel = opt.label.toLowerCase().includes(query);
        const matchDesc = opt.description?.toLowerCase().includes(query);
        const matchBadge = opt.badge?.toLowerCase().includes(query);
        return matchLabel || matchDesc || matchBadge;
      })
    : options;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && shouldSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, shouldSearch]);

  const handleSelect = (option: CustomSelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery("");
  };

  const SelectedIcon = selectedOption?.icon;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-ink-secondary mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Trigger Button with 44px min touch target */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-card text-left flex items-center justify-between gap-3 text-sm transition-all select-none cursor-pointer ${
          error
            ? "border-danger focus:ring-2 focus:ring-danger/20"
            : isOpen
            ? "border-primary ring-2 ring-primary/10 shadow-sm"
            : "border-edge hover:border-zinc-400 dark:hover:border-zinc-500"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-surface-raised"
            : "hover:bg-surface-raised/40"
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {SelectedIcon && (
            <SelectedIcon className="w-4 h-4 shrink-0 text-ink-muted" />
          )}
          <span
            className={`truncate block ${
              selectedOption ? "text-ink font-medium" : "text-ink-muted"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-surface-raised text-ink-secondary border border-edge shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-ink" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-card border border-edge shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 ${dropdownClassName}`}
        >
          {/* Optional Search Bar */}
          {shouldSearch && (
            <div className="p-2 border-b border-edge">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-ink-muted pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg bg-surface-raised border border-edge focus:outline-none focus:border-primary text-ink placeholder:text-ink-muted"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-edge/40">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-4 text-center text-xs text-ink-muted">
                Tidak ada opsi yang sesuai.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                const OptionIcon = opt.icon;

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    className={`min-h-[44px] px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none ${
                      opt.disabled
                        ? "opacity-40 cursor-not-allowed"
                        : isSelected
                        ? "bg-primary text-on-primary font-medium"
                        : "hover:bg-surface-raised text-ink"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {OptionIcon && (
                        <OptionIcon
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? "text-on-primary" : "text-ink-muted"
                          }`}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm leading-snug">
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-surface-raised text-ink-muted border border-edge"
                              }`}
                            >
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.description && (
                          <p
                            className={`text-xs mt-0.5 line-clamp-1 ${
                              isSelected ? "text-white/80" : "text-ink-muted"
                            }`}
                          >
                            {opt.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-on-primary shrink-0 stroke-[2.5]" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  );
}
