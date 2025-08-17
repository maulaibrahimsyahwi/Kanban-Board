// components/nav-bar/logo-app.tsx
import Image from "next/image";
import logo from "@/app/assets/logo.png";

export default function AppNameAndLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* logo */}
      <div className="bg-primary size-10 text-lg text-primary-foreground rounded-xl flex justify-center items-center">
        <Image
          src={logo}
          alt="Free Kanban Logo"
          width={28}
          height={28}
          className="bg-transparent"
        />
      </div>
      {/* app name */}
      <div className="flex gap-1 items-center text-xl">
        <span className="text-xl font-bold text-foreground">Free</span>
        <span className="text-xl text-foreground">Kanban</span>
      </div>
    </div>
  );
}
