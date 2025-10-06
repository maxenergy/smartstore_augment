/**
 * 平台产品数据 Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformProductsApi } from "@/lib/api";

// 获取平台产品列表
export function usePlatformProducts(params?: any) {
  return useQuery({
    queryKey: ["platform-products", params],
    queryFn: () => platformProductsApi.list(params),
  });
}

// 分发产品到店铺
export function useDistributeProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: any }) =>
      platformProductsApi.distribute(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["platform-products"] });
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId],
      });
    },
  });
}

// 更新库存
export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, inventory }: { id: string; inventory: number }) =>
      platformProductsApi.updateInventory(id, inventory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-products"] });
    },
  });
}

// 删除平台产品（取消分发）
export function useDeletePlatformProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformProductsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-products"] });
    },
  });
}
