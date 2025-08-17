import logo from "@/app/assets/logo.png";

export default function AppNameAndLogo() {
  // Handle StaticImageData type
  const logoSrc =
    typeof logo === "object" && logo !== null && "src" in logo
      ? (logo as { src: string }).src
      : (logo as string);

  return (
    <div className="flex items-center gap-2">
      {/* logo */}
      <div className="bg-primary size-10 text-lg text-primary-foreground rounded-xl flex justify-center items-center">
        <img
          src={logoSrc}
          alt="Free Kanban Logo"
          className="w-7 h-7 bg-transparent"
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
