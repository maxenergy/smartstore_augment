/**
 * 订单服务层
 * 封装订单相关的业务逻辑
 */

import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError, UnauthorizedError } from "@/lib/errors";
import type { OrderStatus, Platform } from "@prisma/client";

export interface OrderFilters {
  userId?: string;
  shopId?: string;
  status?: OrderStatus;
  platform?: Platform;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface OrderCreateInput {
  orderNumber: string;
  userId: string;
  shopId: string;
  platform: Platform;
  totalAmount: number;
  currency?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: string;
  items: string;
  notes?: string;
}

export interface OrderUpdateInput {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  items?: string;
  notes?: string;
}

export class OrderService {
  /**
   * 获取订单列表（支持分页和筛选）
   */
  async getOrders(
    filters: OrderFilters,
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) {
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.shopId) {
      where.shopId = filters.shopId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.platform) {
      where.platform = filters.platform;
    }

    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search } },
        { customerName: { contains: filters.search } },
        { customerEmail: { contains: filters.search } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    // 查询订单
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          shop: {
            select: {
              id: true,
              shopName: true,
              platform: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 根据ID获取订单详情
   */
  async getOrderById(id: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shop: {
          select: {
            id: true,
            shopName: true,
            platform: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError("订单不存在");
    }

    // 权限检查：只有订单所有者可以查看
    if (userId && order.userId !== userId) {
      throw new UnauthorizedError("无权访问此订单");
    }

    return order;
  }

  /**
   * 创建订单
   */
  async createOrder(data: OrderCreateInput) {
    // 验证订单编号唯一性
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: data.orderNumber },
    });

    if (existingOrder) {
      throw new ValidationError("订单编号已存在");
    }

    // 验证店铺存在且属于用户
    const shop = await prisma.shop.findUnique({
      where: { id: data.shopId },
    });

    if (!shop) {
      throw new NotFoundError("店铺不存在");
    }

    if (shop.userId !== data.userId) {
      throw new UnauthorizedError("无权在此店铺创建订单");
    }

    // 创建订单
    const order = await prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        shopId: data.shopId,
        platform: data.platform,
        totalAmount: data.totalAmount,
        currency: data.currency || "USD",
        status: "PENDING",
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        items: data.items,
        notes: data.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shop: {
          select: {
            id: true,
            shopName: true,
            platform: true,
          },
        },
      },
    });

    return order;
  }

  /**
   * 更新订单信息
   */
  async updateOrder(id: string, data: OrderUpdateInput, userId?: string) {
    // 检查订单是否存在
    const order = await this.getOrderById(id, userId);

    // 更新订单
    const updatedOrder = await prisma.order.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shop: {
          select: {
            id: true,
            shopName: true,
            platform: true,
          },
        },
      },
    });

    return updatedOrder;
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(id: string, status: OrderStatus, userId?: string) {
    // 检查订单是否存在
    const order = await this.getOrderById(id, userId);

    // 验证状态转换规则
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["PAID", "CANCELLED"],
      PAID: ["PROCESSING", "REFUNDED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED", "CANCELLED"],
      DELIVERED: ["REFUNDED"],
      CANCELLED: [],
      REFUNDED: [],
    };

    const allowedStatuses = validTransitions[order.status];
    if (!allowedStatuses.includes(status)) {
      throw new ValidationError(`无法从 ${order.status} 状态转换到 ${status} 状态`);
    }

    // 更新状态和相关时间戳
    const updateData: any = { status };

    if (status === "PAID" && !order.paidAt) {
      updateData.paidAt = new Date();
    }

    if (status === "SHIPPED" && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }

    if (status === "DELIVERED" && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shop: {
          select: {
            id: true,
            shopName: true,
            platform: true,
          },
        },
      },
    });

    return updatedOrder;
  }

  /**
   * 获取订单统计信息
   */
  async getOrderStats(userId?: string) {
    const where: any = userId ? { userId } : {};

    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: "PENDING" } }),
      prisma.order.count({ where: { ...where, status: "PAID" } }),
      prisma.order.count({ where: { ...where, status: "PROCESSING" } }),
      prisma.order.count({ where: { ...where, status: "SHIPPED" } }),
      prisma.order.count({ where: { ...where, status: "DELIVERED" } }),
      prisma.order.count({ where: { ...where, status: "CANCELLED" } }),
      prisma.order.aggregate({
        where: { ...where, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }
}
