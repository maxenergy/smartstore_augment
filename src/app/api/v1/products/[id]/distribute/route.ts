/**
 * 产品分销 API
 * POST /api/v1/products/[id]/distribute - 将产品分发到指定店铺
 */

import { NextRequest, NextResponse } from "next/server";
import { PlatformProductService } from "@/services/platform-product.service";
import { requireAuth } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { successResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/validate-request";
import {
  distributeProductSchema,
  type DistributeProductInput,
} from "@/lib/validations/platform-product";
import { hasPermission } from "@/lib/permissions";

const platformProductService = new PlatformProductService();

/**
 * POST /api/v1/products/[id]/distribute
 * 将产品分发到指定店铺
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params;

    // 认证检查
    const { error, session } = await requireAuth();
    if (error) return error;

    // 权限检查
    if (!hasPermission(session!.user.role, "products:create")) {
      return NextResponse.json({ success: false, error: "无权分发产品" }, { status: 403 });
    }

    // 验证请求体
    const body = await request.json();
    const validationResult = validateRequest(distributeProductSchema, body);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const data = validationResult.data as DistributeProductInput;

    // 获取店铺信息以确定平台
    const { prisma } = await import("@/lib/prisma");
    const shop = await prisma.shop.findUnique({
      where: { id: data.shopId },
    });

    if (!shop) {
      return NextResponse.json({ success: false, error: "店铺不存在" }, { status: 404 });
    }

    // 创建平台产品
    const platformProduct = await platformProductService.createPlatformProduct(
      {
        productId,
        shopId: data.shopId,
        platformProductId: data.platformProductId,
        platform: shop.platform,
        price: data.price,
        inventory: data.inventory,
      },
      session!.user.id
    );

    return successResponse(platformProduct, "产品分发成功", 201);
  } catch (err) {
    return handleError(err);
  }
}
