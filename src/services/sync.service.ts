/**
 * 数据同步服务层
 * 封装数据同步相关的业务逻辑
 */

import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";

export type SyncType = "INVENTORY" | "PRICE" | "ORDER";
export type EntityType = "PRODUCT" | "PLATFORM_PRODUCT" | "ORDER";
export type SyncStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface SyncLogFilters {
  userId?: string;
  syncType?: SyncType;
  entityType?: EntityType;
  status?: SyncStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface SyncInventoryInput {
  platformProductId: string;
  inventory: number;
}

export interface SyncPriceInput {
  platformProductId: string;
  price: number;
}

export class SyncService {
  /**
   * 创建同步日志
   */
  private async createSyncLog(
    syncType: SyncType,
    entityType: EntityType,
    entityId: string,
    status: SyncStatus,
    userId: string,
    message?: string
  ) {
    return await prisma.syncLog.create({
      data: {
        syncType,
        entityType,
        entityId,
        status,
        message,
        userId,
      },
    });
  }

  /**
   * 批量同步库存
   */
  async syncInventory(items: SyncInventoryInput[], userId: string) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const item of items) {
      try {
        // 检查平台产品是否存在
        const platformProduct = await prisma.platformProduct.findUnique({
          where: { id: item.platformProductId },
          include: {
            product: true,
          },
        });

        if (!platformProduct) {
          throw new NotFoundError(`平台产品 ${item.platformProductId} 不存在`);
        }

        // 检查权限
        if (platformProduct.product.userId !== userId) {
          throw new ValidationError("无权同步此产品");
        }

        // 更新库存
        await prisma.platformProduct.update({
          where: { id: item.platformProductId },
          data: {
            inventory: item.inventory,
            syncedAt: new Date(),
          },
        });

        // 记录成功日志
        await this.createSyncLog(
          "INVENTORY",
          "PLATFORM_PRODUCT",
          item.platformProductId,
          "SUCCESS",
          userId,
          `库存已更新为 ${item.inventory}`
        );

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${item.platformProductId}: ${error.message || "未知错误"}`);

        // 记录失败日志
        await this.createSyncLog(
          "INVENTORY",
          "PLATFORM_PRODUCT",
          item.platformProductId,
          "FAILED",
          userId,
          error.message || "未知错误"
        );
      }
    }

    return results;
  }

  /**
   * 批量同步价格
   */
  async syncPrice(items: SyncPriceInput[], userId: string) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const item of items) {
      try {
        // 检查平台产品是否存在
        const platformProduct = await prisma.platformProduct.findUnique({
          where: { id: item.platformProductId },
          include: {
            product: true,
          },
        });

        if (!platformProduct) {
          throw new NotFoundError(`平台产品 ${item.platformProductId} 不存在`);
        }

        // 检查权限
        if (platformProduct.product.userId !== userId) {
          throw new ValidationError("无权同步此产品");
        }

        // 更新价格
        await prisma.platformProduct.update({
          where: { id: item.platformProductId },
          data: {
            price: item.price,
            syncedAt: new Date(),
          },
        });

        // 记录成功日志
        await this.createSyncLog(
          "PRICE",
          "PLATFORM_PRODUCT",
          item.platformProductId,
          "SUCCESS",
          userId,
          `价格已更新为 ${item.price}`
        );

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${item.platformProductId}: ${error.message || "未知错误"}`);

        // 记录失败日志
        await this.createSyncLog(
          "PRICE",
          "PLATFORM_PRODUCT",
          item.platformProductId,
          "FAILED",
          userId,
          error.message || "未知错误"
        );
      }
    }

    return results;
  }

  /**
   * 获取同步日志列表
   */
  async getSyncLogs(filters: SyncLogFilters, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.syncType) {
      where.syncType = filters.syncType;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.syncedAt = {};
      if (filters.startDate) {
        where.syncedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.syncedAt.lte = filters.endDate;
      }
    }

    // 查询同步日志
    const [syncLogs, total] = await Promise.all([
      prisma.syncLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { syncedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.syncLog.count({ where }),
    ]);

    return {
      data: syncLogs,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 获取同步统计信息
   */
  async getSyncStats(userId?: string) {
    const where: any = userId ? { userId } : {};

    // 获取各类型同步统计
    const [totalSyncs, successSyncs, failedSyncs, inventorySyncs, priceSyncs] = await Promise.all([
      prisma.syncLog.count({ where }),
      prisma.syncLog.count({ where: { ...where, status: "SUCCESS" } }),
      prisma.syncLog.count({ where: { ...where, status: "FAILED" } }),
      prisma.syncLog.count({ where: { ...where, syncType: "INVENTORY" } }),
      prisma.syncLog.count({ where: { ...where, syncType: "PRICE" } }),
    ]);

    // 获取最近同步时间
    const lastSync = await prisma.syncLog.findFirst({
      where,
      orderBy: { syncedAt: "desc" },
      select: { syncedAt: true },
    });

    return {
      totalSyncs,
      successSyncs,
      failedSyncs,
      inventorySyncs,
      priceSyncs,
      successRate: totalSyncs > 0 ? ((successSyncs / totalSyncs) * 100).toFixed(2) : "0",
      lastSyncAt: lastSync?.syncedAt || null,
    };
  }

  /**
   * 清理旧的同步日志（保留最近30天）
   */
  async cleanupOldLogs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.syncLog.deleteMany({
      where: {
        syncedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    return {
      deletedCount: result.count,
    };
  }
}
