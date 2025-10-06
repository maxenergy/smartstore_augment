/**
 * 订单列表和创建 API
 * GET /api/v1/orders - 获取订单列表
 * POST /api/v1/orders - 创建订单
 */

import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/error-handler";
import { successResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/validate-request";
import {
  orderQuerySchema,
  createOrderSchema,
  type CreateOrderInput,
} from "@/lib/validations/order";
import { hasPermission } from "@/lib/permissions";

const orderService = new OrderService();

/**
 * GET /api/v1/orders
 * 获取订单列表（支持分页和筛选）
 */
export async function GET(request: NextRequest) {
  try {
    // 认证检查
    const { error, session } = await requireAuth();
    if (error) return error;

    // 验证查询参数
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validatedParams = orderQuerySchema.parse(searchParams);

    // 构建筛选条件
    const filters: any = {};

    // 权限检查：普通用户只能查看自己的订单
    if (!hasPermission(session!.user.role, "orders:read:all")) {
      filters.userId = session!.user.id;
    }

    if (validatedParams.status) {
      filters.status = validatedParams.status;
    }

    if (validatedParams.platform) {
      filters.platform = validatedParams.platform;
    }

    if (validatedParams.shopId) {
      filters.shopId = validatedParams.shopId;
    }

    if (validatedParams.search) {
      filters.search = validatedParams.search;
    }

    if (validatedParams.startDate) {
      filters.startDate = new Date(validatedParams.startDate);
    }

    if (validatedParams.endDate) {
      filters.endDate = new Date(validatedParams.endDate);
    }

    // 获取订单列表
    const result = await orderService.getOrders(
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

/**
 * POST /api/v1/orders
 * 创建订单
 */
export async function POST(request: NextRequest) {
  try {
    // 认证检查
    const { error, session } = await requireAuth();
    if (error) return error;

    // 权限检查
    if (!hasPermission(session!.user.role, "orders:create")) {
      return NextResponse.json({ success: false, error: "无权创建订单" }, { status: 403 });
    }

    // 验证请求体
    const body = await request.json();
    const validationResult = validateRequest(createOrderSchema, body);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const data = validationResult.data as CreateOrderInput;

    // 创建订单
    const order = await orderService.createOrder({
      ...data,
      userId: session!.user.id,
      shippingAddress: JSON.stringify(data.shippingAddress),
      items: JSON.stringify(data.items),
    });

    return successResponse(order, "订单创建成功", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
