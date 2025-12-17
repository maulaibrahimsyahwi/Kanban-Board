"use client";

import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  color: string;
  setColor: (value: string) => void;
  colors: readonly string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ColorPicker({
  color,
  setColor,
  colors,
  isOpen,
  onOpenChange,
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-muted-foreground">Color</Label>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full h-[42px] px-2 flex items-center justify-between bg-background"
          >
            <div className={cn("w-8 h-6 rounded-sm", color)} />
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-4" align="end">
          <div className="grid grid-cols-6 gap-3">
            {colors.map((c) => (
              <div
                key={c}
                className={cn(
                  "w-10 h-10 rounded-lg cursor-pointer flex items-center justify-center transition-transform hover:scale-110",
                  c
                )}
                onClick={() => {
                  setColor(c);
                  onOpenChange(false);
                }}
              >
                {color === c ? (
                  <Check className="w-5 h-5 text-white drop-shadow-md" />
                ) : null}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

