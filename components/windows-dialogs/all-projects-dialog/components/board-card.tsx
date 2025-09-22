import React from "react";
import { Badge } from "@/components/ui/badge";
import { Board } from "@/types";
import { TbListDetails } from "react-icons/tb";

interface BoardCardProps {
  board: Board & { projectName: string; projectId: string };
}

export function BoardCard({ board }: BoardCardProps) {
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
