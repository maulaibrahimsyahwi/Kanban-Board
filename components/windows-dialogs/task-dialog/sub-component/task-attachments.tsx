"use client";

import {
  Download,
  FileIcon,
  Globe,
  Link as LinkIcon,
  Loader2,
  Monitor,
  Paperclip,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Attachment } from "@/types";

type TaskAttachmentsMenuProps = {
  attachments: Attachment[];
  setAttachments: (value: Attachment[]) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  onOpenLinkDialog: () => void;
};

export default function TaskAttachmentsMenu({
  attachments,
  setAttachments,
  isUploading,
  setIsUploading,
  onOpenLinkDialog,
}: TaskAttachmentsMenuProps) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const MAX_SIZE = 2 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      toast.error("File terlalu besar (Max 2MB)");
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipe file tidak didukung");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Mengunggah file...");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("attachments").getPublicUrl(filePath);

      const newAttachment: Attachment = {
        id: uuidv4(),
        name: file.name,
        url: data.publicUrl,
        type: file.type,
      };

      setAttachments([...attachments, newAttachment]);
      toast.success("File berhasil diunggah", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah file", { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isUploading}
            className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 h-8 gap-2 px-2 font-medium transition-colors"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
            <span>Attach files</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem
            onClick={onOpenLinkDialog}
            className="cursor-pointer gap-2"
          >
            <LinkIcon className="w-4 h-4" />
            <span>Paste a link...</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => document.getElementById("task-file-upload")?.click()}
            className="cursor-pointer gap-2"
          >
            <Monitor className="w-4 h-4" />
            <span>Upload from computer</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        id="task-file-upload"
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,application/pdf,text/plain"
      />
    </>
  );
}

type TaskAttachmentsListProps = {
  attachments: Attachment[];
  setAttachments: (value: Attachment[]) => void;
};

export function TaskAttachmentsList({
  attachments,
  setAttachments,
}: TaskAttachmentsListProps) {
  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  if (attachments.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2">
        {attachments.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                {file.type === "link" ? (
                  <Globe className="w-4 h-4 text-primary" />
                ) : (
                  <FileIcon className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{file.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase truncate max-w-[200px]">
                  {file.type === "link"
                    ? file.url
                    : file.type.split("/")[1] || "FILE"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                download={file.type !== "link" ? file.name : undefined}
                className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground"
                title={file.type === "link" ? "Open Link" : "Download"}
              >
                {file.type === "link" ? (
                  <LinkIcon className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </a>
              <button
                onClick={() => removeAttachment(file.id)}
                className="p-1.5 hover:bg-red-100 text-muted-foreground hover:text-red-600 rounded-md transition-colors"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
