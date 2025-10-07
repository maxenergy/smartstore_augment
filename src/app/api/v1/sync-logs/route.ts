/**
 * 同步日志 API
 * GET /api/v1/sync-logs - 获取所有同步日志
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSyncService } from "@/services/product-sync.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { Platform } from "@prisma/client";

/**
 * GET /api/v1/sync-logs
 * 获取所有同步日志（支持分页和筛选）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse("未授权访问", 401);
    }

    const { searchParams } = new URL(request.url);

    // 解析查询参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const platform = searchParams.get("platform") as Platform | null;
    const status = searchParams.get("status");

    // 获取同步日志
    const result = await productSyncService.getAllSyncLogs({
      page,
      pageSize,
      platform: platform || undefined,
      status: status || undefined,
    });

    return successResponse(result.data, "获取同步日志成功", {
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Get all sync logs error:", error);
    return errorResponse(error.message || "获取同步日志失败", 500);
  }
}

