/**
 * API 速率限制工具
 * 基于 IP 地址的简单速率限制实现
 */

import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// 内存存储（生产环境建议使用 Redis）
const store = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  /**
   * 时间窗口（毫秒）
   */
  windowMs?: number;
  /**
   * 最大请求数
   */
  max?: number;
  /**
   * 自定义错误消息
   */
  message?: string;
}

/**
 * 获取客户端 IP 地址
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * 速率限制中间件
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000, // 默认1分钟
    max = 100, // 默认100次请求
    message = "请求过于频繁，请稍后再试",
  } = options;

  return async (request: NextRequest) => {
    const ip = getClientIp(request);
    const now = Date.now();
    const key = `rate-limit:${ip}`;

    // 获取或创建速率限制记录
    let record = store.get(key);

    // 如果记录不存在或已过期，创建新记录
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      store.set(key, record);
    }

    // 增加计数
    record.count++;

    // 检查是否超过限制
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      return NextResponse.json(
        {
          success: false,
          error: message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": max.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(record.resetTime).toISOString(),
          },
        }
      );
    }

    // 返回 null 表示通过速率限制
    return null;
  };
}

/**
 * 清理过期的速率限制记录（定期调用）
 */
export function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}

// 每5分钟清理一次过期记录
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredRecords, 5 * 60 * 1000);
}
