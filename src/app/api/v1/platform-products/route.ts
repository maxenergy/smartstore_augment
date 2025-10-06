/**
 * 平台产品列表 API
 * GET /api/v1/platform-products - 获取平台产品列表
 */

import { NextRequest } from "next/server";
import { PlatformProductService } from "@/services/platform-product.service";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/error-handler";
import { successResponse } from "@/lib/api-response";
import { platformProductQuerySchema } from "@/lib/validations/platform-product";
import { hasPermission } from "@/lib/permissions";

const platformProductService = new PlatformProductService();

/**
 * GET /api/v1/platform-products
 * 获取平台产品列表（支持分页和筛选）
 */
export async function GET(request: NextRequest) {
  try {
    // 认证检查
    const { error, session } = await requireAuth();
    if (error) return error;

    // 验证查询参数
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validatedParams = platformProductQuerySchema.parse(searchParams);

    // 构建筛选条件
    const filters: any = {};

    // 权限检查：普通用户只能查看自己的平台产品
    if (!hasPermission(session!.user.role, "products:read:all")) {
      filters.userId = session!.user.id;
    }

    if (validatedParams.productId) {
      filters.productId = validatedParams.productId;
    }

    if (validatedParams.shopId) {
      filters.shopId = validatedParams.shopId;
    }

    if (validatedParams.platform) {
      filters.platform = validatedParams.platform;
    }

    if (validatedParams.status) {
      filters.status = validatedParams.status;
    }

    // 获取平台产品列表
    const result = await platformProductService.getPlatformProducts(
      filters,
      parseInt(validatedParams.page),
      parseInt(validatedParams.pageSize),
      validatedParams.sortBy,
      validatedParams.sortOrder
    );

    return successResponse(result);
  } catch (err) {
    return handleApiError(err);
  }
}
