"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserButtonProps {
  isSidebarOpen: boolean;
}

export default function UserButton({ isSidebarOpen }: UserButtonProps) {
  const { data: session, status } = useSession();

  // Loading State
  if (status === "loading") {
    return (
      <Button variant="ghost" className="w-full justify-center" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  // State: Belum Login
  if (!session?.user) {
    return (
      <Button
        variant="outline"
        onClick={() => signIn("google")}
        className={cn(
          "w-full gap-2 overflow-hidden transition-all duration-300",
          isSidebarOpen ? "justify-start px-4" : "justify-center px-0"
        )}
        title="Sign In with Google"
      >
        <LogIn className="w-4 h-4 flex-shrink-0" />
        <span
          className={cn(
            "whitespace-nowrap transition-all duration-300",
            isSidebarOpen ? "opacity-100 max-w-[100px]" : "opacity-0 max-w-0"
          )}
        >
          Sign In
        </span>
      </Button>
    );
  }

  // State: Sudah Login
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full gap-2 h-14 overflow-hidden transition-all duration-300 group",
            isSidebarOpen ? "justify-start px-2" : "justify-center px-0"
          )}
        >
          <Avatar className="w-8 h-8 flex-shrink-0 border transition-transform group-hover:scale-105">
            <AvatarImage src={session.user.image || ""} />
            <AvatarFallback>
              {session.user.name?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          {/* Informasi User (Hanya muncul saat Sidebar Terbuka) */}
          <div
            className={cn(
              "flex flex-col items-start text-left overflow-hidden transition-all duration-300",
              isSidebarOpen
                ? "opacity-100 max-w-[160px] ml-1"
                : "opacity-0 max-w-0 ml-0"
            )}
          >
            <span className="font-semibold text-sm truncate w-full">
              {session.user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full">
              {session.user.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56" sideOffset={10}>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{session.user.name}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
