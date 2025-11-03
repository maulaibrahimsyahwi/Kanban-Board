import Image from "next/image";
import logo from "@/app/assets/logo.svg";
import Link from "next/link";

export default function AppNameAndLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Logo */}
      <Image
        src={logo}
        alt="Free Kanban Logo"
        width={22}
        height={22}
        className="logo-dark-mode flex-shrink-0"
      />

      {/* App Identity */}
      <div className="flex flex-col">
        {/* App Name */}
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

        {/* Creator Attribution - Subtle */}
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
