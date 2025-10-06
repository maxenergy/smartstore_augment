/**
 * 店铺详情 API
 * GET /api/v1/shops/[id] - 获取店铺详情（包含关联产品信息）
 * PUT /api/v1/shops/[id] - 更新店铺信息
 * DELETE /api/v1/shops/[id] - 删除店铺
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { validatePathParams, validateRequestBody } from "@/lib/validate-request";
import { shopIdSchema, updateShopSchema } from "@/lib/validations/shop";
import { shopService } from "@/services/shop.service";
import { successResponse } from "@/lib/api-response";

/**
 * GET /api/v1/shops/[id]
 * 获取店铺详情
 * 权限：店铺所有者或管理员
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
    const { id } = validatePathParams(params, shopIdSchema);

    // 获取店铺详情
    const shop = await shopService.getShopById(id);

    // 权限检查：非管理员只能查看自己的店铺
    if (currentUser.role !== "ADMIN" && shop.userId !== currentUser.id) {
      return handleError(new Error("无权查看此店铺"));
    }

    // 返回成功响应
    return successResponse(shop);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/v1/shops/[id]
 * 更新店铺信息
 * 权限：店铺所有者或管理员
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
    const { id } = validatePathParams(params, shopIdSchema);

    // 验证请求体
    const updateData = await validateRequestBody(request, updateShopSchema);

    // 更新店铺信息
    const isAdmin = currentUser.role === "ADMIN";
    const shop = await shopService.updateShop(id, updateData, currentUser.id, isAdmin);

    // 返回成功响应
    return successResponse(shop);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/v1/shops/[id]
 * 删除店铺
 * 权限：店铺所有者或管理员
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
    const { id } = validatePathParams(params, shopIdSchema);

    // 删除店铺
    const isAdmin = currentUser.role === "ADMIN";
    await shopService.deleteShop(id, currentUser.id, isAdmin);

    // 返回成功响应
    return successResponse(null);
  } catch (error) {
    return handleError(error);
  }
}
