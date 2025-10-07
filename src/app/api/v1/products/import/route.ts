/**
 * 产品批量导入 API
 * POST /api/v1/products/import - 批量导入产品到系统
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { validateRequestBody } from "@/lib/validate-request";
import { productImportSchema } from "@/lib/validations/product";
import { productImportService } from "@/services/product-import.service";
import { successResponse } from "@/lib/api-response";

/**
 * POST /api/v1/products/import
 * 批量导入产品到系统
 * 权限：需要登录
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
    const body = await validateRequestBody(request, productImportSchema);

    // 调用产品导入服务
    const importResult = await productImportService.importProducts(
      body.products,
      currentUser.id,
      body.platform,
      body.pricingStrategy
    );

    // 返回导入结果
    return successResponse({
      data: {
        imported: importResult.imported,
        failed: importResult.failed,
        products: importResult.products,
      },
      meta: {
        message: `成功导入 ${importResult.imported} 个产品，失败 ${importResult.failed} 个`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

