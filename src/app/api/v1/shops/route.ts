/**
 * 店铺列表 API
 * GET /api/v1/shops - 获取店铺列表（支持分页、筛选、搜索、排序）
 * POST /api/v1/shops - 创建店铺
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { validateQueryParams, validateRequestBody } from "@/lib/validate-request";
import { shopListQuerySchema, createShopSchema } from "@/lib/validations/shop";
import { shopService } from "@/services/shop.service";
import { createPaginatedResponse } from "@/lib/pagination";
import { successResponse } from "@/lib/api-response";

/**
 * GET /api/v1/shops
 * 获取店铺列表
 * 权限：用户只能查看自己的店铺，管理员可查看所有
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const currentUser = authResult.session.user;

    // 验证查询参数
    const queryParams = await validateQueryParams(request, shopListQuerySchema);

    // 权限检查：非管理员只能查看自己的店铺
    const userId = currentUser.role === "ADMIN" ? undefined : currentUser.id;

    // 调用服务层获取店铺列表
    const { shops, total } = await shopService.getShops({
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      userId,
      platform: queryParams.platform,
      status: queryParams.status,
      search: queryParams.search,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });

    // 创建分页响应
    const paginatedData = createPaginatedResponse(
      shops,
      queryParams.page,
      queryParams.pageSize,
      total
    );

    // 返回成功响应
    return successResponse(paginatedData);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/v1/shops
 * 创建店铺
 * 权限：所有登录用户
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const currentUser = authResult.session.user;

    // 验证请求体
    const shopData = await validateRequestBody(request, createShopSchema);

    // 创建店铺
    const shop = await shopService.createShop(shopData, currentUser.id);

    // 返回成功响应
    return successResponse(shop, 201);
  } catch (error) {
    return handleError(error);
  }
}
