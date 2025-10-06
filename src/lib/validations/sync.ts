/**
 * 同步验证 Schema
 */

import { z } from "zod";

// 同步类型枚举
export const syncTypeSchema = z.enum(["INVENTORY", "PRICE", "ORDER"]);

// 实体类型枚举
export const entityTypeSchema = z.enum(["PRODUCT", "PLATFORM_PRODUCT", "ORDER"]);

// 同步状态枚举
export const syncStatusSchema = z.enum(["SUCCESS", "FAILED", "PENDING"]);

// 批量同步库存 Schema
export const batchSyncInventorySchema = z.object({
  items: z.array(
    z.object({
      platformProductId: z.string().min(1, "平台产品ID不能为空"),
      inventory: z.number().int().min(0, "库存不能为负数"),
    })
  ),
});

// 批量同步价格 Schema
export const batchSyncPriceSchema = z.object({
  items: z.array(
    z.object({
      platformProductId: z.string().min(1, "平台产品ID不能为空"),
      price: z.number().positive("价格必须大于0"),
    })
  ),
});

// 同步日志查询参数 Schema
export const syncLogQuerySchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("20"),
  syncType: syncTypeSchema.optional(),
  entityType: entityTypeSchema.optional(),
  status: syncStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// 类型导出
export type BatchSyncInventoryInput = z.infer<typeof batchSyncInventorySchema>;
export type BatchSyncPriceInput = z.infer<typeof batchSyncPriceSchema>;
export type SyncLogQueryParams = z.infer<typeof syncLogQuerySchema>;
