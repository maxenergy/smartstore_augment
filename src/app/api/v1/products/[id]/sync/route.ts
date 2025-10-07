/**
 * 产品同步 API
 * POST /api/v1/products/:id/sync - 同步单个产品
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSyncService, SyncType } from "@/services/product-sync.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

/**
 * 同步请求 Schema
 */
const syncRequestSchema = z.object({
  syncType: z.enum(["PRICE", "STOCK", "INFO", "ALL"]),
});

/**
 * POST /api/v1/products/:id/sync
 * 同步单个产品
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse("未授权访问", 401);
    }

    // 解析请求体
    const body = await request.json();

    // 验证请求参数
    const validation = syncRequestSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("请求参数无效", 400, validation.error.errors);
    }

    const { syncType } = validation.data;
    const productId = params.id;

    // 执行同步
    const result = await productSyncService.syncProduct(productId, syncType as SyncType);

    if (result.success) {
      return successResponse(result, "同步成功");
    } else {
      return errorResponse(result.message, 400);
    }
  } catch (error: any) {
    console.error("Product sync error:", error);
    return errorResponse(error.message || "同步失败", 500);
  }
}

