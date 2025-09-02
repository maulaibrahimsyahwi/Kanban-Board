import React from "react";
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
import { AlertTriangle } from "lucide-react";
import { useProjects } from "@/contexts/projectContext";

interface DeleteProjectAlertProps {
  deleteProjectId: string | null;
  deleteAllConfirmOpen: boolean;
  isDeleting: boolean;
  onCloseDeleteProject: () => void;
  onCloseDeleteAll: () => void;
  onDeleteProject: (projectId: string) => void;
  onDeleteAllProjects: () => void;
}

export function DeleteProjectAlert({
  deleteProjectId,
  deleteAllConfirmOpen,
  isDeleting,
  onCloseDeleteProject,
  onCloseDeleteAll,
  onDeleteProject,
  onDeleteAllProjects,
}: DeleteProjectAlertProps) {
  const { projects } = useProjects();

  return (
    <>
      {/* Delete Single Project Alert */}
      <AlertDialog open={!!deleteProjectId} onOpenChange={onCloseDeleteProject}>
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
                deleteProjectId && onDeleteProject(deleteProjectId)
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
      <AlertDialog open={deleteAllConfirmOpen} onOpenChange={onCloseDeleteAll}>
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
              onClick={onDeleteAllProjects}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete All Projects"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
