"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Task, Board, UserProfile, Attachment } from "@/types";
import TaskName from "./sub-component/task-name";
import TaskDescription from "./sub-component/task-description";
import PrioritySelector from "./sub-component/priority-selector";
import LabelSelector from "./sub-component/label-selector";
import { DatePicker } from "../../ui/date-picker";
import { TaskChecklist } from "./sub-component/task-checklist";
import ProgressSelector from "./sub-component/progress-selector";
import {
  Edit,
  User,
  Paperclip,
  FileIcon,
  Download,
  X,
  Link as LinkIcon,
  Monitor,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjects } from "@/contexts/projectContext";

interface EditTaskDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  description: string;
  priority: Task["priority"];
  progress: Task["progress"];
  startDate: Date | null;
  dueDate: Date | null;
  editLabels: Task["labels"];
  editBoardId: string;
  boards: Board[];
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setPriority: (value: Task["priority"]) => void;
  setProgress: (value: Task["progress"]) => void;
  setStartDate: (date: Date | null) => void;
  setDueDate: (date: Date | null) => void;
  setEditLabels: (value: Task["labels"]) => void;
  setEditBoardId: (value: string) => void;
  boardName: string;
  editChecklist: Task["checklist"];
  editCardDisplayPreference: Task["cardDisplayPreference"];
  setEditChecklist: (items: Task["checklist"]) => void;
  setEditCardDisplayPreference: Dispatch<
    SetStateAction<Task["cardDisplayPreference"]>
  >;
  editAssignees: UserProfile[];
  setEditAssignees: (value: UserProfile[]) => void;
  editAttachments: Attachment[];
  setEditAttachments: (value: Attachment[]) => void;
}

