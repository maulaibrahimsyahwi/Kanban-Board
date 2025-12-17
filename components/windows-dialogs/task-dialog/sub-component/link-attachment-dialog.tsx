"use client";

import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Attachment } from "@/types";

type LinkAttachmentDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  linkUrl: string;
  setLinkUrl: (value: string) => void;
  linkText: string;
  setLinkText: (value: string) => void;
  attachments: Attachment[];
  setAttachments: (value: Attachment[]) => void;
};

export default function LinkAttachmentDialog({
  isOpen,
  onOpenChange,
  linkUrl,
  setLinkUrl,
  linkText,
  setLinkText,
  attachments,
  setAttachments,
}: LinkAttachmentDialogProps) {
  const handleAddLink = () => {
    if (!linkUrl.trim()) {
      toast.error("URL tidak boleh kosong");
      return;
    }

    try {
      new URL(linkUrl);
    } catch {
      toast.error("URL tidak valid. Gunakan http:// atau https://");
      return;
    }

    const newAttachment: Attachment = {
      id: uuidv4(),
      name: linkText.trim() || linkUrl,
      url: linkUrl,
      type: "link",
    };

    setAttachments([...attachments, newAttachment]);
    onOpenChange(false);
    setLinkUrl("");
    setLinkText("");
    toast.success("Link dilampirkan");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Attach a Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link-text">Text to display (Optional)</Label>
              <Input
                id="link-text"
                placeholder="Example Website"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink} disabled={!linkUrl.trim()}>
              Attach
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

