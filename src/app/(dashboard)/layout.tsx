/**
 * 仪表板布局
 * 包含侧边栏和顶部导航
 */

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 调试信息
  useEffect(() => {
    console.log("Dashboard Layout - Status:", status);
    console.log("Dashboard Layout - Session:", session);
  }, [status, session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("Redirecting to signin - unauthenticated");
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    console.log("Rendering loading state");
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    console.log("No session - returning null");
    return null;
  }

  console.log("Rendering dashboard layout with session");
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
