/**
 * 订单数据 Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";

// 获取订单列表
export function useOrders(params?: any) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersApi.list(params),
  });
}

// 获取订单详情
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

// 创建订单
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// 更新订单
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ordersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
    },
  });
}

// 更新订单状态
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
    },
  });
}
