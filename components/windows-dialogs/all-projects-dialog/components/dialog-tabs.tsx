import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Folder, LayoutGrid } from "lucide-react";
import { Project, Board } from "@/types";
import { ProjectCard } from "./project-card";
import { BoardCard } from "./board-card";
import { EmptyState } from "./empty-state";
import { getGridClasses } from "../utils/grid-utils";

// Tipe untuk nilai tab yang valid
type ActiveTabValue = "projects" | "boards";

interface DialogTabsProps {
  activeTab: string;
  // Perbaikan: Ganti tipe 'string' menjadi tipe yang lebih spesifik
  setActiveTab: (tab: ActiveTabValue) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stats: {
    totalProjects: number;
    totalTasks: number;
    totalBoards: number;
  };
  filteredProjects: Project[];
  filteredBoards: (Board & { projectName: string; projectId: string })[];
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export function DialogTabs({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  stats,
  filteredProjects,
  filteredBoards,
  onSelectProject,
  onDeleteProject,
}: DialogTabsProps) {
  // Pastikan nilai yang diteruskan ke onValueChange sesuai dengan tipe yang diharapkan
  const handleTabChange = (value: string) => {
    if (value === "projects" || value === "boards") {
      setActiveTab(value);
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange} // Gunakan handler yang sudah divalidasi
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
              <Badge variant="secondary" className="ml-1 text-xs h-5 px-2">
                {stats.totalProjects}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="boards"
              className="flex items-center gap-2 px-3 text-sm cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Boards</span>
              <Badge variant="secondary" className="ml-1 text-xs h-5 px-2">
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
              <EmptyState
                type="projects"
                hasSearch={!!searchQuery}
                icon={Folder}
              />
            ) : (
              filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={() => onSelectProject(project)}
                  onDelete={() => onDeleteProject(project.id)}
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
              <EmptyState
                type="boards"
                hasSearch={!!searchQuery}
                icon={LayoutGrid}
              />
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
  );
}
