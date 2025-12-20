"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Trash2 } from "lucide-react";
import AddResourceDialog from "@/components/windows-dialogs/project-dialog/add-resource-dialog";
import ConvertResourceDialog from "@/components/windows-dialogs/project-dialog/convert-resource-dialog";
import { UserProfile } from "@/types";
import { toast } from "sonner";
import { useProjects } from "@/contexts/projectContext";
import {
  deleteVirtualResourceAction,
  updateVirtualResourceTypeAction,
} from "@/app/actions/resources";

// Tambahkan prop members
interface VirtualResourcesViewProps {
  members: UserProfile[];
}

export default function VirtualResourcesView({
  members,
}: VirtualResourcesViewProps) {
  const { selectedProject, refreshProjects } = useProjects();
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<UserProfile | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const projectId = selectedProject?.id;
  const resources =
    selectedProject?.members.filter((member) => member.isVirtual) ?? [];
  const filteredResources = resources.filter((res) => {
    const name = res.name?.toLowerCase() || "";
    return name.includes(searchQuery.toLowerCase());
  });

  const handleConvertClick = (res: UserProfile) => {
    setSelectedResource(res);
    setIsConvertOpen(true);
  };

  const handleDelete = async (resourceId: string) => {
    if (!projectId) return;
    const result = await deleteVirtualResourceAction(projectId, resourceId);
    if (result.success) {
      toast.success("Resource deleted");
      refreshProjects();
    } else {
      toast.error(result.message || "Failed to delete resource");
    }
  };

  const handleTypeChange = async (resourceId: string, nextType: string) => {
    if (!projectId) return;
    const result = await updateVirtualResourceTypeAction({
      projectId,
      resourceId,
      type: nextType,
    });
    if (!result.success) {
      toast.error(result.message || "Failed to update resource type");
    } else {
      refreshProjects();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
          Here you manage all virtual resources for your project. They do not work
          on a project directly, but you can assign tasks to them. A 'designer',
          'developer', or 'builder' can be a virtual resource. For example: a
          'truck', 'server', or 'support'. You can create a new resource or choose
          from the team resources list. You can also set costs for them.
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by resource name"
              className="pl-9 border-t-0 border-x-0 border-b rounded-none focus-visible:ring-0 px-0 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="bg-[#0052CC] hover:bg-[#0052CC]/90 text-white gap-2"
            onClick={() => setIsAddResourceOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add resources
          </Button>
        </div>

        <div className="border rounded-md bg-card">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 border-b text-xs font-semibold text-muted-foreground">
            <div className="col-span-6 flex items-center gap-3">
              <Checkbox />
              <span>Resource</span>
            </div>
            <div className="col-span-6">Type</div>
          </div>

          <div className="divide-y">
            {filteredResources.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                No virtual resources yet.
              </div>
            ) : (
              filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/10 group min-h-[60px]"
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <Checkbox />
                    <div
                      className={`w-8 h-8 rounded-full ${
                        res.resourceColor || "bg-slate-500"
                      } flex items-center justify-center text-white text-xs uppercase font-medium`}
                    >
                      {(res.name || "R").substring(0, 1)}
                    </div>
                    <span className="text-sm font-medium">
                      {res.name || "Untitled resource"}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <Select
                      value={res.resourceType || "per hour"}
                      onValueChange={(value) => handleTypeChange(res.id, value)}
                    >
                      <SelectTrigger className="h-8 border-none shadow-none bg-transparent hover:bg-muted w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per hour">per hour</SelectItem>
                        <SelectItem value="per item">per item</SelectItem>
                        <SelectItem value="cost only">cost only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-4 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground text-xs h-8"
                      onClick={() => handleConvertClick(res)}
                    >
                      Convert into a real user
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-red-600 h-8 w-8"
                      onClick={() => handleDelete(res.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AddResourceDialog
        isOpen={isAddResourceOpen}
        onOpenChange={setIsAddResourceOpen}
        projectId={projectId}
        onCreated={refreshProjects}
      />

      {selectedResource && (
        <ConvertResourceDialog
          isOpen={isConvertOpen}
          onOpenChange={(open) => {
            setIsConvertOpen(open);
            if (!open) {
              setSelectedResource(null);
            }
          }}
          projectId={projectId}
          resource={selectedResource}
          members={members} // Pass members ke dialog
          onConverted={refreshProjects}
        />
      )}
    </div>
  );
}


