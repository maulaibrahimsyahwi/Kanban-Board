import Image from "next/image";
import logo from "@/app/assets/logo.svg";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TbLayoutSidebar } from "react-icons/tb";

interface AppNameAndLogoProps {
  isSidebarOpen: boolean;
  onToggle: () => void;
}

export default function AppNameAndLogo({
  isSidebarOpen,
  onToggle,
}: AppNameAndLogoProps) {
  return (
    // HAPUS overflow-hidden dari sini agar logo tidak terpotong
    <div className="flex items-center">
      <button
        onClick={onToggle}
        className={cn(
          "relative group flex-shrink-0 w-[22px] h-[22px] cursor-pointer hover:cursor-e-resize outline-none transition-transform duration-300 ease-in-out",
          // Geser logo ke tengah manual saat sidebar tertutup
          !isSidebarOpen && "translate-x-[12px]"
        )}
        type="button"
      >
        <Image
          src={logo}
          alt="Free Kanban Logo"
          width={22}
          height={22}
          className="logo-dark-mode transition-opacity duration-200 group-hover:opacity-0"
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-foreground">
          <TbLayoutSidebar className="w-5 h-5" />
        </div>
      </button>

      {/* Overflow hidden dipindah ke sini, khusus untuk teks */}
      <div
        className={cn(
          "flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
          // Mainkan margin-left dan max-width
          isSidebarOpen
            ? "opacity-100 max-w-[200px] ml-2.5"
            : "opacity-0 max-w-0 ml-0"
        )}
      >
        <Link
          href="https://www.linkedin.com/in/maula-ibrahim-syahwi"
          target="_blank"
          className="flex items-center gap-1"
        >
          <span className="text-lg font-semibold text-foreground">Free</span>
          <span className="text-lg font-light text-muted-foreground">
            Kanban
          </span>
        </Link>

        <Link
          href="https://www.linkedin.com/in/maula-ibrahim-syahwi"
          target="_blank"
          className="text-[10px] text-muted-foreground/70 hover:text-muted-foreground transition-colors duration-200 leading-none hidden sm:block"
        >
          by Maula Ibrahim Syahwi
        </Link>
      </div>
    </div>
  );
}
