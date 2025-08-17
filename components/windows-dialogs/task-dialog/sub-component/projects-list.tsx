import { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoCheckmark } from "react-icons/io5";
import { MdOutlineCategory } from "react-icons/md";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { IoMdSearch } from "react-icons/io";
import { Label } from "@/components/ui/label"; // Import yang benar

type ProjectItem = {
  id: string;
  name: string;
  icon: React.ElementType;
};

const ProjectsArray: ProjectItem[] = [
  {
    id: "1",
    name: "Project 1",
    icon: MdOutlineCategory,
  },
  {
    id: "2",
    name: "Project 2",
    icon: AiFillSafetyCertificate,
  },
];

export default function ProjectsList() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem>(
    ProjectsArray[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filterBySearchQuery = ProjectsArray.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery(""); // Reset search when closing
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery("");
    }
  };

  const handleSelectProject = (projectItem: ProjectItem) => {
    setSelectedProject(projectItem);
    setIsOpen(false);
    setSearchQuery("");
  };

  function renderSelectedProject() {
    const Icon = selectedProject.icon;
    return (
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-md flex items-center justify-center text-lg text-primary bg-primary/10">
          <Icon />
        </div>
        <span>{selectedProject.name}</span>
      </div>
    );
  }

  function renderDropDownMenuItem(projectItem: ProjectItem) {
    const Icon = projectItem.icon;
    const isSelected = projectItem.id === selectedProject.id;

    return (
      <div
        key={projectItem.id}
        className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer rounded-md mx-2"
        onClick={() => handleSelectProject(projectItem)}
      >
        <div className="flex items-center gap-2">
          <div className="size-7 bg-primary/10 rounded-md flex items-center justify-center text-[15px] text-primary">
            <Icon />
          </div>
          <span>{projectItem.name}</span>
        </div>
        {isSelected && <IoCheckmark className="text-primary" />}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Label className="opacity-75 text-sm font-medium">Projects</Label>

      <div className="mt-2 w-full">
        <Button
          variant={"outline"}
          className="w-full h-11 flex justify-between items-center border"
          onClick={handleToggleDropdown}
          type="button"
        >
          {renderSelectedProject()}
          <IoIosArrowDown
            className={`text-gray-600 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Search Input */}
          <div className="relative border-b border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 p-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-t-lg"
              placeholder="Search a project..."
            />
            <IoMdSearch className="absolute top-[13px] left-2 text-lg text-gray-500" />
          </div>

          {/* Dropdown Items */}
          <div className="max-h-60 overflow-y-auto py-2">
            {filterBySearchQuery.length > 0 ? (
              filterBySearchQuery.map((projectItem) =>
                renderDropDownMenuItem(projectItem)
              )
            ) : (
              <div className="p-3 text-sm text-gray-500 text-center">
                No projects found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
