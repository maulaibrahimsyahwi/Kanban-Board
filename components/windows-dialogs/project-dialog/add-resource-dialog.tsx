"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, User } from "lucide-react";
import { toast } from "sonner";

interface AddResourceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = [
  { name: "Slate", value: "bg-slate-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Blue", value: "bg-blue-500" },
];

export default function AddResourceDialog({
  isOpen,
  onOpenChange,
}: AddResourceDialogProps) {
  const [resourceName, setResourceName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);

  const handleAdd = () => {
    toast.success("Resource added successfully");
    setResourceName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Adding resources
            </DialogTitle>
          </DialogHeader>
        </div>

        <Tabs defaultValue="team" className="w-full">
          <div className="px-6 border-b border-border">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6">
              <TabsTrigger
                value="team"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary shadow-none"
              >
                Choose from the team
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary shadow-none"
              >
                Create new
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="team" className="p-6 pt-4 min-h-[300px] relative">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name"
                className="pl-9 bg-transparent border-t-0 border-x-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
              />
            </div>

            <div className="flex flex-col items-center justify-center text-center mt-10 space-y-4">
              <div className="flex -space-x-4 items-end justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-4 border-background z-10">
                  <User className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-4 border-background z-20 -mb-2">
                  <User className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-4 border-background z-10">
                  <User className="w-6 h-6 text-muted-foreground/50" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground max-w-[280px]">
                No members to add from the team as all team members are already
                in the project.
              </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card flex justify-end gap-3">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button disabled className="bg-blue-300 text-white">
                Add
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="create"
            className="p-6 pt-4 min-h-[300px] relative"
          >
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-bold text-muted-foreground">
                  Resource name
                </label>
                <Input
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  placeholder="Enter the name"
                />
              </div>
              <div className="w-24 space-y-2">
                <label className="text-sm font-bold text-muted-foreground">
                  Color
                </label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue>
                      <div
                        className={`w-6 h-6 rounded-sm ${selectedColor}`}
                      ></div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-sm ${color.value}`}
                          ></div>
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card flex justify-end gap-3">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-400 hover:bg-blue-500 text-white min-w-[80px]"
                onClick={handleAdd}
                disabled={!resourceName}
              >
                Add
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
