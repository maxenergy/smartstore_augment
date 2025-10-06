/**
 * 产品服务层
 * 封装产品相关的业务逻辑
 */

import { prisma } from "@/lib/prisma";
import { Prisma, ProductStatus, Platform } from "@prisma/client";
import { NotFoundError, ConflictError, ForbiddenError } from "@/lib/errors";

/**
 * 产品列表查询参数
 */
export interface GetProductsParams {
  page: number;
  pageSize: number;
  userId?: string;
  status?: ProductStatus;
  sourcePlatform?: Platform;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * 创建产品输入类型
 */
export interface CreateProductInput {
  sourcePlatform: Platform;
  sourceProductId: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  images: string; // JSON数组格式
  specifications?: string; // JSON格式
  category?: string;
  tags?: string; // JSON数组格式
  rating?: number;
  reviewCount?: number;
}

/**
 * 更新产品输入类型
 */
export interface UpdateProductInput {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  images?: string;
  specifications?: string;
  category?: string;
  tags?: string;
  rating?: number;
  reviewCount?: number;
  status?: ProductStatus;
}

/**
 * 产品服务类
 */
export class ProductService {
  /**
   * 获取产品列表
   * 支持分页、筛选、搜索、排序
   */
  async getProducts(params: GetProductsParams) {
    const {
      page,
      pageSize,
      userId,
      status,
      sourcePlatform,
      category,
      minPrice,
      maxPrice,
      minRating,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // 构建查询条件
    const where: Prisma.ProductWhereInput = {
      ...(userId && { userId }),
      ...(status && { status }),
      ...(sourcePlatform && { sourcePlatform }),
      ...(category && { category }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && {
        price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), lte: maxPrice },
      }),
      ...(minRating !== undefined && { rating: { gte: minRating } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // 构建排序条件
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // 并行执行查询和计数
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          userId: true,
          sourcePlatform: true,
          sourceProductId: true,
          title: true,
          description: true,
          price: true,
          currency: true,
          images: true,
          specifications: true,
          category: true,
          tags: true,
          rating: true,
          reviewCount: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  /**
   * 根据ID获取产品详情
   * 包含平台分销信息
   */
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        platformProducts: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
                platform: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError("产品");
    }

    return product;
  }

  /**
   * 创建产品
   */
  async createProduct(data: CreateProductInput, userId: string) {
    // 检查是否已存在相同的源平台产品
    const existingProduct = await prisma.product.findUnique({
      where: {
        sourcePlatform_sourceProductId: {
          sourcePlatform: data.sourcePlatform,
          sourceProductId: data.sourceProductId,
        },
      },
    });

    if (existingProduct) {
      throw new ConflictError("该产品已存在");
    }

    // 创建产品
    const product = await prisma.product.create({
      data: {
        userId,
        sourcePlatform: data.sourcePlatform,
        sourceProductId: data.sourceProductId,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency || "USD",
        images: data.images,
        specifications: data.specifications,
        category: data.category,
        tags: data.tags,
        rating: data.rating,
        reviewCount: data.reviewCount,
        status: ProductStatus.ACTIVE,
      },
      select: {
        id: true,
        userId: true,
        sourcePlatform: true,
        sourceProductId: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        images: true,
        specifications: true,
        category: true,
        tags: true,
        rating: true,
        reviewCount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return product;
  }

  /**
   * 更新产品信息
   */
  async updateProduct(id: string, data: UpdateProductInput, userId: string, isAdmin: boolean) {
    // 检查产品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundError("产品");
    }

    // 权限检查：非管理员只能修改自己的产品
    if (!isAdmin && existingProduct.userId !== userId) {
      throw new ForbiddenError("无权修改此产品");
    }

    // 更新产品
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.currency && { currency: data.currency }),
        ...(data.images && { images: data.images }),
        ...(data.specifications !== undefined && { specifications: data.specifications }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.reviewCount !== undefined && { reviewCount: data.reviewCount }),
        ...(data.status && { status: data.status }),
      },
      select: {
        id: true,
        userId: true,
        sourcePlatform: true,
        sourceProductId: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        images: true,
        specifications: true,
        category: true,
        tags: true,
        rating: true,
        reviewCount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return product;
  }

  /**
   * 删除产品
   * 注意：这是硬删除，会级联删除关联数据
   */
  async deleteProduct(id: string, userId: string, isAdmin: boolean): Promise<void> {
    // 检查产品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundError("产品");
    }

    // 权限检查：非管理员只能删除自己的产品
    if (!isAdmin && existingProduct.userId !== userId) {
      throw new ForbiddenError("无权删除此产品");
    }

    // 删除产品（Prisma 会自动处理级联删除）
    await prisma.product.delete({
      where: { id },
    });
  }

  /**
   * 更新产品状态
   */
  async updateProductStatus(id: string, status: ProductStatus, userId: string, isAdmin: boolean) {
    // 检查产品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundError("产品");
    }

    // 权限检查：非管理员只能修改自己的产品
    if (!isAdmin && existingProduct.userId !== userId) {
      throw new ForbiddenError("无权修改此产品状态");
    }

    // 更新状态
    const product = await prisma.product.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        userId: true,
        sourcePlatform: true,
        sourceProductId: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        images: true,
        specifications: true,
        category: true,
        tags: true,
        rating: true,
        reviewCount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return product;
  }

  /**
   * 获取产品统计信息
   */
  async getProductStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, activeCount, inactiveCount, outOfStockCount] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.count({ where: { ...where, status: ProductStatus.ACTIVE } }),
      prisma.product.count({ where: { ...where, status: ProductStatus.INACTIVE } }),
      prisma.product.count({
        where: { ...where, status: ProductStatus.OUT_OF_STOCK },
      }),
    ]);

    return {
      total,
      active: activeCount,
      inactive: inactiveCount,
      outOfStock: outOfStockCount,
    };
  }
}

// 导出单例实例
export const productService = new ProductService();
