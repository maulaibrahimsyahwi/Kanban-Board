"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  CheckCircle2,
  Plus,
  Settings,
  Loader2,
  LogIn,
  LogOut,
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  addStoredAccount,
  getStoredAccounts,
  StoredAccount,
} from "@/lib/account-storage";

interface UserButtonProps {
  isSidebarOpen: boolean;
}

export default function UserButton({ isSidebarOpen }: UserButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [knownAccounts, setKnownAccounts] = useState<StoredAccount[]>([]);

  const [isSwitchDialogOpen, setIsSwitchDialogOpen] = useState(false);
  const [targetAccount, setTargetAccount] = useState<StoredAccount | null>(
    null
  );
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const isGoogle = session.user.image?.includes("googleusercontent");
      const currentAccount: StoredAccount = {
        id: session.user.id || "",
        name: session.user.name || "User",
        email: session.user.email || "",
        image: session.user.image,
        provider: isGoogle ? "google" : "credentials",
      };
      addStoredAccount(currentAccount);
      setKnownAccounts(getStoredAccounts());
    }
  }, [session]);

  useEffect(() => {
    setKnownAccounts(getStoredAccounts());
  }, []);

  const handleAccountClick = (account: StoredAccount) => {
    if (account.email === session?.user?.email) return;

    setTargetAccount(account);
    setPassword("");
    setIsSwitchDialogOpen(true);
  };

  const handleSwitchWithCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccount) return;

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: targetAccount.email,
        password: password,
      });

      if (result?.error) {
        toast.error("Password salah", { description: "Silakan coba lagi." });
        setIsLoading(false);
      } else {
        toast.success("Berhasil beralih akun");
        window.location.reload();
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
      setIsLoading(false);
    }
  };

  const handleSwitchWithGoogle = async () => {
    if (!targetAccount) return;
    setIsLoading(true);
    await signIn("google", {
      callbackUrl: "/",
      login_hint: targetAccount.email,
    });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/?login=true" });
  };

  const handleAddAccount = async () => {
    await signOut({ callbackUrl: "/?login=true" });
  };

  if (status === "loading") {
    return (
      <div className="w-full flex justify-center py-2">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
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
    <>
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
          <div className="flex flex-col gap-1 mb-2">
            {knownAccounts.map((acc) => {
              const isActive = acc.email === session.user?.email;

              return (
                <div
                  key={acc.email}
                  onClick={() => handleAccountClick(acc)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                    isActive ? "bg-accent cursor-default" : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar className="w-9 h-9 border border-border/50">
                      <AvatarImage src={acc.image || ""} />
                      <AvatarFallback>{acc.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-sm truncate">
                        {acc.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {acc.email}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500/10" />
                  )}
                </div>
              );
            })}
          </div>

          <DropdownMenuSeparator className="bg-border/50" />

          <DropdownMenuItem
            onClick={handleAddAccount}
            className="p-3 cursor-pointer font-medium"
          >
            <Plus className="w-4 h-4 mr-3" />
            Add existing account
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push("/settings/profile")}
            className="p-3 cursor-pointer font-medium"
          >
            <Settings className="w-4 h-4 mr-3" />
            Manage accounts
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleLogout}
            className="p-3 cursor-pointer font-medium text-foreground hover:bg-accent"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span className="truncate">Log out {session.user.email}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isSwitchDialogOpen} onOpenChange={setIsSwitchDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Switch Account</DialogTitle>
            <DialogDescription>
              Enter password to switch to{" "}
              <strong>{targetAccount?.email}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center mb-2">
              <Avatar className="w-16 h-16 border-2 border-border">
                <AvatarImage src={targetAccount?.image || ""} />
                <AvatarFallback className="text-xl">
                  {targetAccount?.name?.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center mb-2">
              <p className="font-medium text-lg">{targetAccount?.name}</p>
              <p className="text-sm text-muted-foreground">
                {targetAccount?.email}
              </p>
            </div>

            <form onSubmit={handleSwitchWithCredentials} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="switch-password">Password</Label>
                <Input
                  id="switch-password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !password}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Switch Account
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleSwitchWithGoogle}
              disabled={isLoading}
              className="w-full gap-2"
            >
              <FaGoogle className="w-4 h-4" />
              Sign in with Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
