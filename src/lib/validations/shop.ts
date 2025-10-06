/**
 * 店铺相关的验证 Schema
 */

import { z } from "zod";
import { Platform, ShopStatus } from "@prisma/client";

/**
 * 店铺列表查询参数 Schema
 */
export const shopListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  platform: z.nativeEnum(Platform).optional(),
  status: z.nativeEnum(ShopStatus).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "platform", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * 店铺ID参数 Schema
 */
export const shopIdSchema = z.object({
  id: z.string().uuid("无效的店铺ID"),
});

/**
 * 创建店铺 Schema
 */
export const createShopSchema = z.object({
  name: z.string().min(1, "店铺名称不能为空").max(100, "店铺名称过长"),
  platform: z.nativeEnum(Platform, {
    errorMap: () => ({ message: "无效的平台类型" }),
  }),
  platformShopId: z.string().optional(),
  platformShopUrl: z.string().url("无效的店铺URL").optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

/**
 * 更新店铺 Schema
 */
export const updateShopSchema = z.object({
  name: z.string().min(1, "店铺名称不能为空").max(100, "店铺名称过长").optional(),
  platformShopId: z.string().optional(),
  platformShopUrl: z.string().url("无效的店铺URL").optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  status: z
    .nativeEnum(ShopStatus, {
      errorMap: () => ({ message: "无效的店铺状态" }),
    })
    .optional(),
});

/**
 * 更新店铺状态 Schema
 */
export const updateShopStatusSchema = z.object({
  status: z.nativeEnum(ShopStatus, {
    errorMap: () => ({ message: "无效的店铺状态" }),
  }),
});

// 导出类型
export type ShopListQuery = z.infer<typeof shopListQuerySchema>;
export type ShopId = z.infer<typeof shopIdSchema>;
export type CreateShop = z.infer<typeof createShopSchema>;
export type UpdateShop = z.infer<typeof updateShopSchema>;
export type UpdateShopStatus = z.infer<typeof updateShopStatusSchema>;
