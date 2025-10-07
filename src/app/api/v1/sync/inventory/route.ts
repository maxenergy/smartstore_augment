/**
 * 批量同步库存 API
 * POST /api/v1/sync/inventory - 批量同步平台产品库存
 */

import { NextRequest, NextResponse } from "next/server";
import { SyncService } from "@/services/sync.service";
import { requireAuth } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { successResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/validate-request";
import { batchSyncInventorySchema, type BatchSyncInventoryInput } from "@/lib/validations/sync";
import { hasPermission } from "@/lib/permissions";

const syncService = new SyncService();

/**
 * POST /api/v1/sync/inventory
 * 批量同步平台产品库存
 */
export async function POST(request: NextRequest) {
  try {
    // 认证检查
    const { error, session } = await requireAuth();
    if (error) return error;

    // 权限检查
    if (!hasPermission(session!.user.role, "products:update")) {
      return NextResponse.json({ success: false, error: "无权同步库存" }, { status: 403 });
    }

    // 验证请求体
    const body = await request.json();
    const validationResult = validateRequest(batchSyncInventorySchema, body);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const data = validationResult.data as BatchSyncInventoryInput;

    // 批量同步库存
    const result = await syncService.syncInventory(data.items, session!.user.id);

    return successResponse(result, "库存同步完成");
  } catch (err) {
    return handleError(err);
  }
}
