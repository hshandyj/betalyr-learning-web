"use client";

import { Icons } from "../../Icons";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { loginService } from "@/service/LoginService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserButtonProps {
  onClick: () => void;
}

const UserButton: React.FC<UserButtonProps> = ({ onClick }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  // 检查用户登录状态
  useEffect(() => {
    setMounted(true);
    // 获取当前用户
    const currentUser = loginService.getCurrentUser();
    setUser(currentUser);

    // 使用 Firebase auth 监听认证状态变化
    const unsubscribe = auth.onAuthStateChanged((authUser: User | null) => {
      setUser(authUser);
    });

    return () => {
      // 清理监听器
      unsubscribe();
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative flex group h-[48px] shrink-0">
      <div className="h-[48px] cursor-pointer py-3 px-5 w-full flex gap-3 shrink-0 hover:bg-accent">
        {user ? (
          <>
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.photoURL || ""} alt={user.displayName || "用户"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "用"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 h-6 flex items-center">
              <span className="truncate overflow-hidden w-max font-semibold">
                {user.displayName || user.email || "已登录用户"}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="h-6 w-6 bg-primary rounded-sm flex items-center justify-center text-xs text-primary-foreground">
              访客
            </div>
            <div className="flex-1 h-6 flex items-center">
              <span className="truncate overflow-hidden w-max font-semibold">
                未登录用户
              </span>
            </div>
          </>
        )}
      </div>
      <Icons.DoubleArrowLeft
        onClick={onClick}
        className="h-6 w-6 p-1 hover:bg-accent-foreground/20 rounded-sm absolute top-1/2 -translate-y-1/2 right-4 z-10 cursor-pointer"
      />
    </div>
  );
};

export default UserButton;
