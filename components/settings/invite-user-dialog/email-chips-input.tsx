"use client";

import type React from "react";

import { AlertCircle, X } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type EmailChipsInputProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  placeholder: string;
  disabled: boolean;
  remainingSeats: number;
  emailChips: string[];
  onRemoveChip: (email: string) => void;
  isValidEmail: (email: string) => boolean;
  existingTeamEmails: Set<string>;
};

export function EmailChipsInput({
  inputRef,
  inputValue,
  onInputValueChange,
  onKeyDown,
  onPaste,
  onBlur,
  placeholder,
  disabled,
  remainingSeats,
  emailChips,
  onRemoveChip,
  isValidEmail,
  existingTeamEmails,
}: EmailChipsInputProps) {
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-semibold text-muted-foreground">
          Emails
        </Label>
        <span
          className={cn(
            "text-xs",
            remainingSeats < 0 ? "text-red-500" : "text-muted-foreground"
          )}
        >
          You have {remainingSeats} seats left
        </span>
      </div>

      <div
        className={cn(
          "min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text",
          "flex flex-wrap content-start gap-2"
        )}
        onClick={handleContainerClick}
      >
        {emailChips.map((email, index) => {
          const isFormatValid = isValidEmail(email);
          const isMember = existingTeamEmails.has(email.toLowerCase());
          const isError = !isFormatValid || isMember;

          let errorMessage = "";
          if (!isFormatValid) errorMessage = "Invalid format";
          else if (isMember) errorMessage = "Already in team";

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors group relative",
                isError
                  ? "bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                  : "bg-primary/10 text-primary border border-primary/20"
              )}
              title={errorMessage}
            >
              {isError ? <AlertCircle className="w-3 h-3 mr-0.5" /> : null}
              <span className="max-w-[150px] truncate">{email}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveChip(email);
                }}
                className={cn(
                  "ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none"
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => onInputValueChange(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={onBlur}
          className="flex-1 bg-transparent outline-none min-w-[120px] h-7 placeholder:text-muted-foreground/50"
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>

      <p className="text-[10px] text-muted-foreground">
        Press Enter, Comma, or Space to add multiple emails.
      </p>
    </div>
  );
}

