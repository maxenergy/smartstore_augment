/**
 * 店铺相关 Hooks
 * 使用 TanStack Query 封装店铺数据获取逻辑
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopsApi } from "@/lib/api";

/**
 * 获取店铺列表
 */
export function useShops(params?: {
  page?: number;
  pageSize?: number;
  platform?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["shops", params],
    queryFn: () => shopsApi.list(params),
  });
}

/**
 * 获取店铺详情
 */
export function useShop(id: string) {
  return useQuery({
    queryKey: ["shops", id],
    queryFn: () => shopsApi.get(id),
    enabled: !!id,
  });
}

/**
 * 创建店铺
 */
export function useCreateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => shopsApi.create(data),
    onSuccess: () => {
      // 使查询缓存失效
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
  });
}

/**
 * 更新店铺信息
 */
export function useUpdateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => shopsApi.update(id, data),
    onSuccess: (_, variables) => {
      // 使查询缓存失效
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      queryClient.invalidateQueries({ queryKey: ["shops", variables.id] });
    },
  });
}

/**
 * 删除店铺
 */
export function useDeleteShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shopsApi.delete(id),
    onSuccess: () => {
      // 使查询缓存失效
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
  });
}
