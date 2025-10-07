/**
 * 产品搜索相关 Hooks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Platform } from "@prisma/client";

/**
 * 搜索参数类型
 */
export interface ProductSearchParams {
  platform: Platform;
  keyword: string;
  filters?: {
    minSalesCount?: number;
    minRating?: number;
    minPrice?: number;
    maxPrice?: number;
    dropshippingOnly?: boolean;
    inStock?: boolean;
  };
  page?: number;
  pageSize?: number;
}

/**
 * 外部产品类型
 */
export interface ExternalProduct {
  externalId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  supplierName: string;
  supplierUrl: string;
  dropshippingSupported: boolean;
  shippingTime?: string;
  shippingFrom?: string;
  stockQuantity?: number;
  minOrderQuantity: number;
  category?: string;
  tags?: string[];
}

/**
 * 搜索结果类型
 */
export interface SearchResult {
  items: ExternalProduct[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 定价策略类型
 */
export interface PricingStrategy {
  type: "MARGIN" | "MARKUP" | "CUSTOM";
  value?: number;
}

/**
 * 导入参数类型
 */
export interface ProductImportParams {
  platform: Platform;
  products: ExternalProduct[];
  pricingStrategy: PricingStrategy;
}

/**
 * 导入结果类型
 */
export interface ImportResult {
  imported: number;
  failed: number;
  products: Array<{
    id?: string;
    title: string;
    status: "SUCCESS" | "FAILED";
    message?: string;
  }>;
}

/**
 * 产品搜索 Hook
 */
export function useProductSearch() {
  return useMutation<SearchResult, Error, ProductSearchParams>({
    mutationFn: async (params) => {
      const response = await apiClient.post("/products/search", params);
      return response.data.data;
    },
  });
}

/**
 * 产品批量导入 Hook
 */
export function useProductImport() {
  const queryClient = useQueryClient();

  return useMutation<ImportResult, Error, ProductImportParams>({
    mutationFn: async (data) => {
      const response = await apiClient.post("/products/import", data);
      return response.data.data;
    },
    onSuccess: () => {
      // 导入成功后刷新产品列表
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * 产品同步 Hook
 */
export function useProductSync() {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { id: string; syncType: "PRICE" | "STOCK" | "INFO" | "ALL" }
  >({
    mutationFn: async ({ id, syncType }) => {
      const response = await apiClient.post(`/products/${id}/sync`, { syncType });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      // 同步成功后刷新产品详情
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

