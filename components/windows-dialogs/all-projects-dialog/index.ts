// Main component
export { default as AllProjectsDialog } from "./all-projects-dialog";

// Components
export { DialogHeader } from "./components/dialog-header";
export { DialogTabs } from "./components/dialog-tabs";
export { ProjectCard } from "./components/project-card";
export { BoardCard } from "./components/board-card";
export { EmptyState } from "./components/empty-state";
export { DeleteProjectAlert } from "./components/delete-project-alert";
export { EditTaskDialog } from "./components/edit-task-dialog";

// Hooks
export { useAllProjectsDialog } from "./hooks/use-all-projects";
export { useSearchFilter } from "./hooks/use-search-filter";

// Utils
export { getGridClasses, getPriorityColor } from "./utils/grid-utils";
