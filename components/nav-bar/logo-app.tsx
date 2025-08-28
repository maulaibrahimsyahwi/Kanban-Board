import Image from "next/image";
import logo from "@/app/assets/logo.svg";
import Link from "next/link";

export default function AppNameAndLogo() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
      {/* logo */}
      <div className="">
        <Image
          src={logo}
          alt="Free Kanban Logo"
          width={20}
          height={20}
          className="sm:w-6 sm:h-6 md:w-7 md:h-7 logo-dark-mode"
        />
      </div>

      {/* app name */}
      <div className="">
        <div className="flex gap-0.5 sm:gap-1 items-center min-w-0">
          <span className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate">
            Free
          </span>
          <span className="text-base sm:text-lg md:text-xl text-foreground truncate">
            Kanban
          </span>
        </div>
        <Link
          href="https://www.linkedin.com/in/maula-ibrahim-syahwi"
          target="_blank"
          className="text-xs text-muted-foreground"
        >
          by Maula Ibrahim Syahwi
        </Link>
      </div>
    </div>
  );
}
