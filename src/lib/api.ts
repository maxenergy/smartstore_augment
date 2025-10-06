/**
 * API 方法封装
 * 提供类型安全的 API 调用方法
 */

import { apiClient } from "./api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

/**
 * 用户相关 API
 */
export const usersApi = {
  /**
   * 获取用户列表
   */
  list: (params?: {
    page?: number;
    pageSize?: number;
    role?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => apiClient.get<ApiResponse<PaginatedResponse<any>>>("/users", { params }),

  /**
   * 获取用户详情
   */
  get: (id: string) => apiClient.get<ApiResponse<any>>(`/users/${id}`),

  /**
   * 更新用户信息
   */
  update: (id: string, data: any) => apiClient.put<ApiResponse<any>>(`/users/${id}`, data),

  /**
   * 删除用户
   */
  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/users/${id}`),
};

/**
 * 店铺相关 API
 */
export const shopsApi = {
  /**
   * 获取店铺列表
   */
  list: (params?: {
    page?: number;
    pageSize?: number;
    platform?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => apiClient.get<ApiResponse<PaginatedResponse<any>>>("/shops", { params }),

  /**
   * 获取店铺详情
   */
  get: (id: string) => apiClient.get<ApiResponse<any>>(`/shops/${id}`),

  /**
   * 创建店铺
   */
  create: (data: any) => apiClient.post<ApiResponse<any>>("/shops", data),

  /**
   * 更新店铺信息
   */
  update: (id: string, data: any) => apiClient.put<ApiResponse<any>>(`/shops/${id}`, data),

  /**
   * 删除店铺
   */
  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/shops/${id}`),
};

/**
 * 产品相关 API
 */
export const productsApi = {
  /**
   * 获取产品列表
   */
  list: (params?: {
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
  }) => apiClient.get<ApiResponse<PaginatedResponse<any>>>("/products", { params }),

  /**
   * 获取产品详情
   */
  get: (id: string) => apiClient.get<ApiResponse<any>>(`/products/${id}`),

  /**
   * 创建产品
   */
  create: (data: any) => apiClient.post<ApiResponse<any>>("/products", data),

  /**
   * 更新产品信息
   */
  update: (id: string, data: any) => apiClient.put<ApiResponse<any>>(`/products/${id}`, data),

  /**
   * 删除产品
   */
  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/products/${id}`),

  /**
   * 更新产品状态
   */
  updateStatus: (id: string, status: string) =>
    apiClient.patch<ApiResponse<any>>(`/products/${id}/status`, { status }),
};

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户注册
   */
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post<ApiResponse<any>>("/auth/register", data),

  /**
   * 获取当前用户信息
   */
  me: () => apiClient.get<ApiResponse<any>>("/auth/me"),
};

/**
 * 统一导出 API 对象
 */
// 订单 API
export const ordersApi = {
  list: (params?: any) => apiClient.get<ApiResponse<PaginatedResponse<any>>>("/orders", { params }),
  get: (id: string) => apiClient.get<ApiResponse<any>>(`/orders/${id}`),
  create: (data: any) => apiClient.post<ApiResponse<any>>("/orders", data),
  update: (id: string, data: any) => apiClient.put<ApiResponse<any>>(`/orders/${id}`, data),
  updateStatus: (id: string, status: string) =>
    apiClient.patch<ApiResponse<any>>(`/orders/${id}/status`, { status }),
};

// 平台产品 API
export const platformProductsApi = {
  list: (params?: any) =>
    apiClient.get<ApiResponse<PaginatedResponse<any>>>("/platform-products", {
      params,
    }),
  distribute: (productId: string, data: any) =>
    apiClient.post<ApiResponse<any>>(`/products/${productId}/distribute`, data),
  updateInventory: (id: string, inventory: number) =>
    apiClient.patch<ApiResponse<any>>(`/platform-products/${id}/inventory`, {
      inventory,
    }),
  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/platform-products/${id}`),
};

// 同步 API
export const syncApi = {
  syncInventory: (data: any) => apiClient.post<ApiResponse<any>>("/sync/inventory", data),
  syncPrices: (data: any) => apiClient.post<ApiResponse<any>>("/sync/prices", data),
  getLogs: (params?: any) =>
    apiClient.get<ApiResponse<PaginatedResponse<any>>>("/sync/logs", {
      params,
    }),
  getStats: () => apiClient.get<ApiResponse<any>>("/sync/stats"),
};

export const api = {
  users: usersApi,
  shops: shopsApi,
  products: productsApi,
  orders: ordersApi,
  platformProducts: platformProductsApi,
  sync: syncApi,
  auth: authApi,
};
