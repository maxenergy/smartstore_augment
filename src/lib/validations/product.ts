/**
 * 产品相关的验证 Schema
 */

import { z } from "zod";
import { ProductStatus, Platform } from "@prisma/client";

/**
 * 产品列表查询参数 Schema
 */
export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(ProductStatus).optional(),
  sourcePlatform: z.nativeEnum(Platform).optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "title", "price", "rating", "reviewCount", "status"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * 产品ID参数 Schema
 */
export const productIdSchema = z.object({
  id: z.string().cuid("无效的产品ID"),
});

/**
 * 创建产品 Schema
 */
export const createProductSchema = z.object({
  sourcePlatform: z.nativeEnum(Platform, {
    errorMap: () => ({ message: "无效的平台类型" }),
  }),
  sourceProductId: z.string().min(1, "源平台产品ID不能为空"),
  title: z.string().min(1, "产品标题不能为空").max(500, "产品标题过长"),
  description: z.string().max(5000, "产品描述过长").optional(),
  price: z.number().min(0, "价格不能为负数"),
  currency: z.string().length(3, "货币代码必须为3个字符").default("USD"),
  images: z.string().min(1, "产品图片不能为空"), // JSON数组格式
  specifications: z.string().optional(), // JSON格式
  category: z.string().max(100, "分类名称过长").optional(),
  tags: z.string().optional(), // JSON数组格式
  rating: z.number().min(0).max(5, "评分必须在0-5之间").optional(),
  reviewCount: z.number().int().min(0, "评论数量不能为负数").optional(),
});

/**
 * 更新产品 Schema
 */
export const updateProductSchema = z.object({
  title: z.string().min(1, "产品标题不能为空").max(500, "产品标题过长").optional(),
  description: z.string().max(5000, "产品描述过长").optional(),
  price: z.number().min(0, "价格不能为负数").optional(),
  currency: z.string().length(3, "货币代码必须为3个字符").optional(),
  images: z.string().optional(),
  specifications: z.string().optional(),
  category: z.string().max(100, "分类名称过长").optional(),
  tags: z.string().optional(),
  rating: z.number().min(0).max(5, "评分必须在0-5之间").optional(),
  reviewCount: z.number().int().min(0, "评论数量不能为负数").optional(),
  status: z
    .nativeEnum(ProductStatus, {
      errorMap: () => ({ message: "无效的产品状态" }),
    })
    .optional(),
});

/**
 * 更新产品状态 Schema
 */
export const updateProductStatusSchema = z.object({
  status: z.nativeEnum(ProductStatus, {
    errorMap: () => ({ message: "无效的产品状态" }),
  }),
});

// 导出类型
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type ProductId = z.infer<typeof productIdSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type UpdateProductStatus = z.infer<typeof updateProductStatusSchema>;
