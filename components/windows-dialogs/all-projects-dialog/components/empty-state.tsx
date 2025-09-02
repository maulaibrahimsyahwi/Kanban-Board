import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  type: "projects" | "boards";
  hasSearch: boolean;
  icon: LucideIcon;
}

export function EmptyState({ type, hasSearch, icon: Icon }: EmptyStateProps) {
  const getEmptyStateContent = () => {
    const baseContent = {
      projects: {
        title: hasSearch ? "No projects found" : "No projects available",
        description: hasSearch
          ? "Try adjusting your search terms"
          : "Create your first project to get started",
      },
      boards: {
        title: hasSearch ? "No boards found" : "No boards available",
        description: hasSearch
          ? "Try adjusting your search terms"
          : "Boards will appear here when you create projects",
      },
    };

    return baseContent[type];
  };

  const content = getEmptyStateContent();

  return (
    <div className="col-span-full flex items-center justify-center h-full min-h-[300px]">
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8" />
        </div>
        <p className="text-lg font-medium mb-2">{content.title}</p>
        <p className="text-sm">{content.description}</p>
      </div>
    </div>
  );
}
