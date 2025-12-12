import { useMemo } from "react";
import { Project } from "@/types";

interface UseSearchFilterProps {
  projects: Project[];
  searchQuery: string;
}

export function useSearchFilter({
  projects,
  searchQuery,
}: UseSearchFilterProps) {
  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.boards.some((board) =>
            board.tasks.some(
              (task) =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.description || "")
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            )
          )
      ),
    [projects, searchQuery]
  );

  const allBoards = useMemo(
    () =>
      projects.flatMap((project) =>
        project.boards.map((board) => ({
          ...board,
          projectName: project.name,
          projectId: project.id,
        }))
      ),
    [projects]
  );

  const allTasks = useMemo(
    () =>
      projects.flatMap((project) =>
        project.boards.flatMap((board) =>
          board.tasks.map((task) => ({
            ...task,
            boardName: board.name,
            projectName: project.name,
            boardId: board.id,
          }))
        )
      ),
    [projects]
  );

  const filteredBoards = useMemo(
    () =>
      allBoards.filter(
        (board) =>
          board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          board.projectName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allBoards, searchQuery]
  );

  return {
    filteredProjects,
    filteredBoards,
    allBoards,
    allTasks,
  };
}
