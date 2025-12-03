"use client";

import { useState } from "react";
import { Users, Search, Plus, UserPlus, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import InviteUserDialog from "@/components/settings/invite-user-dialog";

export default function TeamAndResourcesPage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-muted-foreground" />
          Team and resources
        </h1>
      </div>

      <Tabs defaultValue="people" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="virtual">Virtual resources</TabsTrigger>
        </TabsList>

        {/* --- PEOPLE TAB --- */}
        <TabsContent value="people" className="mt-6 space-y-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Here you manage people from all your projects. You can also invite
              new members by email. Depending on the rights granted, members can
              get different roles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email" className="pl-9" />
            </div>

            {/* Tombol Invite User Trigger */}
            <Button
              className="w-full sm:w-auto gap-2"
              onClick={() => setIsInviteDialogOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              Invite by email
            </Button>
          </div>

          <div className="text-sm font-medium text-muted-foreground">
            Number of users: 1
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
              <div className="col-span-6 md:col-span-5">User</div>
              <div className="col-span-3 md:col-span-4">Account role</div>
              <div className="col-span-3">Status</div>
            </div>
            <div className="divide-y">
              <UserRow />
            </div>
          </div>
        </TabsContent>

        {/* --- VIRTUAL RESOURCES TAB --- */}
        <TabsContent value="virtual" className="mt-6 space-y-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Here you manage all virtual resources from your projects. A
              virtual resource is any virtual unit that you would like to
              include in your project. It can be both human and material
              resources, e.g. a developer, a designer, an agency, as well as
              cars, equipment, software, etc.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by resource name" className="pl-9" />
            </div>
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="w-4 h-4" />
              Create new
            </Button>
          </div>

          <div className="text-sm font-medium text-muted-foreground">
            Number of resources: 0
          </div>

          {/* Empty State */}
          <div className="border rounded-lg p-12 flex flex-col items-center justify-center text-center bg-muted/10 min-h-[300px]">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Box className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground">
              No resources created yet
            </h3>
            <p className="text-sm text-muted-foreground/70 max-w-sm mt-2">
              Add resources like equipment, meeting rooms, or external agencies
              to track them in your projects.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Render Dialog Component */}
      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  );
}

function UserRow() {
  const { data: session } = useSession();
  const initials = session?.user?.name?.slice(0, 2).toUpperCase() || "ME";

  return (
    <div className="px-4 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/20 transition-colors">
      <div className="col-span-6 md:col-span-5 flex items-center gap-3 overflow-hidden">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={session?.user?.image || ""} />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate text-sm text-foreground">
            {session?.user?.name || "User Name"}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {session?.user?.email || "user@example.com"}
          </span>
        </div>
      </div>

      <div className="col-span-3 md:col-span-4 text-sm font-medium text-foreground">
        Account Owner
      </div>

      <div className="col-span-3 text-sm text-muted-foreground">Active</div>
    </div>
  );
}
