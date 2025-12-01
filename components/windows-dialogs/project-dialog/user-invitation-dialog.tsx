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
import { Search, User, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addMemberAction } from "@/app/actions/project";

interface UserInvitationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export default function UserInvitationDialog({
  isOpen,
  onOpenChange,
  projectId,
}: UserInvitationDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInviteByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const result = await addMemberAction(projectId, email);
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        setEmail("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengirim undangan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              User invitation
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
                value="email"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary shadow-none"
              >
                Invite new by email
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: CHOOSE FROM TEAM (Empty State sesuai gambar) */}
          <TabsContent value="team" className="p-6 pt-4 min-h-[300px]">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name"
                className="pl-9 bg-muted/30 border-t-0 border-x-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
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

          {/* TAB 2: INVITE BY EMAIL (Fungsional) */}
          <TabsContent value="email" className="p-6 pt-4 min-h-[300px]">
            <form
              onSubmit={handleInviteByEmail}
              className="flex flex-col h-full"
            >
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    placeholder="Enter email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    An invitation will be sent to the user.
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="bg-primary text-primary-foreground min-w-[80px]"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
