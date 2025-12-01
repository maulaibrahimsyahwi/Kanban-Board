"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Settings, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomLoader from "@/components/custom-loader";

interface UserButtonProps {
  isSidebarOpen: boolean;
}

export default function UserButton({ isSidebarOpen }: UserButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/?login=true" });
  };

  if (status === "loading") {
    return (
      <div className="w-full flex justify-center py-2">
        <CustomLoader size={20} className="text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <Button
        variant="outline"
        onClick={() => signIn()}
        className={cn(
          "w-full gap-2 overflow-hidden transition-all duration-300",
          isSidebarOpen ? "justify-start px-4" : "justify-center px-0"
        )}
      >
        <LogIn className="w-4 h-4 flex-shrink-0" />
        <span className={cn(isSidebarOpen ? "opacity-100" : "opacity-0 w-0")}>
          Sign In
        </span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full h-auto py-2 gap-3 rounded-full hover:bg-accent transition-all duration-300 group outline-none",
            isSidebarOpen ? "justify-between px-3" : "justify-center px-0"
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {session.user.name?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div
              className={cn(
                "flex flex-col items-start text-left overflow-hidden transition-all duration-300",
                isSidebarOpen
                  ? "opacity-100 max-w-[140px]"
                  : "opacity-0 max-w-0 w-0"
              )}
            >
              <span className="font-bold text-sm truncate w-full text-foreground">
                {session.user.name}
              </span>
              <span className="text-xs text-muted-foreground truncate w-full">
                {session.user.email}
              </span>
            </div>
          </div>

          {isSidebarOpen && (
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[260px] p-2 rounded-xl shadow-xl border-border bg-popover"
        align="start"
        sideOffset={10}
      >
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          Signed in as <br />
          <span className="font-medium text-foreground">
            {session.user.email}
          </span>
        </div>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuItem
          onClick={() => router.push("/settings/profile")}
          className="p-3 cursor-pointer font-medium"
        >
          <Settings className="w-4 h-4 mr-3" />
          Profile settings
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleLogout}
          className="p-3 cursor-pointer font-medium text-foreground hover:bg-accent"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
