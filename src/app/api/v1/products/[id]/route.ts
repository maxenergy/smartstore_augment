/**
 * 产品详情 API
 * GET /api/v1/products/[id] - 获取产品详情（包含平台分销信息）
 * PUT /api/v1/products/[id] - 更新产品信息
 * DELETE /api/v1/products/[id] - 删除产品
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { validatePathParams, validateRequestBody } from "@/lib/validate-request";
import { productIdSchema, updateProductSchema } from "@/lib/validations/product";
import { productService } from "@/services/product.service";
import { successResponse } from "@/lib/api-response";
import { ForbiddenError } from "@/lib/errors";

/**
 * GET /api/v1/products/[id]
 * 获取产品详情
 * 权限：产品所有者或管理员
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证用户登录
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const currentUser = authResult.session.user;

    // 验证路径参数
    const { id } = validatePathParams(params, productIdSchema);

    // 获取产品详情
    const product = await productService.getProductById(id);

    // 权限检查：非管理员只能查看自己的产品
    if (currentUser.role !== "ADMIN" && product.userId !== currentUser.id) {
      throw new ForbiddenError("无权查看此产品");
    }

    // 返回成功响应
    return successResponse(product);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/v1/products/[id]
 * 更新产品信息
 * 权限：产品所有者或管理员
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const updateData = await validateRequestBody(request, updateProductSchema);

    // 更新产品信息
    const isAdmin = currentUser.role === "ADMIN";
    const product = await productService.updateProduct(id, updateData, currentUser.id, isAdmin);

    // 返回成功响应
    return successResponse(product);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/v1/products/[id]
 * 删除产品
 * 权限：产品所有者或管理员
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证用户登录
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const currentUser = authResult.session.user;

    // 验证路径参数
    const { id } = validatePathParams(params, productIdSchema);

    // 删除产品
    const isAdmin = currentUser.role === "ADMIN";
    await productService.deleteProduct(id, currentUser.id, isAdmin);

    // 返回成功响应
    return successResponse(null);
  } catch (error) {
    return handleError(error);
  }
}
