/**
 * 产品同步日志 API
 * GET /api/v1/products/:id/sync-logs - 获取产品的同步日志
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSyncService } from "@/services/product-sync.service";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * GET /api/v1/products/:id/sync-logs
 * 获取产品的同步日志
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse("未授权访问", 401);
    }

    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // 获取同步日志
    const logs = await productSyncService.getSyncLogs(productId, limit);

    return successResponse(logs, "获取同步日志成功");
  } catch (error: any) {
    console.error("Get sync logs error:", error);
    return errorResponse(error.message || "获取同步日志失败", 500);
  }
}

