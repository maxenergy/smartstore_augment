/**
 * 仪表板顶部导航栏组件
 */

"use client";

import { signOut, useSession } from "next-auth/react";
import { useUIStore } from "@/store/ui.store";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const { toggleSidebar } = useUIStore();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {session?.user?.name || "用户"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={handleSignOut} title="退出登录">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
