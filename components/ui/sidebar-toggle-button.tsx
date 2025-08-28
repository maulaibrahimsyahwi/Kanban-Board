// components/ui/sidebar-toggle-button.tsx
import { Button } from "@/components/ui/button";
import { PanelRight } from "lucide-react";
import { useSidebar } from "@/contexts/sidebarContext";

interface SidebarToggleButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export default function SidebarToggleButton({
  variant = "outline",
  size = "sm",
  className = "",
  showLabel = false,
}: SidebarToggleButtonProps) {
  const { isRightSidebarVisible, toggleRightSidebar } = useSidebar();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleRightSidebar}
      className={`flex gap-2 transition-all duration-200 hover:scale-105 ${className} cursor-pointer border border-black`}
      title={isRightSidebarVisible ? "Hide sidebar" : "Show sidebar"}
    >
      <PanelRight className="w-4 h-4" />
      {showLabel && (
        <span className="hidden sm:inline ">
          {isRightSidebarVisible ? "Hide" : "Show"} Sidebar
        </span>
      )}
    </Button>
  );
}
