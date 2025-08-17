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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  FolderOpen,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Grid3X3,
  CheckCircle2,
} from "lucide-react";
import { useProjects } from "@/contexts/projectContext";
import { Project, Task } from "@/contexts/projectContext";
import { formatDateSafely } from "@/lib/utils";
import { toast } from "sonner";

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

  const { projects, selectedProject, selectProject, deleteProject, editTask } =
    useProjects();

  // Filter projects based on search query
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

  const handleSelectProject = (project: Project) => {
    selectProject(project.id);
    setIsOpen(false);
    toast.success("Project selected", {
      description: `Switched to &quot;${project.name}&quot; project.`,
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
      description: `&quot;${task.title}&quot; has been updated.`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getTotalStats = () => {
    const totalProjects = projects.length;
    const totalTasks = projects.reduce(
      (acc, project) =>
        acc +
        project.boards.reduce(
          (boardAcc, board) => boardAcc + board.tasks.length,
          0
        ),
      0
    );
    const totalBoards = projects.reduce(
      (acc, project) => acc + project.boards.length,
      0
    );

    return { totalProjects, totalTasks, totalBoards };
  };

  const stats = getTotalStats();

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
              <Grid3X3 className="w-4 h-4 cursor-pointer" />
              All Projects
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col poppins">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary/10 rounded-full flex justify-center items-center">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-left text-xl ">
                  All Projects
                </DialogTitle>
                <DialogDescription className="text-left">
                  Manage all your projects, boards, and tasks in one place
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.totalProjects}
              </div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.totalBoards}
              </div>
              <div className="text-sm text-muted-foreground">Boards</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.totalTasks}
              </div>
              <div className="text-sm text-muted-foreground">Tasks</div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, boards, or tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteAllConfirmOpen(true)}
              disabled={projects.length === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </Button>
          </div>

          <Separator />

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No projects found matching your search."
                  : "No projects available."}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                  onSelect={() => handleSelectProject(project)}
                  onDelete={() => setDeleteProjectId(project.id)}
                  onEditTask={(task, boardId, boardName) => {
                    setSelectedTaskForEdit({
                      task,
                      boardId,
                      boardName,
                      projectName: project.name,
                    });
                  }}
                  getPriorityColor={getPriorityColor}
                />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation */}
      <AlertDialog
        open={!!deleteProjectId}
        onOpenChange={() => setDeleteProjectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the project and all its data.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteProjectId && handleDeleteProject(deleteProjectId)
              }
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Projects Confirmation */}
      <AlertDialog
        open={deleteAllConfirmOpen}
        onOpenChange={setDeleteAllConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertDialogTitle>Delete All Projects?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {projects.length} projects
                  and their data. This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllProjects}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete All Projects"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Task Dialog */}
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
  onEditTask: (task: Task, boardId: string, boardName: string) => void;
  getPriorityColor: (priority: string) => string;
}

function ProjectCard({
  project,
  isSelected,
  onSelect,
  onDelete,
  onEditTask,
  getPriorityColor,
}: ProjectCardProps) {
  const IconComponent = project.icon;
  const totalTasks = project.boards.reduce(
    (acc, board) => acc + board.tasks.length,
    0
  );

  return (
    <div
      className={`border rounded-lg p-4 ${
        isSelected ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      {/* Project Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
            <IconComponent />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{project.name}</h3>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {project.boards.length} boards • {totalTasks} tasks • Created{" "}
              {formatDateSafely(project.createdAt)}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onSelect}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {isSelected ? "Current Project" : "Switch to Project"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Boards */}
      <div className="space-y-3">
        {project.boards.map((board) => (
          <div key={board.id} className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{board.name}</span>
              <Badge variant="secondary" className="text-xs">
                {board.tasks.length} tasks
              </Badge>
            </div>

            {/* Tasks */}
            {board.tasks.length > 0 && (
              <div className="space-y-2">
                {board.tasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between bg-background rounded p-2 text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                      <span className="truncate">{task.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditTask(task, board.id, board.name)}
                      className="flex-shrink-0 ml-2"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {board.tasks.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    +{board.tasks.length - 3} more tasks
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>