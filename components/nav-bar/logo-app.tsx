import Image from "next/image";
import logo from "@/app/assets/logo.png";

export default function AppNameAndLogo() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
      {/* logo */}
      <div className="bg-primary size-8 sm:size-9 md:size-10 text-sm sm:text-base md:text-lg text-primary-foreground rounded-lg sm:rounded-xl flex justify-center items-center flex-shrink-0">
        <Image
          src={logo}
          alt="Free Kanban Logo"
          width={20}
          height={20}
          className="bg-transparent sm:w-6 sm:h-6 md:w-7 md:h-7"
        />
      </div>
      {/* app name */}
      <div className="flex gap-0.5 sm:gap-1 items-center min-w-0">
        <span className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate">
          Free
        </span>
        <span className="text-base sm:text-lg md:text-xl text-foreground truncate">
          Kanban
        </span>
      </div>
    </div>
  );
}
