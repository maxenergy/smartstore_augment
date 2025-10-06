/**
 * 用户相关 Hooks
 * 使用 TanStack Query 封装用户数据获取逻辑
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";

/**
 * 获取用户列表
 */
export function useUsers(params?: {
  page?: number;
  pageSize?: number;
  role?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.list(params),
  });
}

/**
 * 获取用户详情
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => usersApi.get(id),
    enabled: !!id,
  });
}

/**
 * 更新用户信息
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: (_, variables) => {
      // 使查询缓存失效
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
}

/**
 * 删除用户
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      // 使查询缓存失效
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
