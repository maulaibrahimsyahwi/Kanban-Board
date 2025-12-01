"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Bell,
  CreditCard,
  Users,
  Settings,
  Shield,
  LogOut,
  LayoutGrid,
  Briefcase,
  Lock,
} from "lucide-react";
import { signOut } from "next-auth/react";

const sidebarItems = [
  {
    category: "Personal",
    items: [
      { href: "/settings/profile", label: "Profile settings", icon: User },
      { href: "/settings/notifications", label: "Notifications", icon: Bell },
      { href: "/settings/billing", label: "Billing", icon: CreditCard },
    ],
  },
  {
    category: "Workspace",
    items: [
      { href: "/settings/team", label: "Team and resources", icon: Users },
      {
        href: "/settings/team-settings",
        label: "Team settings",
        icon: Settings,
      },
      {
        href: "/settings/project-status",
        label: "Project status",
        icon: LayoutGrid,
      },
      { href: "/settings/roles", label: "Account roles", icon: User },
      { href: "/settings/rights", label: "Project rights", icon: Briefcase },
      { href: "/settings/fields", label: "Custom fields", icon: LayoutGrid },
    ],
  },
  {
    category: "System",
    items: [
      { href: "/settings/security", label: "Security", icon: Shield },
      {
        href: "/settings/integration",
        label: "Integration and API",
        icon: Lock,
      },
    ],
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-card/50 h-full flex flex-col">
      <div className="p-4 border-b border-border flex-shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" /> Settings
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sidebarItems.map((group, idx) => (
          <div key={idx}>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {idx < sidebarItems.length - 1 && (
              <div className="my-4 border-t border-border/50" />
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border flex-shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: "/?login=true" })}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
