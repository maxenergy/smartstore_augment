import { z } from "zod";

/**
 * 分页参数 Schema
 * 用于验证分页查询参数
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * 分页参数类型
 */
export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * 分页响应接口
 * 用于返回分页数据
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * 计算分页信息
 * 根据当前页、每页大小和总数计算分页元数据
 *
 * @param page 当前页码（从 1 开始）
 * @param pageSize 每页大小
 * @param total 总记录数
 * @returns 分页元数据
 */
export function calculatePagination(page: number, pageSize: number, total: number) {
  const totalPages = Math.ceil(total / pageSize);

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * 获取 Prisma 分页参数
 * 将页码和每页大小转换为 Prisma 的 skip 和 take 参数
 *
 * @param page 当前页码（从 1 开始）
 * @param pageSize 每页大小
 * @returns Prisma 分页参数 { skip, take }
 */
export function getPaginationParams(page: number, pageSize: number) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * 创建分页响应
 * 将数据和分页信息组合成标准的分页响应格式
 *
 * @param data 数据数组
 * @param page 当前页码
 * @param pageSize 每页大小
 * @param total 总记录数
 * @returns 分页响应对象
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: calculatePagination(page, pageSize, total),
  };
}

/**
 * 分页查询辅助函数
 * 简化 Prisma 分页查询的代码
 *
 * @param params 分页参数
 * @param queryFn 查询函数（接收 skip 和 take 参数）
 * @param countFn 计数函数（返回总记录数）
 * @returns 分页响应对象
 *
 * @example
 * ```typescript
 * const result = await paginatedQuery(
 *   { page: 1, pageSize: 20 },
 *   (skip, take) => prisma.user.findMany({ skip, take }),
 *   () => prisma.user.count()
 * );
 * ```
 */
export async function paginatedQuery<T>(
  params: PaginationParams,
  queryFn: (skip: number, take: number) => Promise<T[]>,
  countFn: () => Promise<number>
): Promise<PaginatedResponse<T>> {
  const { page, pageSize } = params;
  const { skip, take } = getPaginationParams(page, pageSize);

  // 并行执行查询和计数
  const [data, total] = await Promise.all([queryFn(skip, take), countFn()]);

  return createPaginatedResponse(data, page, pageSize, total);
}

/**
 * 排序参数 Schema
 * 用于验证排序查询参数
 */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * 排序参数类型
 */
export type SortParams = z.infer<typeof sortSchema>;

/**
 * 分页和排序参数 Schema
 * 组合分页和排序参数
 */
export const paginationWithSortSchema = paginationSchema.merge(sortSchema);

/**
 * 分页和排序参数类型
 */
export type PaginationWithSortParams = z.infer<typeof paginationWithSortSchema>;

/**
 * 创建 Prisma 排序对象
 * 将排序参数转换为 Prisma 的 orderBy 格式
 *
 * @param sortBy 排序字段
 * @param sortOrder 排序方向
 * @returns Prisma orderBy 对象
 */
export function createOrderBy(
  sortBy?: string,
  sortOrder: "asc" | "desc" = "desc"
): Record<string, "asc" | "desc"> | undefined {
  if (!sortBy) {
    return undefined;
  }

  return {
    [sortBy]: sortOrder,
  };
}

/**
 * 搜索参数 Schema
 * 用于验证搜索查询参数
 */
export const searchSchema = z.object({
  search: z.string().optional(),
  searchFields: z.array(z.string()).optional(),
});

/**
 * 搜索参数类型
 */
export type SearchParams = z.infer<typeof searchSchema>;

/**
 * 完整查询参数 Schema
 * 组合分页、排序和搜索参数
 */
export const fullQuerySchema = paginationWithSortSchema.merge(searchSchema);

/**
 * 完整查询参数类型
 */
export type FullQueryParams = z.infer<typeof fullQuerySchema>;

/**
 * 创建 Prisma 搜索条件
 * 将搜索参数转换为 Prisma 的 where 条件
 *
 * @param search 搜索关键词
 * @param searchFields 搜索字段列表
 * @returns Prisma where 条件
 */
export function createSearchCondition(
  search?: string,
  searchFields?: string[]
): { OR?: Array<Record<string, { contains: string; mode: "insensitive" }>> } {
  if (!search || !searchFields || searchFields.length === 0) {
    return {};
  }

  return {
    OR: searchFields.map((field) => ({
      [field]: {
        contains: search,
        mode: "insensitive" as const,
      },
    })),
  };
}

/**
 * 游标分页参数 Schema
 * 用于基于游标的分页（适用于大数据集）
 */
export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * 游标分页参数类型
 */
export type CursorPaginationParams = z.infer<typeof cursorPaginationSchema>;

/**
 * 游标分页响应接口
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

/**
 * 创建游标分页响应
 * 用于基于游标的分页
 *
 * @param data 数据数组
 * @param limit 每页大小
 * @param getCursor 获取游标的函数
 * @returns 游标分页响应对象
 */
export function createCursorPaginatedResponse<T>(
  data: T[],
  limit: number,
  getCursor: (item: T) => string
): CursorPaginatedResponse<T> {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? getCursor(items[items.length - 1]) : null;

  return {
    data: items,
    pagination: {
      nextCursor,
      hasMore,
      limit,
    },
  };
}
