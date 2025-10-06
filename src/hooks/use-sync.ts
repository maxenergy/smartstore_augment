/**
 * 同步数据 Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { syncApi } from "@/lib/api";

// 获取同步日志列表
export function useSyncLogs(params?: any) {
  return useQuery({
    queryKey: ["sync-logs", params],
    queryFn: () => syncApi.getLogs(params),
  });
}

// 获取同步统计
export function useSyncStats() {
  return useQuery({
    queryKey: ["sync-stats"],
    queryFn: () => syncApi.getStats(),
  });
}

// 批量同步库存
export function useSyncInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => syncApi.syncInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync-logs"] });
      queryClient.invalidateQueries({ queryKey: ["sync-stats"] });
      queryClient.invalidateQueries({ queryKey: ["platform-products"] });
    },
  });
}

// 批量同步价格
export function useSyncPrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => syncApi.syncPrices(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync-logs"] });
      queryClient.invalidateQueries({ queryKey: ["sync-stats"] });
      queryClient.invalidateQueries({ queryKey: ["platform-products"] });
    },
  });
}
