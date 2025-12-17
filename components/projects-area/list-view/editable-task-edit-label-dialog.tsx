"use client";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type EditableTaskEditLabelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelName: string;
  setLabelName: (value: string) => void;
  labelColor: string;
  setLabelColor: (value: string) => void;
  onSave: () => void;
};

export function EditableTaskEditLabelDialog({
  open,
  onOpenChange,
  labelName,
  setLabelName,
  labelColor,
  setLabelColor,
  onSave,
}: EditableTaskEditLabelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" /> Edit Label
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label-name">Nama Label</Label>
            <Input
              id="label-name"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
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
                    labelColor === color.class
                      ? "border-primary ring-2 ring-primary"
                      : "border-border"
                  )}
                  onClick={() => setLabelColor(color.class)}
                >
                  <div className={cn("w-6 h-6 rounded-full", color.class)} />
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" onClick={onSave}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

