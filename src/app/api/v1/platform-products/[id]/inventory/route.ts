/**
 * 库存同步 API
 * PATCH /api/v1/platform-products/[id]/inventory - 更新平台产品库存
 */

import { NextRequest, NextResponse } from "next/server";
import { PlatformProductService } from "@/services/platform-product.service";
import { requireAuth } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { successResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/validate-request";
import { syncInventorySchema } from "@/lib/validations/platform-product";
import { hasPermission } from "@/lib/permissions";

const platformProductService = new PlatformProductService();

/**
 * PATCH /api/v1/platform-products/[id]/inventory
 * 更新平台产品库存
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 认证检查
    const { error, session } = await requireAuth();
    if (error) return error;

    // 权限检查
    if (!hasPermission(session!.user.role, "products:update")) {
      return NextResponse.json({ success: false, error: "无权更新库存" }, { status: 403 });
    }

    // 验证请求体
    const body = await request.json();
    const validationResult = validateRequest(syncInventorySchema, body);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const { inventory } = validationResult.data;

    // 更新库存
    const updatedPlatformProduct = await platformProductService.syncInventory(
      id,
      inventory,
      session!.user.id
    );

    return successResponse(updatedPlatformProduct, "库存更新成功");
  } catch (err) {
    return handleError(err);
  }
}
