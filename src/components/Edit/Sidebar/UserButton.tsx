"use client";

import { Icons } from "../../Icons";

interface UserButtonProps {
  onClick: () => void;
}

const UserButton: React.FC<UserButtonProps> = ({ onClick }) => {
  return (
    <div className="relative flex group h-[48px] shrink-0">
      <div className="h-[48px] cursor-pointer py-3 px-5 w-full flex gap-3 shrink-0 hover:bg-accent">
        <div className="h-6 w-6 bg-primary rounded-sm flex items-center justify-center text-xs text-primary-foreground">
          访客
        </div>
        <div className="flex-1 h-6 flex items-center">
          <span className="truncate overflow-hidden w-max font-semibold">
            未登录用户
          </span>
        </div>
      </div>
      <Icons.DoubleArrowLeft
        onClick={onClick}
        className="h-6 w-6 p-1 hover:bg-accent-foreground/20 rounded-sm absolute top-1/2 -translate-y-1/2 right-4 z-10 cursor-pointer"
      />
    </div>
  );
};

export default UserButton;
