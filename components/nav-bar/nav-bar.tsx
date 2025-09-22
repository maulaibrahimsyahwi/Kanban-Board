import { Separator } from "../ui/separator";
import { ModeToggle } from "../mode-toggle";
import AppNameAndLogo from "./logo-app";
import ProjectDialog from "../windows-dialogs/project-dialog/CreateProjectDialog";

export default function NavBar() {
  return (
    <nav className="poppins px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 flex justify-between items-center border-b border-border w-full overflow-hidden">
      {/* Left section - Logo and App Name */}
      <div className="flex items-center flex-1 min-w-0 mr-2 sm:mr-4">
        <div className="min-w-0 max-w-full">
          <AppNameAndLogo />
        </div>
      </div>

      {/* Right section - Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
        <ModeToggle />
        <Separator
          orientation="vertical"
          className="h-4 sm:h-5 w-[1px] bg-border hidden xs:block"
        />
        <div className="min-w-0">
          <ProjectDialog />
        </div>
      </div>
    </nav>
  );
}
