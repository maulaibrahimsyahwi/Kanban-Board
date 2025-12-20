"use client";

import { useState } from "react";
// ... imports lainnya tetap sama ...
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, RefreshCw } from "lucide-react";
import { useProjects } from "@/contexts/projectContext";
import { Separator } from "@/components/ui/separator";
import UserInvitationDialog from "@/components/windows-dialogs/project-dialog/user-invitation-dialog";
import ChangeOwnerDialog from "@/components/windows-dialogs/project-dialog/change-owner-dialog";
import VirtualResourcesView from "./virtual-resources-view";
import { cn } from "@/lib/utils";

type TabType = "people" | "virtual";

export default function PeopleView() {
  const { selectedProject } = useProjects();
  const [activeTab, setActiveTab] = useState<TabType>("people");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isChangeOwnerOpen, setIsChangeOwnerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!selectedProject) return null;

  const realMembers = selectedProject.members.filter((m) => !m.isVirtual);

  const allMembers = [
    { ...selectedProject.owner, role: "Project Owner", type: "per hour" },
    ...realMembers.map((m) => ({
      ...m,
      role: "Member",
      type: "per hour",
    })),
  ].filter((member, idx, arr) => {
    if (!member.id) return false;
    return arr.findIndex((item) => item.id === member.id) === idx;
  });

  const conversionMembers = [
    selectedProject.owner,
    ...realMembers,
  ].filter((member, idx, arr) => {
    if (!member.id) return false;
    return arr.findIndex((item) => item.id === member.id) === idx;
  });

  // Filter untuk tampilan People tab (tetap sama)
  const filteredMembers = allMembers.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-card border rounded-xl overflow-hidden animate-in fade-in duration-300">
      {/* Tabs Header */}
      <div className="px-6 pt-6 pb-0 flex gap-1 bg-background/50">
        <button
          onClick={() => setActiveTab("people")}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-t border-x",
            activeTab === "people"
              ? "bg-white border-b-white translate-y-[1px] z-10 text-foreground"
              : "text-muted-foreground hover:bg-muted/50 border-transparent"
          )}
        >
          People
        </button>
        <button
          onClick={() => setActiveTab("virtual")}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-t border-x",
            activeTab === "virtual"
              ? "bg-white border-b-white translate-y-[1px] z-10 text-foreground"
              : "text-muted-foreground hover:bg-muted/50 border-transparent"
          )}
        >
          Virtual resources
        </button>
      </div>
      <Separator className="z-0" />

      <div className="flex-1 overflow-hidden">
        {activeTab === "people" ? (
          <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
            {/* ... (Konten People Tab sama seperti sebelumnya) ... */}
            <div className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Here you manage all your project members...
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email"
                  className="pl-10 border-t-0 border-x-0 border-b rounded-none focus-visible:ring-0 px-0 bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                className="bg-[#0052CC] hover:bg-[#0052CC]/90 text-white gap-2"
                onClick={() => setIsInviteOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
                Invite users
              </Button>
            </div>

            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider rounded-t-md">
              <div className="col-span-5">User</div>
              <div className="col-span-3">Project rights</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2"></div>
            </div>

            <div className="space-y-1">
              {filteredMembers.map((member, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 px-4 py-4 items-center border-b last:border-0 hover:bg-muted/10 transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                    <Avatar className="h-10 w-10 bg-blue-500 text-white">
                      <AvatarImage src={member.image || ""} />
                      <AvatarFallback className="bg-[#0052CC] text-white font-medium">
                        {member.name?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {member.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 text-sm font-medium">
                    {member.role}
                  </div>

                  <div className="col-span-2 text-sm text-muted-foreground">
                    {member.type}
                  </div>

                  <div className="col-span-2 flex justify-end">
                    {member.role === "Project Owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#0052CC] hover:text-[#0052CC]/80 hover:bg-blue-50 h-8 gap-1.5 text-xs font-medium"
                        onClick={() => setIsChangeOwnerOpen(true)}
                      >
                        <RefreshCw className="w-3 h-3" />
                        Change project owner
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Pass data allMembers ke VirtualResourcesView
          <VirtualResourcesView members={conversionMembers} />
        )}
      </div>

      {selectedProject && (
        <>
          <UserInvitationDialog
            isOpen={isInviteOpen}
            onOpenChange={setIsInviteOpen}
            projectId={selectedProject.id}
          />
          <ChangeOwnerDialog
            isOpen={isChangeOwnerOpen}
            onOpenChange={setIsChangeOwnerOpen}
            projectId={selectedProject.id}
            currentOwnerId={selectedProject.owner.id}
            members={allMembers}
          />
        </>
      )}
    </div>
  );
}
