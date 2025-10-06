/**
 * 仪表板侧边栏组件
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import {
  LayoutDashboard,
  Package,
  Store,
  ShoppingCart,
  Users,
  Settings,
  Layers,
  RefreshCw,
} from "lucide-react";

const navigation = [
  { name: "仪表板", href: "/dashboard", icon: LayoutDashboard },
  { name: "产品管理", href: "/dashboard/products", icon: Package },
  { name: "店铺管理", href: "/dashboard/shops", icon: Store },
  { name: "订单管理", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "平台产品", href: "/dashboard/platform-products", icon: Layers },
  { name: "数据同步", href: "/dashboard/sync", icon: RefreshCw },
  { name: "用户管理", href: "/dashboard/users", icon: Users },
  { name: "设置", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">跨境电商系统</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
