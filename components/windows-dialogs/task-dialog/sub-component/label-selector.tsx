"use client";

import React, { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Task } from "@/types";
import { DEFAULT_LABELS, TaskLabel } from "@/constants";
import { Tag, X, Pencil } from "lucide-react";
import { IoCheckmark } from "react-icons/io5";
import { cn } from "@/lib/utils";

const COLOR_PALETTE: { name: string; class: string }[] = [
  { name: "Pink", class: "bg-pink-600 text-white" },
  { name: "Merah", class: "bg-red-600 text-white" },
  { name: "Perunggu", class: "bg-orange-600 text-white" },
  { name: "Kuning", class: "bg-yellow-500 text-black" },
  { name: "Lemon", class: "bg-lime-500 text-black" },
  { name: "Hijau", class: "bg-green-600 text-white" },
  { name: "Biru Laut", class: "bg-cyan-600 text-white" },
  { name: "Biru", class: "bg-blue-600 text-white" },
  { name: "Ungu", class: "bg-purple-600 text-white" },
  { name: "Abu-abu", class: "bg-gray-500 text-white" },
];

interface LabelSelectorProps {
  selectedLabels: Task["labels"];
  onLabelsChange: (labels: Task["labels"]) => void;
}

export default function LabelSelector({
  selectedLabels,
  onLabelsChange,
}: LabelSelectorProps) {
  const [allLabels, setAllLabels] = useState<TaskLabel[]>(DEFAULT_LABELS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<TaskLabel | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableLabels = useMemo(() => {
    return allLabels
      .filter(
        (label) =>
          !selectedLabels.some((selected) => selected.name === label.name) &&
          label.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 10);
  }, [allLabels, selectedLabels, searchQuery]);

  const handleToggleLabel = (label: TaskLabel) => {
    const isSelected = selectedLabels.some((l) => l.name === label.name);
    let newLabels;
    if (isSelected) {
      newLabels = selectedLabels.filter((l) => l.name !== label.name);
    } else {
      newLabels = [...selectedLabels, { name: label.name, color: label.color }];
    }
    onLabelsChange(newLabels);
    setSearchQuery("");
  };

  const removeLabel = (e: React.MouseEvent, labelName: string) => {
    e.preventDefault();
    e.stopPropagation();
    onLabelsChange(selectedLabels.filter((l) => l.name !== labelName));
    setIsDropdownOpen(false);
  };

  const openEditDialog = (e: React.MouseEvent, label: TaskLabel) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentLabel(label);
    setEditName(label.name);
    setEditColor(label.color);
    setIsEditing(true);
    setIsDropdownOpen(false);
  };

  const handleSaveEdit = () => {
    if (!currentLabel) return;

    const updatedLabels = allLabels.map((label) =>
      label.id === currentLabel.id
        ? { ...label, name: editName, color: editColor }
        : label
    );
    setAllLabels(updatedLabels);

    const updatedSelectedLabels = selectedLabels.map((label) =>
      label.name === currentLabel.name
        ? { name: editName, color: editColor }
        : label
    );
    onLabelsChange(updatedSelectedLabels);

    setIsEditing(false);
    setCurrentLabel(null);
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Label</Label>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "flex items-center flex-wrap gap-1.5 w-full min-h-[44px] p-2 border border-input bg-background rounded-md cursor-text",
                isDropdownOpen && "ring-2 ring-primary/20 border-primary"
              )}
            >
              {selectedLabels.map((label) => (
                <div
                  key={label.name}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium",
                    label.color
                  )}
                >
                  <span>{label.name}</span>
                  <button
                    type="button"
                    onMouseDown={(e) => removeLabel(e, label.name)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="opacity-70 hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isDropdownOpen) {
                    setIsDropdownOpen(true);
                  }
                }}
                placeholder={
                  selectedLabels.length === 0 ? "Pilih label..." : ""
                }
                className="flex-1 bg-transparent outline-none text-sm min-w-[120px]"
                onFocus={() => setIsDropdownOpen(true)}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] poppins"
          >
            {availableLabels.length === 0 && searchQuery && (
              <DropdownMenuItem disabled>
                Tidak ada label ditemukan...
              </DropdownMenuItem>
            )}
            {availableLabels.length === 0 && !searchQuery && (
              <DropdownMenuItem disabled>
                Semua label telah dipilih.
              </DropdownMenuItem>
            )}
            {availableLabels.map((label) => (
              <div
                key={label.id}
                className="flex items-center justify-between group pr-2"
              >
                <DropdownMenuItem
                  className="flex-1 cursor-pointer"
                  onClick={() => handleToggleLabel(label)}
                  onSelect={(e) => e.preventDefault()}
                >
                  <div
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      label.color
                    )}
                  >
                    {label.name}
                  </div>
                </DropdownMenuItem>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => openEditDialog(e, label)}
                >
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label-name">Nama Label</Label>
              <Input
                id="label-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_PALETTE.map((color) => (
                  <Button
                    key={color.name}
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-12 w-full border-2",
                      editColor === color.class
                        ? "border-primary ring-2 ring-primary"
                        : "border-border"
                    )}
                    onClick={() => setEditColor(color.class)}
                  >
                    <div
                      className={cn("w-6 h-6 rounded-full", color.class)}
                    ></div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Batal
            </Button>
            <Button type="button" onClick={handleSaveEdit}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
