/**
 * 订单状态更新 API
 * PATCH /api/v1/orders/[id]/status - 更新订单状态
 */

import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import { requireAuth, requireOwnerOrAdmin } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/error-handler";
import { successResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/validate-request";
import { updateOrderStatusSchema } from "@/lib/validations/order";

const orderService = new OrderService();

/**
 * PATCH /api/v1/orders/[id]/status
 * 更新订单状态
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const validationResult = validateRequest(updateOrderStatusSchema, body);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const { status } = validationResult.data;

    // 更新订单状态
    const updatedOrder = await orderService.updateOrderStatus(id, status);

    return successResponse(updatedOrder, "订单状态更新成功");
  } catch (err) {
    return handleApiError(err);
  }
}
