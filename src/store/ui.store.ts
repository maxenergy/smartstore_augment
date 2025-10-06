/**
 * UI 状态管理
 * 使用 Zustand 管理 UI 相关状态
 */

import { create } from "zustand";

/**
 * UI 状态接口
 */
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

/**
 * UI 状态 Store
 */
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,

  /**
   * 切换侧边栏显示/隐藏
   */
  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  /**
   * 设置侧边栏显示/隐藏
   */
  setSidebarOpen: (open) =>
    set({
      sidebarOpen: open,
    }),

  theme: "system",

  /**
   * 设置主题
   */
  setTheme: (theme) =>
    set({
      theme,
    }),
}));
