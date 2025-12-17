"use client";

import type React from "react";

import { X } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ResourceChipsInputProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  placeholder: string;
  chips: string[];
  chipColorClass: string;
  onRemoveChip: (value: string) => void;
};

export function ResourceChipsInput({
  inputRef,
  inputValue,
  onInputValueChange,
  onKeyDown,
  onBlur,
  placeholder,
  chips,
  chipColorClass,
  onRemoveChip,
}: ResourceChipsInputProps) {
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-muted-foreground">
        Resource name
      </Label>
      <div
        className={cn(
          "min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text",
          "flex flex-wrap content-start gap-2"
        )}
        onClick={handleContainerClick}
      >
        {chips.map((res, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border group transition-colors"
          >
            <div className={cn("w-2 h-2 rounded-full mr-1", chipColorClass)} />
            <span className="max-w-[150px] truncate">{res}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveChip(res);
              }}
              className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => onInputValueChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          className="flex-1 bg-transparent outline-none min-w-[100px] h-6 placeholder:text-muted-foreground/50"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

