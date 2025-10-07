/**
 * 产品相关 Hooks
 * 使用 TanStack Query 封装产品数据获取逻辑
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";

/**
 * 获取产品列表
 */
export function useProducts(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  sourcePlatform?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dropshippingSupported?: boolean;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 分钟内数据视为新鲜
    gcTime: 10 * 60 * 1000, // 10 分钟后清除缓存
  });
}

/**
 * 获取产品详情
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productsApi.get(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 分钟内数据视为新鲜
    gcTime: 30 * 60 * 1000, // 30 分钟后清除缓存
  });
}

/**
 * 创建产品
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: () => {
      // 使查询缓存失效
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * 更新产品信息
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: (_, variables) => {
      // 使查询缓存失效
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
    },
  });
}

/**
 * 删除产品
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      // 使查询缓存失效
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * 更新产品状态
 */
export function useUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      productsApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      // 使查询缓存失效
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
    },
  });
}
