/**
 * 店铺服务层
 * 封装店铺相关的业务逻辑
 */

import { prisma } from "@/lib/prisma";
import { Prisma, Platform, ShopStatus } from "@prisma/client";
import { NotFoundError, ConflictError, ForbiddenError } from "@/lib/errors";
import type { SafeShop, ShopWithProducts, CreateShopInput, UpdateShopInput } from "@/types/models";

/**
 * 店铺列表查询参数
 */
export interface GetShopsParams {
  page: number;
  pageSize: number;
  userId?: string;
  platform?: Platform;
  status?: ShopStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * 店铺服务类
 */
export class ShopService {
  /**
   * 获取店铺列表
   * 支持分页、筛选、搜索、排序
   */
  async getShops(params: GetShopsParams) {
    const {
      page,
      pageSize,
      userId,
      platform,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // 构建查询条件
    const where: Prisma.ShopWhereInput = {
      ...(userId && { userId }),
      ...(platform && { platform }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { platformShopId: { contains: search, mode: "insensitive" } },
          { platformShopUrl: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // 构建排序条件
    const orderBy: Prisma.ShopOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // 并行执行查询和计数
    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          platform: true,
          platformShopId: true,
          platformShopUrl: true,
          status: true,
          userId: true,
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
      prisma.shop.count({ where }),
    ]);

    return { shops, total };
  }

  /**
   * 根据ID获取店铺详情
   * 包含关联的产品信息
   */
  async getShopById(id: string): Promise<ShopWithProducts> {
    const shop = await prisma.shop.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        platform: true,
        platformShopId: true,
        platformShopUrl: true,
        status: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        products: {
          select: {
            id: true,
            title: true,
            sku: true,
            price: true,
            stock: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // 只返回最近的10个产品
        },
      },
    });

    if (!shop) {
      throw new NotFoundError("店铺");
    }

    return shop as ShopWithProducts;
  }

  /**
   * 创建店铺
   */
  async createShop(data: CreateShopInput, userId: string): Promise<SafeShop> {
    // 检查店铺名称是否已存在（同一用户下）
    const existingShop = await prisma.shop.findFirst({
      where: {
        userId,
        name: data.name,
      },
    });

    if (existingShop) {
      throw new ConflictError("店铺名称已存在");
    }

    // 检查平台店铺ID是否已存在
    if (data.platformShopId) {
      const existingPlatformShop = await prisma.shop.findFirst({
        where: {
          platform: data.platform,
          platformShopId: data.platformShopId,
        },
      });

      if (existingPlatformShop) {
        throw new ConflictError("该平台店铺已被添加");
      }
    }

    // 创建店铺
    const shop = await prisma.shop.create({
      data: {
        name: data.name,
        platform: data.platform,
        platformShopId: data.platformShopId,
        platformShopUrl: data.platformShopUrl,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        status: ShopStatus.ACTIVE,
        userId,
      },
      select: {
        id: true,
        name: true,
        platform: true,
        platformShopId: true,
        platformShopUrl: true,
        status: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return shop;
  }

  /**
   * 更新店铺信息
   */
  async updateShop(
    id: string,
    data: UpdateShopInput,
    userId: string,
    isAdmin: boolean
  ): Promise<SafeShop> {
    // 检查店铺是否存在
    const existingShop = await prisma.shop.findUnique({
      where: { id },
    });

    if (!existingShop) {
      throw new NotFoundError("店铺");
    }

    // 权限检查：非管理员只能修改自己的店铺
    if (!isAdmin && existingShop.userId !== userId) {
      throw new ForbiddenError("无权修改此店铺");
    }

    // 如果更新店铺名称，检查是否与同一用户的其他店铺重名
    if (data.name && data.name !== existingShop.name) {
      const duplicateShop = await prisma.shop.findFirst({
        where: {
          userId: existingShop.userId,
          name: data.name,
          id: { not: id },
        },
      });

      if (duplicateShop) {
        throw new ConflictError("店铺名称已存在");
      }
    }

    // 更新店铺
    const shop = await prisma.shop.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.platformShopId && { platformShopId: data.platformShopId }),
        ...(data.platformShopUrl && { platformShopUrl: data.platformShopUrl }),
        ...(data.accessToken && { accessToken: data.accessToken }),
        ...(data.refreshToken && { refreshToken: data.refreshToken }),
        ...(data.status && { status: data.status }),
      },
      select: {
        id: true,
        name: true,
        platform: true,
        platformShopId: true,
        platformShopUrl: true,
        status: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return shop;
  }

  /**
   * 删除店铺
   * 注意：这是硬删除，会级联删除关联数据
   */
  async deleteShop(id: string, userId: string, isAdmin: boolean): Promise<void> {
    // 检查店铺是否存在
    const existingShop = await prisma.shop.findUnique({
      where: { id },
    });

    if (!existingShop) {
      throw new NotFoundError("店铺");
    }

    // 权限检查：非管理员只能删除自己的店铺
    if (!isAdmin && existingShop.userId !== userId) {
      throw new ForbiddenError("无权删除此店铺");
    }

    // 删除店铺（Prisma 会自动处理级联删除）
    await prisma.shop.delete({
      where: { id },
    });
  }

  /**
   * 更新店铺状态
   */
  async updateShopStatus(
    id: string,
    status: ShopStatus,
    userId: string,
    isAdmin: boolean
  ): Promise<SafeShop> {
    // 检查店铺是否存在
    const existingShop = await prisma.shop.findUnique({
      where: { id },
    });

    if (!existingShop) {
      throw new NotFoundError("店铺");
    }

    // 权限检查：非管理员只能修改自己的店铺
    if (!isAdmin && existingShop.userId !== userId) {
      throw new ForbiddenError("无权修改此店铺状态");
    }

    // 更新状态
    const shop = await prisma.shop.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        platform: true,
        platformShopId: true,
        platformShopUrl: true,
        status: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return shop;
  }

  /**
   * 获取店铺统计信息
   */
  async getShopStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, activeCount, inactiveCount, suspendedCount] = await Promise.all([
      prisma.shop.count({ where }),
      prisma.shop.count({ where: { ...where, status: ShopStatus.ACTIVE } }),
      prisma.shop.count({ where: { ...where, status: ShopStatus.INACTIVE } }),
      prisma.shop.count({
        where: { ...where, status: ShopStatus.SUSPENDED },
      }),
    ]);

    return {
      total,
      active: activeCount,
      inactive: inactiveCount,
      suspended: suspendedCount,
    };
  }

  /**
   * 同步店铺数据（预留接口）
   * 用于从第三方平台同步店铺信息
   */
  async syncShopData(id: string): Promise<SafeShop> {
    // 检查店铺是否存在
    const shop = await prisma.shop.findUnique({
      where: { id },
    });

    if (!shop) {
      throw new NotFoundError("店铺");
    }

    // TODO: 根据不同平台调用相应的API同步数据
    // 这里暂时只返回店铺信息，实际实现需要调用第三方API

    return {
      id: shop.id,
      name: shop.name,
      platform: shop.platform,
      platformShopId: shop.platformShopId,
      platformShopUrl: shop.platformShopUrl,
      status: shop.status,
      userId: shop.userId,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
    };
  }
}

// 导出单例实例
export const shopService = new ShopService();
