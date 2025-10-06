/**
 * API 响应缓存工具
 * 使用 Next.js 的 unstable_cache 实现缓存
 */

import { unstable_cache } from "next/cache";

export interface CacheOptions {
  /**
   * 缓存标签，用于缓存失效
   */
  tags?: string[];
  /**
   * 缓存时间（秒）
   */
  revalidate?: number;
}

/**
 * 创建缓存包装函数
 * @param fn 要缓存的函数
 * @param keyParts 缓存键的组成部分
 * @param options 缓存选项
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options: CacheOptions = {}
): T {
  const { tags = [], revalidate = 60 } = options;

  return unstable_cache(fn, keyParts, {
    tags,
    revalidate,
  }) as T;
}

/**
 * 常用缓存时间常量（秒）
 */
export const CACHE_TIMES = {
  SHORT: 60, // 1分钟
  MEDIUM: 300, // 5分钟
  LONG: 3600, // 1小时
  DAY: 86400, // 1天
} as const;

/**
 * 缓存标签常量
 */
export const CACHE_TAGS = {
  USERS: "users",
  SHOPS: "shops",
  PRODUCTS: "products",
  ORDERS: "orders",
  PLATFORM_PRODUCTS: "platform-products",
  SYNC_LOGS: "sync-logs",
} as const;
