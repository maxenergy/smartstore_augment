/**
 * 产品搜索 API
 * POST /api/v1/products/search - 从第三方平台搜索产品
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { validateRequestBody } from "@/lib/validate-request";
import { productSearchSchema } from "@/lib/validations/product";
import { platformSearchService } from "@/services/platform-search.service";
import { successResponse } from "@/lib/api-response";

/**
 * POST /api/v1/products/search
 * 从第三方平台搜索产品
 * 权限：需要登录
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    // 验证请求体
    const body = await validateRequestBody(request, productSearchSchema);

    // 调用平台搜索服务
    const searchResult = await platformSearchService.searchProducts({
      platform: body.platform,
      keyword: body.keyword,
      filters: body.filters,
      page: body.page,
      pageSize: body.pageSize,
    });

    // 返回搜索结果
    return successResponse({
      data: searchResult.items,
      meta: {
        pagination: searchResult.pagination,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

