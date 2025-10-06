/**
 * 平台产品服务层
 * 封装平台产品相关的业务逻辑
 */

import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError, UnauthorizedError } from "@/lib/errors";
import type { Platform, PlatformProductStatus } from "@prisma/client";

export interface PlatformProductFilters {
  userId?: string;
  productId?: string;
  shopId?: string;
  platform?: Platform;
  status?: PlatformProductStatus;
}

export interface PlatformProductCreateInput {
  productId: string;
  shopId: string;
  platformProductId: string;
  platform: Platform;
  price: number;
  inventory: number;
}

export interface PlatformProductUpdateInput {
  platformProductId?: string;
  price?: number;
  inventory?: number;
  status?: PlatformProductStatus;
}

export class PlatformProductService {
  /**
   * 获取平台产品列表（支持分页和筛选）
   */
  async getPlatformProducts(
    filters: PlatformProductFilters,
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) {
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.shopId) {
      where.shopId = filters.shopId;
    }

    if (filters.platform) {
      where.platform = filters.platform;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // 如果指定了 userId，只查询该用户的产品
    if (filters.userId) {
      where.product = {
        userId: filters.userId,
      };
    }

    // 查询平台产品
    const [platformProducts, total] = await Promise.all([
      prisma.platformProduct.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: true,
              sourcePlatform: true,
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
      prisma.platformProduct.count({ where }),
    ]);

    return {
      data: platformProducts,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 根据ID获取平台产品详情
   */
  async getPlatformProductById(id: string, userId?: string) {
    const platformProduct = await prisma.platformProduct.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        shop: true,
      },
    });

    if (!platformProduct) {
      throw new NotFoundError("平台产品不存在");
    }

    // 权限检查：只有产品所有者可以查看
    if (userId && platformProduct.product.userId !== userId) {
      throw new UnauthorizedError("无权访问此平台产品");
    }

    return platformProduct;
  }

  /**
   * 创建平台产品（将产品分发到店铺）
   */
  async createPlatformProduct(data: PlatformProductCreateInput, userId?: string) {
    // 验证产品存在且属于用户
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundError("产品不存在");
    }

    if (userId && product.userId !== userId) {
      throw new UnauthorizedError("无权分发此产品");
    }

    // 验证店铺存在且属于用户
    const shop = await prisma.shop.findUnique({
      where: { id: data.shopId },
    });

    if (!shop) {
      throw new NotFoundError("店铺不存在");
    }

    if (userId && shop.userId !== userId) {
      throw new UnauthorizedError("无权在此店铺分发产品");
    }

    // 检查是否已经分发到该店铺
    const existing = await prisma.platformProduct.findUnique({
      where: {
        productId_shopId: {
          productId: data.productId,
          shopId: data.shopId,
        },
      },
    });

    if (existing) {
      throw new ValidationError("该产品已分发到此店铺");
    }

    // 创建平台产品
    const platformProduct = await prisma.platformProduct.create({
      data: {
        productId: data.productId,
        shopId: data.shopId,
        platformProductId: data.platformProductId,
        platform: data.platform,
        price: data.price,
        inventory: data.inventory,
        status: "ACTIVE",
        syncedAt: new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: true,
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

    return platformProduct;
  }

  /**
   * 更新平台产品信息
   */
  async updatePlatformProduct(id: string, data: PlatformProductUpdateInput, userId?: string) {
    // 检查平台产品是否存在
    const platformProduct = await this.getPlatformProductById(id, userId);

    // 更新平台产品
    const updatedPlatformProduct = await prisma.platformProduct.update({
      where: { id },
      data: {
        ...data,
        syncedAt: new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: true,
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

    return updatedPlatformProduct;
  }

  /**
   * 删除平台产品（取消分发）
   */
  async deletePlatformProduct(id: string, userId?: string) {
    // 检查平台产品是否存在
    await this.getPlatformProductById(id, userId);

    // 删除平台产品
    await prisma.platformProduct.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * 同步库存
   */
  async syncInventory(id: string, inventory: number, userId?: string) {
    // 检查平台产品是否存在
    await this.getPlatformProductById(id, userId);

    // 更新库存
    const updatedPlatformProduct = await prisma.platformProduct.update({
      where: { id },
      data: {
        inventory,
        syncedAt: new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
          },
        },
        shop: {
          select: {
            id: true,
            shopName: true,
          },
        },
      },
    });

    return updatedPlatformProduct;
  }

  /**
   * 同步价格
   */
  async syncPrice(id: string, price: number, userId?: string) {
    // 检查平台产品是否存在
    await this.getPlatformProductById(id, userId);

    // 更新价格
    const updatedPlatformProduct = await prisma.platformProduct.update({
      where: { id },
      data: {
        price,
        syncedAt: new Date(),
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
          },
        },
        shop: {
          select: {
            id: true,
            shopName: true,
          },
        },
      },
    });

    return updatedPlatformProduct;
  }

  /**
   * 批量更新库存
   */
  async batchSyncInventory(updates: { id: string; inventory: number }[]) {
    const results = await Promise.all(
      updates.map((update) =>
        prisma.platformProduct.update({
          where: { id: update.id },
          data: {
            inventory: update.inventory,
            syncedAt: new Date(),
          },
        })
      )
    );

    return results;
  }
}
