/**
 * 产品列表 API
 * GET /api/v1/products - 获取产品列表（支持分页、筛选、搜索、排序）
 * POST /api/v1/products - 创建产品
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { validateQueryParams, validateRequestBody } from "@/lib/validate-request";
import { productListQuerySchema, createProductSchema } from "@/lib/validations/product";
import { productService } from "@/services/product.service";
import { createPaginatedResponse } from "@/lib/pagination";
import { successResponse } from "@/lib/api-response";

/**
 * GET /api/v1/products
 * 获取产品列表
 * 权限：用户只能查看自己的产品，管理员可查看所有
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
    const queryParams = await validateQueryParams(request, productListQuerySchema);

    // 权限检查：非管理员只能查看自己的产品
    const userId = currentUser.role === "ADMIN" ? undefined : currentUser.id;

    // 调用服务层获取产品列表
    const { products, total } = await productService.getProducts({
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      userId,
      status: queryParams.status,
      sourcePlatform: queryParams.sourcePlatform,
      category: queryParams.category,
      minPrice: queryParams.minPrice,
      maxPrice: queryParams.maxPrice,
      minRating: queryParams.minRating,
      search: queryParams.search,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });

    // 创建分页响应
    const paginatedData = createPaginatedResponse(
      products,
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
 * POST /api/v1/products
 * 创建产品
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
    const productData = await validateRequestBody(request, createProductSchema);

    // 创建产品
    const product = await productService.createProduct(productData, currentUser.id);

    // 返回成功响应
    return successResponse(product, 201);
  } catch (error) {
    return handleError(error);
  }
}
