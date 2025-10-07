/**
 * 订单详情、更新 API
 * GET /api/v1/orders/[id] - 获取订单详情
 * PUT /api/v1/orders/[id] - 更新订单
 */

import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import { requireAuth, requireOwnerOrAdmin } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { successResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/validate-request";
import { updateOrderSchema, type UpdateOrderInput } from "@/lib/validations/order";

const orderService = new OrderService();

/**
 * GET /api/v1/orders/[id]
 * 获取订单详情
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 认证检查
    const { error, session } = await requireAuth();
    if (error) return error;

    // 获取订单
    const order = await orderService.getOrderById(id);

    // 权限检查：订单所有者或管理员
    const ownerCheck = await requireOwnerOrAdmin(
      session!.user.id,
      session!.user.role,
      order.userId
    );
    if (ownerCheck.error) return ownerCheck.error;

    return successResponse(order);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PUT /api/v1/orders/[id]
 * 更新订单
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 认证检查
    const { error, session } = await requireAuth();
    if (error) return error;

    // 获取订单
    const order = await orderService.getOrderById(id);

    // 权限检查：订单所有者或管理员
    const ownerCheck = await requireOwnerOrAdmin(
      session!.user.id,
      session!.user.role,
      order.userId
    );
    if (ownerCheck.error) return ownerCheck.error;

    // 验证请求体
    const body = await request.json();
    const validationResult = validateRequest(updateOrderSchema, body);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const data = validationResult.data as UpdateOrderInput;

    // 转换数据格式
    const updateData: any = { ...data };
    if (data.shippingAddress) {
      updateData.shippingAddress = JSON.stringify(data.shippingAddress);
    }
    if (data.items) {
      updateData.items = JSON.stringify(data.items);
    }

    // 更新订单
    const updatedOrder = await orderService.updateOrder(id, updateData);

    return successResponse(updatedOrder, "订单更新成功");
  } catch (err) {
    return handleError(err);
  }
}
