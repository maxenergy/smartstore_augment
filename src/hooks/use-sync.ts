/**
 * 产品同步相关 Hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

/**
 * 同步类型
 */
export type SyncType = "PRICE" | "STOCK" | "INFO" | "ALL";

/**
 * 同步结果
 */
export interface SyncResult {
  success: boolean;
  message: string;
  oldValue?: any;
  newValue?: any;
  changes?: string[];
}

/**
 * 批量同步结果
 */
export interface BatchSyncResult {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    productId: string;
    productTitle: string;
    status: "SUCCESS" | "FAILED";
    message: string;
  }>;
}

/**
 * 同步日志
 */
export interface SyncLog {
  id: string;
  productId: string;
  syncType: string;
  platform: string;
  status: string;
  message: string | null;
  oldValue: string | null;
  newValue: string | null;
  syncedAt: string;
  product?: {
    id: string;
    title: string;
    sourcePlatform: string;
  };
}

/**
 * 同步单个产品 Hook
 */
export function useSyncProduct() {
  const queryClient = useQueryClient();

  return useMutation<SyncResult, Error, { productId: string; syncType: SyncType }>({
    mutationFn: async ({ productId, syncType }) => {
      const response = await apiClient.post(`/products/${productId}/sync`, {
        syncType,
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      // 同步成功后刷新产品详情和同步日志
      queryClient.invalidateQueries({ queryKey: ["products", variables.productId] });
      queryClient.invalidateQueries({
        queryKey: ["product-sync-logs", variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["sync-logs"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * 批量同步产品 Hook
 */
export function useBatchSync() {
  const queryClient = useQueryClient();

  return useMutation<
    BatchSyncResult,
    Error,
    { productIds: string[]; syncType: SyncType }
  >({
    mutationFn: async ({ productIds, syncType }) => {
      const response = await apiClient.post("/products/sync/batch", {
        productIds,
        syncType,
      });
      return response.data.data;
    },
    onSuccess: () => {
      // 批量同步成功后刷新所有相关数据
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sync-logs"] });
    },
  });
}

/**
 * 获取单个产品的同步日志 Hook
 */
export function useProductSyncLogs(productId: string, limit: number = 10) {
  return useQuery<SyncLog[], Error>({
    queryKey: ["product-sync-logs", productId, limit],
    queryFn: async () => {
      const response = await apiClient.get(
        `/products/${productId}/sync-logs?limit=${limit}`
      );
      return response.data.data;
    },
    enabled: !!productId,
  });
}

/**
 * 获取所有同步日志 Hook
 */
export function useSyncLogs(params: {
  page?: number;
  pageSize?: number;
  platform?: string;
  status?: string;
}) {
  const { page = 1, pageSize = 20, platform, status } = params;

  return useQuery<
    {
      data: SyncLog[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    },
    Error
  >({
    queryKey: ["sync-logs", page, pageSize, platform, status],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (platform) queryParams.append("platform", platform);
      if (status) queryParams.append("status", status);

      const response = await apiClient.get(`/sync-logs?${queryParams.toString()}`);

      return {
        data: response.data.data,
        pagination: response.data.meta.pagination,
      };
    },
  });
}
