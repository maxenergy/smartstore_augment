/**
 * TanStack Query 客户端配置
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * 创建 QueryClient 实例
 * 配置全局默认选项
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute - 数据在1分钟内被认为是新鲜的
      retry: 1, // 失败后重试1次
      refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取数据
    },
    mutations: {
      retry: 0, // 变更操作不重试
    },
  },
});
