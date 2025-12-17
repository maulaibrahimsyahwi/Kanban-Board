import {
  FaBullhorn,
  FaCartShopping,
  FaDiagramProject,
  FaFlagCheckered,
  FaLaptopCode,
  FaMobileRetro,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

const iconMap: Record<string, IconType> = {
  FaMobileRetro,
  FaFlagCheckered,
  FaDiagramProject,
  FaLaptopCode,
  FaBullhorn,
  FaCartShopping,
};

export const fallbackProjectIcon = FaDiagramProject;

export function getProjectIcon(iconName: string): IconType {
  return iconMap[iconName] || fallbackProjectIcon;
}

