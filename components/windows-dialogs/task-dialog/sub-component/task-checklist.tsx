"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChecklistItem as ChecklistItemType } from "@/types";
import { Trash2, GripVertical } from "lucide-react";
import { FaRegCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";

interface TaskChecklistProps {
  items: ChecklistItemType[];
  onChange: (newItems: ChecklistItemType[]) => void;
  actionSlot?: React.ReactNode;
}

const MAX_CHECKLIST_ITEMS = 20;

export function TaskChecklist({
  items,
  onChange,
  actionSlot,
}: TaskChecklistProps) {
  const [newItemText, setNewItemText] = useState("");
  const completedCount = items.filter((item) => item.isDone).length;
  const totalCount = items.length;
  const isAtLimit = totalCount >= MAX_CHECKLIST_ITEMS;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddItem = () => {
    if (newItemText.trim() === "" || isAtLimit) return;
    const newItem: ChecklistItemType = {
      id: uuidv4(),
      text: newItemText.trim(),
      isDone: false,
    };
    onChange([...items, newItem]);
    setNewItemText("");
  };

  const handleToggleItem = (id: string) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, isDone: !item.isDone } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleItemTextChange = (id: string, newText: string) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, text: newText } : item))
    );
  };

  const handleReorder = (startIndex: number, destinationIndex: number) => {
    const reorderedItems = Array.from(items);
    const [movedItem] = reorderedItems.splice(startIndex, 1);
    reorderedItems.splice(destinationIndex, 0, movedItem);
    onChange(reorderedItems);
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">
          Daftar Periksa {completedCount} / {totalCount}
        </Label>

        {totalCount > 0 ? (
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden mx-4">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                progressPercentage === 100 ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        ) : (
          <div className="flex-1 mx-4"></div>
        )}

        {totalCount > 0 && actionSlot}
      </div>

      <div className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <ChecklistItem
            key={item.id}
            item={item}
            index={index}
            onToggle={handleToggleItem}
            onDelete={handleDeleteItem}
            onChangeText={handleItemTextChange}
            onReorder={handleReorder}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Input
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          className="h-9 text-sm flex-1"
          placeholder={isAtLimit ? "Maksimal 20 item" : "Tambahkan item..."}
          disabled={isAtLimit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddItem();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9"
          onClick={handleAddItem}
          disabled={newItemText.trim() === "" || isAtLimit}
        >
          Tambah
        </Button>
      </div>
      {isAtLimit && (
        <p className="text-xs text-muted-foreground text-right">
          Batas daftar periksa tercapai
        </p>
      )}
    </div>
  );
}

const ChecklistItem = memo(
  ({
    item,
    index,
    onToggle,
    onDelete,
    onChangeText,
    onReorder,
  }: {
    item: ChecklistItemType;
    index: number;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onChangeText: (id: string, text: string) => void;
    onReorder: (startIndex: number, destinationIndex: number) => void;
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

    useEffect(() => {
      const element = ref.current;
      if (!element) return;

      return combine(
        draggable({
          element,
          getInitialData: () => ({
            type: "checklist-item",
            index,
            id: item.id,
          }),
          onDragStart: () => setIsDragging(true),
          onDrop: () => setIsDragging(false),
        }),
        dropTargetForElements({
          element,
          canDrop: ({ source }) =>
            source.data.type === "checklist-item" && source.data.id !== item.id,
          getData: ({ input, element }) => {
            const data = { id: item.id, index };
            return attachClosestEdge(data, {
              input,
              element,
              allowedEdges: ["top", "bottom"],
            });
          },
          onDragEnter: ({ self }) =>
            setClosestEdge(self.data.closestEdge as Edge),
          onDragLeave: () => setClosestEdge(null),
          onDrop: ({ source, self }) => {
            const startIndex = source.data.index as number;
            const destinationIndex = getReorderDestinationIndex({
              startIndex,
              indexOfTarget: index,
              closestEdgeOfTarget: self.data.closestEdge as Edge,
              axis: "vertical",
            });
            onReorder(startIndex, destinationIndex);
            setClosestEdge(null);
          },
        })
      );
    }, [item.id, index, onReorder]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 group relative",
          isDragging && "opacity-50",
          closestEdge === "top" &&
            "before:content-[''] before:absolute before:-top-1 before:left-0 before:right-0 before:h-0.5 before:bg-primary",
          closestEdge === "bottom" &&
            "after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
        )}
      >
        <button
          type="button"
          className="cursor-grab opacity-50 group-hover:opacity-100"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 text-muted-foreground hover:text-primary",
            item.isDone && "text-primary"
          )}
          onClick={() => onToggle(item.id)}
        >
          {item.isDone ? (
            <FaCircleCheck className="w-4 h-4" />
          ) : (
            <FaRegCircle className="w-4 h-4" />
          )}
        </Button>
        <Input
          value={item.text}
          onChange={(e) => onChangeText(item.id, e.target.value)}
          className={cn(
            "h-9 text-sm flex-1",
            item.isDone && "line-through text-muted-foreground"
          )}
          placeholder="Isi item..."
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 opacity-50 group-hover:opacity-100"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }
);

ChecklistItem.displayName = "ChecklistItem";
