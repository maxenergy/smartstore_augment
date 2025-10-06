/**
 * 订单验证 Schema
 */

import { z } from "zod";

// 订单状态枚举
export const orderStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

// 平台枚举
export const platformSchema = z.enum(["AMAZON", "TIKTOK", "SHOPIFY", "OWN"]);

// 订单项 Schema
export const orderItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, "产品名称不能为空"),
  quantity: z.number().int().positive("数量必须大于0"),
  price: z.number().positive("价格必须大于0"),
  total: z.number().positive("总价必须大于0"),
});

// 收货地址 Schema
export const shippingAddressSchema = z.object({
  country: z.string().min(1, "国家不能为空"),
  state: z.string().optional(),
  city: z.string().min(1, "城市不能为空"),
  address: z.string().min(1, "地址不能为空"),
  postalCode: z.string().min(1, "邮编不能为空"),
});

// 创建订单 Schema
export const createOrderSchema = z.object({
  orderNumber: z.string().min(1, "订单编号不能为空"),
  shopId: z.string().min(1, "店铺ID不能为空"),
  platform: platformSchema,
  totalAmount: z.number().positive("订单总金额必须大于0"),
  currency: z.string().default("USD"),
  customerName: z.string().min(1, "客户姓名不能为空"),
  customerEmail: z.string().email("邮箱格式不正确").optional(),
  customerPhone: z.string().optional(),
  shippingAddress: shippingAddressSchema,
  items: z.array(orderItemSchema).min(1, "订单项不能为空"),
  notes: z.string().optional(),
});

// 更新订单 Schema
export const updateOrderSchema = z.object({
  customerName: z.string().min(1, "客户姓名不能为空").optional(),
  customerEmail: z.string().email("邮箱格式不正确").optional(),
  customerPhone: z.string().optional(),
  shippingAddress: shippingAddressSchema.optional(),
  items: z.array(orderItemSchema).min(1, "订单项不能为空").optional(),
  notes: z.string().optional(),
});

// 更新订单状态 Schema
export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

// 订单查询参数 Schema
export const orderQuerySchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("10"),
  status: orderStatusSchema.optional(),
  platform: platformSchema.optional(),
  shopId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// 类型导出
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryParams = z.infer<typeof orderQuerySchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
