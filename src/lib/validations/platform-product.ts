/**
 * 平台产品验证 Schema
 */

import { z } from "zod";

// 平台产品状态枚举
export const platformProductStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

// 平台枚举
export const platformSchema = z.enum(["AMAZON", "TIKTOK", "SHOPIFY", "OWN"]);

// 创建平台产品 Schema
export const createPlatformProductSchema = z.object({
  productId: z.string().min(1, "产品ID不能为空"),
  shopId: z.string().min(1, "店铺ID不能为空"),
  platformProductId: z.string().min(1, "平台产品ID不能为空"),
  platform: platformSchema,
  price: z.number().positive("价格必须大于0"),
  inventory: z.number().int().min(0, "库存不能为负数"),
});

// 更新平台产品 Schema
export const updatePlatformProductSchema = z.object({
  platformProductId: z.string().min(1, "平台产品ID不能为空").optional(),
  price: z.number().positive("价格必须大于0").optional(),
  inventory: z.number().int().min(0, "库存不能为负数").optional(),
  status: platformProductStatusSchema.optional(),
});

// 同步库存 Schema
export const syncInventorySchema = z.object({
  inventory: z.number().int().min(0, "库存不能为负数"),
});

// 同步价格 Schema
export const syncPriceSchema = z.object({
  price: z.number().positive("价格必须大于0"),
});

// 产品分销 Schema
export const distributeProductSchema = z.object({
  shopId: z.string().min(1, "店铺ID不能为空"),
  platformProductId: z.string().min(1, "平台产品ID不能为空"),
  price: z.number().positive("价格必须大于0"),
  inventory: z.number().int().min(0, "库存不能为负数"),
});

// 平台产品查询参数 Schema
export const platformProductQuerySchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("10"),
  productId: z.string().optional(),
  shopId: z.string().optional(),
  platform: platformSchema.optional(),
  status: platformProductStatusSchema.optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// 类型导出
export type CreatePlatformProductInput = z.infer<typeof createPlatformProductSchema>;
export type UpdatePlatformProductInput = z.infer<typeof updatePlatformProductSchema>;
export type SyncInventoryInput = z.infer<typeof syncInventorySchema>;
export type SyncPriceInput = z.infer<typeof syncPriceSchema>;
export type DistributeProductInput = z.infer<typeof distributeProductSchema>;
export type PlatformProductQueryParams = z.infer<typeof platformProductQuerySchema>;
