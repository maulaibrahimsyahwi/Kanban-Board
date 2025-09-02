// components/windows-dialogs/all-projects-dialog/all-projects-dialog.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FolderOpen,
  Search,
  MoreVertical,
  Trash2,
  AlertTriangle,
  Grid3X3,
  CheckCircle2,
  Plus,
  Folder,
  LayoutGrid,
} from "lucide-react";
import { useProjects } from "@/contexts/projectContext";
import { Project, Task, Board } from "@/contexts/projectContext";
import { formatDateSafely } from "@/lib/utils";
import { toast } from "sonner";
import { TbListDetails } from "react-icons/tb";
import ProjectDialog from "@/components/windows-dialogs/project-dialog/project-dialog";

interface AllProjectsDialogProps {
  trigger?: React.ReactNode;
}

export default function AllProjectsDialog({ trigger }: AllProjectsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<{
    task: Task;
    boardId: string;
    boardName: string;
    projectName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");

  const { projects, selectedProject, selectProject, deleteProject, editTask } =
    useProjects();

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.boards.some((board) =>
        board.tasks.some(
          (task) =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
  );

  const allBoards = projects.flatMap((project) =>
    project.boards.map((board) => ({
      ...board,
      projectName: project.name,
      projectId: project.id,
    }))
  );

  const allTasks = projects.flatMap((project) =>
    project.boards.flatMap((board) =>
      board.tasks.map((task) => ({
        ...task,
        boardName: board.name,
        projectName: project.name,
        boardId: board.id,
      }))
    )
  );

  const filteredBoards = allBoards.filter(
    (board) =>
      board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProject = (project: Project) => {
    selectProject(project.id);
    setIsOpen(false);
    toast.success("Project selected", {
      description: `Switched to "${project.name}" project.`,
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      deleteProject(projectId);
      setDeleteProjectId(null);
      toast.success("Project deleted", {
        description: "Project has been permanently deleted.",
      });
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllProjects = async () => {
    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      projects.forEach((project) => deleteProject(project.id));
      setDeleteAllConfirmOpen(false);
      setIsOpen(false);
      toast.success("All projects deleted", {
        description: "All projects have been permanently deleted.",
      });
    } catch {
      toast.error("Failed to delete all projects");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTask = (
    task: Task,
    updatedData: Partial<Task>,
    boardId: string
  ) => {
    editTask(task.id, boardId, updatedData);
    setSelectedTaskForEdit(null);
    toast.success("Task updated", {
      description: `"${task.title}" has been updated.`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-600 dark:text-red-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
      case "low":
        return "bg-green-500/20 text-green-600 dark:text-green-400";
      default:
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  const getTotalStats = () => {
    const totalProjects = projects.length;
    const totalTasks = allTasks.length;
    const totalBoards = allBoards.length;
    return { totalProjects, totalTasks, totalBoards };
  };

  const stats = getTotalStats();

  const getGridClasses = (itemCount: number) => {
    if (itemCount === 0) return "grid-cols-1";
    return "grid-cols-1 md:grid-cols-2";
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">All Projects</span>
              <span className="sm:hidden">Projects</span>
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-7xl w-[95vw] h-[85vh] sm:h-[90vh] flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="pb-3 pt-4 px-4 sm:px-6 border-b flex-shrink-0">
            <div className="flex flex-col gap-3">
              {/* Title Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 sm:size-10 bg-primary/10 rounded-lg flex justify-center items-center">
                    <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg sm:text-xl text-foreground">
                      All Projects
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Manage your workspace
                    </DialogDescription>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2">
                <ProjectDialog
                  trigger={
                    <Button
                      size="sm"
                      className="flex items-center gap-2 flex-1 sm:flex-none"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Project</span>
                    </Button>
                  }
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteAllConfirmOpen(true)}
                  disabled={projects.length === 0}
                  className="flex items-center gap-2 transition-all duration-200 flex-1 sm:flex-none hover:bg-red-600 hover:text-white hover:border-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Tabs Container */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0 px-4 sm:px-6"
          >
            {/* Controls Section */}
            <div className="flex-shrink-0 space-y-4 y-4">
              {/* Tabs Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <TabsList className="bg-muted h-10 w-full sm:w-fit grid grid-cols-2 sm:flex">
                  <TabsTrigger
                    value="projects"
                    className="flex items-center gap-2 px-3 text-sm cursor-pointer"
                  >
                    <Folder className="w-4 h-4" />
                    <span>Projects</span>
                    <Badge
                      variant="secondary"
                      className="ml-1 text-xs h-5 px-2"
                    >
                      {stats.totalProjects}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="boards"
                    className="flex items-center gap-2 px-3 text-sm cursor-pointer"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Boards</span>
                    <Badge
                      variant="secondary"
                      className="ml-1 text-xs h-5 px-2"
                    >
                      {stats.totalBoards}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects, boards, or tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 pb-4">
              {/* Projects Tab */}
              <TabsContent value="projects" className="mt-0 h-full">
                <div
                  className={`grid ${getGridClasses(
                    filteredProjects.length
                  )} gap-4 overflow-y-auto h-full content-start`}
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgb(203 213 225) transparent",
                  }}
                >
                  {filteredProjects.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center h-full min-h-[300px]">
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <Folder className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-medium mb-2">
                          {searchQuery
                            ? "No projects found"
                            : "No projects available"}
                        </p>
                        <p className="text-sm">
                          {searchQuery
                            ? "Try adjusting your search terms"
                            : "Create your first project to get started"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isSelected={selectedProject?.id === project.id}
                        onSelect={() => handleSelectProject(project)}
                        onDelete={() => setDeleteProjectId(project.id)}
                        getPriorityColor={getPriorityColor}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Boards Tab */}
              <TabsContent value="boards" className="mt-0 h-full">
                <div
                  className={`grid ${getGridClasses(
                    filteredBoards.length
                  )} gap-4 overflow-y-auto h-full content-start`}
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgb(203 213 225) transparent",
                  }}
                >
                  {filteredBoards.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center h-full min-h-[300px]">
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <LayoutGrid className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-medium mb-2">
                          {searchQuery
                            ? "No boards found"
                            : "No boards available"}
                        </p>
                        <p className="text-sm">
                          {searchQuery
                            ? "Try adjusting your search terms"
                            : "Boards will appear here when you create projects"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    filteredBoards.map((board) => (
                      <BoardCard
                        key={`${board.projectId}-${board.id}`}
                        board={board}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Single Project Alert */}
      <AlertDialog
        open={!!deleteProjectId}
        onOpenChange={() => setDeleteProjectId(null)}
      >
        <AlertDialogContent className="w-[90vw] max-w-md mx-auto">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <AlertDialogTitle className="text-left text-base sm:text-lg">
                  Delete Project?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left text-sm">
                  This will permanently delete the project and all its data.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-3 cursor-pointer">
            <AlertDialogCancel
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteProjectId && handleDeleteProject(deleteProjectId)
              }
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Projects Alert */}
      <AlertDialog
        open={deleteAllConfirmOpen}
        onOpenChange={setDeleteAllConfirmOpen}
      >
        <AlertDialogContent className="w-[90vw] max-w-md mx-auto">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <AlertDialogTitle className="text-left text-base sm:text-lg">
                  Delete All Projects?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left text-sm">
                  This will permanently delete all {projects.length} projects
                  and their data. This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <AlertDialogCancel
              disabled={isDeleting}
              className="w-full sm:w-auto cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllProjects}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete All Projects"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedTaskForEdit && (
        <EditTaskDialog
          task={selectedTaskForEdit.task}
          boardId={selectedTaskForEdit.boardId}
          boardName={selectedTaskForEdit.boardName}
          projectName={selectedTaskForEdit.projectName}
          onSave={handleEditTask}
          onClose={() => setSelectedTaskForEdit(null)}
        />
      )}
    </>
  );
}

// Project Card Component
interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  getPriorityColor: (priority: string) => string;
}

function ProjectCard({
  project,
  isSelected,
  onSelect,
  onDelete,
}: ProjectCardProps) {
  const IconComponent = project.icon;
  const allTasks = project.boards.flatMap((board) => board.tasks);
  const totalTasks = allTasks.length;

  return (
    <div
      className={`border rounded-xl transition-all duration-200 cursor-pointer hover:shadow-lg bg-card w-full min-h-[180x] flex flex-col ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "border-border hover:border-primary/30"
      }`}
      onClick={onSelect}
    >
      {/* Header Section */}
      <div className="p-4 lg:p-5 border-b border-border/50 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="size-12 lg:size-14 bg-primary rounded-xl flex items-center justify-center text-primary-foreground flex-shrink-0">
              <IconComponent className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground text-lg lg:text-xl truncate leading-tight">
                  {project.name}
                </h3>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">
                  {formatDateSafely(project.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 flex-shrink-0 hover:bg-muted"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex items-center gap-2 text-red-600 cursor-pointer text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-4 lg:px-5 py-4 lg:py-5">
        <div className="flex items-center justify-between text-sm lg:text-base">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="font-medium">{project.boards.length} boards</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span className="font-medium">{totalTasks} tasks</span>
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {project.id.slice(-6).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Board Card Component
interface BoardCardProps {
  board: Board & { projectName: string; projectId: string };
}

function BoardCard({ board }: BoardCardProps) {
  return (
    <div className="border rounded-xl p-4 lg:p-5 bg-card hover:shadow-md transition-all duration-200 w-full min-h-[250px] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base lg:text-lg truncate">
            {board.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate mt-1">
            From: {board.projectName}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="text-xs ml-3 flex-shrink-0 h-6 px-2"
        >
          {board.tasks.length} tasks
        </Badge>
      </div>

      {/* Tasks Preview */}
      <div className="flex-1 flex flex-col min-h-0">
        {board.tasks.length > 0 ? (
          <div className="flex-1 space-y-2 overflow-y-auto">
            {board.tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="text-sm p-3 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate flex-1 font-medium">
                    {task.title}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 h-5 flex-shrink-0"
                  >
                    {task.priority}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
            ))}
            {board.tasks.length > 3 && (
              <div className="text-xs text-muted-foreground text-center py-2 border-t border-border/30">
                +{board.tasks.length - 3} more tasks
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <TbListDetails className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No tasks</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-border flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Board ID: {board.id.slice(-6)}</span>
          <span className="hidden sm:inline">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// Edit Task Dialog Component
interface EditTaskDialogProps {
  task: Task;
  boardId: string;
  boardName: string;
  projectName: string;
  onSave: (task: Task, updatedData: Partial<Task>, boardId: string) => void;
  onClose: () => void;
}

function EditTaskDialog({
  task,
  boardId,
  boardName,
  projectName,
  onSave,
  onClose,
}: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Task["priority"]>(task.priority);

  const handleSave = () => {
    const updatedData: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      priority,
    };

    onSave(task, updatedData, boardId);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Editing task in &quot;{boardName}&quot; board of &quot;{projectName}
            &quot; project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              className="w-full min-h-[100px] px-3 py-2 text-sm bg-background border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Priority</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: "low", label: "Low Priority" },
                { value: "medium", label: "Medium Priority" },
                { value: "high", label: "High Priority" },
              ].map((option) => {
                const isSelected = priority === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setPriority(option.value as Task["priority"])
                    }
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium capitalize">
                        {option.value} Priority
                      </span>
                      {isSelected && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
