"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Grid3X3 } from "lucide-react";

import { DialogHeader } from "./components/dialog-header";
import { DialogTabs } from "./components/dialog-tabs";
import { DeleteProjectAlert } from "./components/delete-project-alert";
import { EditTaskDialog } from "./components/edit-task-dialog";
import { useAllProjectsDialog } from "./hooks/use-all-projects";

interface AllProjectsDialogProps {
  trigger?: React.ReactNode;
}

export default function AllProjectsDialog({ trigger }: AllProjectsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    // States
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    deleteProjectId,
    setDeleteProjectId,
    deleteAllConfirmOpen,
    setDeleteAllConfirmOpen,
    selectedTaskForEdit,
    setSelectedTaskForEdit,
    isDeleting,

    // Data
    filteredProjects,
    filteredBoards,
    stats,

    // Handlers
    handleSelectProject,
    handleDeleteProject,
    handleDeleteAllProjects,
    handleEditTask,
  } = useAllProjectsDialog({ setIsOpen });

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
          <DialogHeader onDeleteAll={() => setDeleteAllConfirmOpen(true)} />

          <DialogTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            stats={stats}
            filteredProjects={filteredProjects}
            filteredBoards={filteredBoards}
            onSelectProject={handleSelectProject}
            onDeleteProject={setDeleteProjectId}
          />
        </DialogContent>
      </Dialog>

      <DeleteProjectAlert
        deleteProjectId={deleteProjectId}
        deleteAllConfirmOpen={deleteAllConfirmOpen}
        isDeleting={isDeleting}
        onCloseDeleteProject={() => setDeleteProjectId(null)}
        onCloseDeleteAll={() => setDeleteAllConfirmOpen(false)}
        onDeleteProject={handleDeleteProject}
        onDeleteAllProjects={handleDeleteAllProjects}
      />

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
