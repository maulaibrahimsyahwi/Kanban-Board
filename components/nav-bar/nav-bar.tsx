import { Separator } from "../ui/separator";
import { ModeToggle } from "../mode-toggle";
import AppNameAndLogo from "./logo-app";
import ProjectDialog from "../windows-dialogs/project-dialog/project-dialog";

export default function NavBar() {
  return (
    <nav className="poppins p-4 md:p-6 flex justify-between items-center border-b border-border w-full overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-4 md:gap-8 lg:gap-16 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <AppNameAndLogo />
        </div>
        <div className="hidden sm:block flex-1 max-w-md min-w-0"></div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 lg:gap-5 flex-shrink-0">
        <ModeToggle />
        <Separator
          orientation="vertical"
          className="h-5 w-[1px] bg-border hidden sm:block"
        />
        <ProjectDialog />
      </div>
    </nav>
  );
}
