/**
 * 批量产品同步 API
 * POST /api/v1/products/sync/batch - 批量同步产品
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSyncService, SyncType } from "@/services/product-sync.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

/**
 * 批量同步请求 Schema
 */
const batchSyncRequestSchema = z.object({
  productIds: z.array(z.string()).min(1, "至少选择一个产品").max(50, "最多同时同步50个产品"),
  syncType: z.enum(["PRICE", "STOCK", "INFO", "ALL"]),
});

/**
 * POST /api/v1/products/sync/batch
 * 批量同步产品
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse("未授权访问", 401);
    }

    // 解析请求体
    const body = await request.json();

    // 验证请求参数
    const validation = batchSyncRequestSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("请求参数无效", 400, validation.error.errors);
    }

    const { productIds, syncType } = validation.data;

    // 执行批量同步
    const result = await productSyncService.syncBatch(productIds, syncType as SyncType);

    return successResponse(result, `批量同步完成，成功 ${result.success} 个，失败 ${result.failed} 个`);
  } catch (error: any) {
    console.error("Batch sync error:", error);
    return errorResponse(error.message || "批量同步失败", 500);
  }
}

