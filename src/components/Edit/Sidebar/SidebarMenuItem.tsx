"use client";

import { cn } from "@/lib/utils";
import { Icons, type IconsNames } from "../components/Icons";

interface SidebarMenuItem {
  onClick?: () => void;
  text: string;
  iconName: IconsNames;
  className?: string;
}

const SidebarMenuItem = ({
  onClick,
  text,
  iconName,
  className,
}: SidebarMenuItem) => {
  const Icon = Icons[iconName];

  return (
    <button
      type="button"
      className={cn(
        "flex hover:bg-accent w-full items-center px-2 py-[2px] cursor-pointer rounded-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
      onClick={onClick}
    >
      <Icon className="h-6 w-6 p-1 shrink-0" />
      <span
        className="pl-3 text-sm w-max truncate select-none"
      >
        {text}
      </span>
    </button>
  );
};

export default SidebarMenuItem;
