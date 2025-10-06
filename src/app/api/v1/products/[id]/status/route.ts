/**
 * 产品状态更新 API
 * PATCH /api/v1/products/[id]/status - 更新产品状态
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { validatePathParams, validateRequestBody } from "@/lib/validate-request";
import { productIdSchema, updateProductStatusSchema } from "@/lib/validations/product";
import { productService } from "@/services/product.service";
import { successResponse } from "@/lib/api-response";

/**
 * PATCH /api/v1/products/[id]/status
 * 更新产品状态
 * 权限：产品所有者或管理员
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证用户登录
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const currentUser = authResult.session.user;

    // 验证路径参数
    const { id } = validatePathParams(params, productIdSchema);

    // 验证请求体
    const { status } = await validateRequestBody(request, updateProductStatusSchema);

    // 更新产品状态
    const isAdmin = currentUser.role === "ADMIN";
    const product = await productService.updateProductStatus(id, status, currentUser.id, isAdmin);

    // 返回成功响应
    return successResponse(product);
  } catch (error) {
    return handleError(error);
  }
}
