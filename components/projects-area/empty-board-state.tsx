// components/projects-area/empty-boards-state.tsx
import { Card } from "@/components/ui/card";
import { Layers, Plus } from "lucide-react";
import AddBoardDialog from "../add-board-dialog";

export default function EmptyBoardsState() {
  return (
    <Card className="shadow-none p-12 rounded-3xl flex flex-col items-center justify-center min-h-[400px] border-dashed border-2">
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <Layers className="w-8 h-8 text-muted-foreground" />
        </div>

        {/* Text */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No boards yet
          </h3>
          <p className="text-muted-foreground max-w-md">
            Organize your project by creating boards. Each board can contain
            different types of tasks.
          </p>
        </div>

        {/* CTA Button */}
        <AddBoardDialog
          trigger={
            <div className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg cursor-pointer transition-colors">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create your first board</span>
            </div>
          }
        />

        {/* Suggestions */}
        <div className="pt-4">
          <p className="text-sm text-muted-foreground mb-3">
            Popular board names:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "To Do",
              "In Progress",
              "Review",
              "Done",
              "Testing",
              "Backlog",
            ].map((name) => (
              <AddBoardDialog
                key={name}
                trigger={
                  <span className="px-3 py-1 bg-muted hover:bg-muted/80 text-muted-foreground text-xs rounded-full cursor-pointer transition-colors">
                    + {name}
                  </span>
                }
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