export default function EditTaskDialog({
  isOpen,
  isSaving,
  onClose,
  onSave,
  title,
  description,
  priority,
  progress,
  startDate,
  dueDate,
  editLabels,
  editBoardId,
  boards,
  setTitle,
  setDescription,
  setPriority,
  setProgress,
  setStartDate,
  setDueDate,
  setEditLabels,
  setEditBoardId,
  boardName,
  editChecklist,
  editCardDisplayPreference,
  setEditChecklist,
  setEditCardDisplayPreference,
  editAssignees,
  setEditAssignees,
  editAttachments,
  setEditAttachments,
}: EditTaskDialogProps) {
  const { selectedProject } = useProjects();

  // State untuk Dialog Link
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const truncateBoardName = (name: string, maxLength: number = 30) => {
    return name.length <= maxLength ? name : name.slice(0, maxLength) + "...";
  };

  const handleDisplayPreferenceChange = (
    preference: "description" | "checklist"
  ) => {
    setEditCardDisplayPreference((current: Task["cardDisplayPreference"]) =>
      current === preference ? "none" : preference
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onSave();
    }
  };

  const toggleAssignee = (member: UserProfile) => {
    const exists = editAssignees.find((a) => a.email === member.email);
    if (exists) {
      setEditAssignees(editAssignees.filter((a) => a.email !== member.email));
    } else {
      setEditAssignees([...editAssignees, member]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File terlalu besar (Max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newAttachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: e.target?.result as string,
        type: file.type,
      };
      setEditAttachments([...editAttachments, newAttachment]);
      toast.success("File dilampirkan");
    };
    reader.readAsDataURL(file);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) {
      toast.error("URL tidak boleh kosong");
      return;
    }

    const newAttachment: Attachment = {
      id: Math.random().toString(36).substr(2, 9),
      name: linkText.trim() || linkUrl,
      url: linkUrl,
      type: "link", // Tipe khusus untuk link
    };

    setEditAttachments([...editAttachments, newAttachment]);
    setIsLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
    toast.success("Link dilampirkan");
  };

  const removeAttachment = (id: string) => {
    setEditAttachments(editAttachments.filter((a) => a.id !== id));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogPortal>
          <DialogContent
            className={cn(
              "max-w-lg poppins overflow-y-auto max-h-[90vh]",
              "dialog-scrollable-content"
            )}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Task
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Editing task in &quot;{truncateBoardName(boardName)}&quot; board
              </p>
            </DialogHeader>
            <div className="space-y-4 py-4 overflow-hidden">
              <TaskName value={title} onChange={setTitle} onEnter={onSave} />

              {/* --- ACTION BUTTONS (ASSIGNEE & ATTACH) --- */}
              <div className="flex flex-col gap-4 mt-3 mb-2">
                <div className="flex items-center gap-3">
                  {/* ASSIGNEE BUTTON */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 px-3 rounded-md gap-2 transition-all duration-200",
                          "bg-transparent text-muted-foreground", // Default state: transparent & muted text
                          "hover:bg-blue-100 hover:text-blue-700", // Hover state: blue bg & blue text
                          "dark:hover:bg-blue-900/40 dark:hover:text-blue-300" // Dark mode hover
                        )}
                      >
                        <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center opacity-70">
                          <User className="w-3 h-3" />
                        </div>
                        <span>Add assignee</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                      <Command>
                        <CommandList>
                          <CommandGroup heading="Project Members">
                            {selectedProject?.members.map((member) => {
                              const isSelected = editAssignees.some(
                                (a) => a.email === member.email
                              );
                              return (
                                <CommandItem
                                  key={member.email}
                                  onSelect={() => toggleAssignee(member)}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={member.image || ""} />
                                    <AvatarFallback className="text-[10px]">
                                      {member.name?.slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span
                                    className={`text-sm truncate flex-1 ${
                                      isSelected ? "font-bold text-primary" : ""
                                    }`}
                                  >
                                    {member.name}
                                  </span>
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                  )}
                                </CommandItem>
                              );
                            })}
                            {(!selectedProject?.members ||
                              selectedProject.members.length === 0) && (
                              <div className="p-2 text-xs text-muted-foreground text-center">
                                No members found.
                              </div>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* ATTACH FILES DROPDOWN */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 h-8 gap-2 px-2 font-medium transition-colors"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span>Attach files</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem
                        onClick={() => setIsLinkDialogOpen(true)}
                        className="cursor-pointer gap-2"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>Paste a link...</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          document.getElementById("task-file-upload")?.click()
                        }
                        className="cursor-pointer gap-2"
                      >
                        <Monitor className="w-4 h-4" />
                        <span>Upload from computer</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Hidden File Input */}
                  <input
                    id="task-file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* SELECTED ASSIGNEES DISPLAY */}
                {editAssignees.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editAssignees.map((user, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-muted/50 pl-1 pr-2 py-1 rounded-full border text-xs"
                      >
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback className="text-[9px]">
                            {user.name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="max-w-[100px] truncate">
                          {user.name}
                        </span>
                        <button
                          onClick={() => toggleAssignee(user)}
                          className="hover:text-red-500 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ATTACHMENTS LIST */}
                {editAttachments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Attachments
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {editAttachments.map((file) => (
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
                              <span className="text-sm font-medium truncate">
                                {file.name}
                              </span>
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
                              download={
                                file.type !== "link" ? file.name : undefined
                              }
                              className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground"
                              title={
                                file.type === "link" ? "Open Link" : "Download"
                              }
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
                )}
              </div>
              {/* --- END ACTION BUTTONS --- */}

              <TaskDescription
                value={description}
                onChange={setDescription}
                onEnter={onSave}
                actionSlot={
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editDisplayDesc"
                      name="editCardDisplay"
                      checked={editCardDisplayPreference === "description"}
                      onChange={() =>
                        handleDisplayPreferenceChange("description")
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label
                      htmlFor="editDisplayDesc"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Tampilkan pada kartu
                    </Label>
                  </div>
                }
              />

              <TaskChecklist
                items={editChecklist}
                onChange={setEditChecklist}
                actionSlot={
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editDisplayChecklist"
                      name="editCardDisplay"
                      checked={editCardDisplayPreference === "checklist"}
                      onChange={() =>
                        handleDisplayPreferenceChange("checklist")
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label
                      htmlFor="editDisplayChecklist"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Tampilkan pada kartu
                    </Label>
                  </div>
                }
              />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-4">
                  <LabelSelector
                    selectedLabels={editLabels}
                    onLabelsChange={setEditLabels}
                  />
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-board-select"
                      className="text-sm font-medium"
                    >
                      Wadah
                    </Label>
                    <select
                      id="edit-board-select"
                      value={editBoardId}
                      onChange={(e) => setEditBoardId(e.target.value)}
                      className="w-full h-11 border border-input bg-background rounded-md px-3 text-sm"
                    >
                      {boards.map((board) => (
                        <option key={board.id} value={board.id}>
                          {board.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <ProgressSelector
                    selectedProgress={progress}
                    onSelectProgress={setProgress}
                  />
                  <PrioritySelector
                    selectedPriority={priority}
                    onSelectPriority={setPriority}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-start-date"
                    className="text-sm font-medium"
                  >
                    Tanggal mulai
                  </Label>
                  <DatePicker
                    date={startDate}
                    onDateChange={setStartDate}
                    placeholder="Pilih tanggal"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-due-date"
                    className="text-sm font-medium"
                  >
                    Tenggat waktu
                  </Label>
                  <DatePicker
                    date={dueDate}
                    onDateChange={setDueDate}
                    placeholder="Pilih tanggal"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSaving}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={onSave}
                disabled={!title.trim() || title.length < 3 || isSaving}
                className="cursor-pointer min-w-[130px]"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Dialog Khusus untuk Input Link */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
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
              <Button
                variant="secondary"
                onClick={() => setIsLinkDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddLink} disabled={!linkUrl.trim()}>
                Attach
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
