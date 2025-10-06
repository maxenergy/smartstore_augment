/**
 * 认证状态管理
 * 使用 Zustand 管理用户认证状态
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 用户信息类型
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "MERCHANT" | "API_USER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

/**
 * 认证状态接口
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * 认证状态 Store
 * 使用 persist 中间件持久化到 localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      /**
       * 设置用户信息
       */
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      /**
       * 退出登录
       */
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      /**
       * 更新用户信息
       */
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);
