/**
 * 产品同步服务
 * 负责从第三方平台同步产品数据（价格、库存、信息）
 */

import { prisma } from "@/lib/prisma";
import { Platform } from "@prisma/client";
import { shopifyApiService } from "./shopify-api.service";

/**
 * 同步类型
 */
export type SyncType = "PRICE" | "STOCK" | "INFO" | "ALL";

/**
 * 同步结果
 */
export interface SyncResult {
  success: boolean;
  message: string;
  oldValue?: any;
  newValue?: any;
  changes?: string[];
}

/**
 * 批量同步结果
 */
export interface BatchSyncResult {
  total: number;
  success: number;
  failed: number;
  results: Array<{
    productId: string;
    productTitle: string;
    status: "SUCCESS" | "FAILED";
    message: string;
  }>;
}

/**
 * 产品同步服务类
 */
class ProductSyncService {
  /**
   * 同步单个产品
   */
  async syncProduct(productId: string, syncType: SyncType): Promise<SyncResult> {
    try {
      // 获取产品信息
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("产品不存在");
      }

      // 检查是否支持一件代发
      if (!product.dropshippingSupported) {
        throw new Error("该产品不支持一件代发，无法同步");
      }

      // 检查是否有供应商信息
      if (!product.sourceProductId || !product.sourcePlatform) {
        throw new Error("缺少供应商信息，无法同步");
      }

      // 根据平台调用不同的同步方法
      let result: SyncResult;

      switch (product.sourcePlatform) {
        case Platform.SHOPIFY:
          result = await this.syncShopifyProduct(product, syncType);
          break;

        case Platform.AMAZON:
          throw new Error("Amazon 同步功能尚未实现");

        case Platform.TIKTOK:
          throw new Error("TikTok Shop 同步功能尚未实现");

        case Platform.EBAY:
          throw new Error("eBay 同步功能尚未实现");

        default:
          throw new Error(`不支持的平台: ${product.sourcePlatform}`);
      }

      // 记录同步日志
      await this.createSyncLog({
        productId: product.id,
        syncType,
        platform: product.sourcePlatform,
        status: result.success ? "SUCCESS" : "FAILED",
        message: result.message,
        oldValue: result.oldValue ? JSON.stringify(result.oldValue) : null,
        newValue: result.newValue ? JSON.stringify(result.newValue) : null,
      });

      return result;
    } catch (error: any) {
      // 记录失败日志
      await this.createSyncLog({
        productId,
        syncType,
        platform: Platform.SHOPIFY, // 默认平台
        status: "FAILED",
        message: error.message || "同步失败",
        oldValue: null,
        newValue: null,
      });

      return {
        success: false,
        message: error.message || "同步失败",
      };
    }
  }

  /**
   * 同步 Shopify 产品
   */
  private async syncShopifyProduct(
    product: any,
    syncType: SyncType
  ): Promise<SyncResult> {
    const changes: string[] = [];
    const oldValue: any = {};
    const newValue: any = {};

    try {
      // 获取最新的产品信息
      const latestProduct = await shopifyApiService.getProduct(product.sourceProductId);

      if (!latestProduct) {
        throw new Error("无法从 Shopify 获取产品信息");
      }

      // 根据同步类型更新不同的字段
      const updateData: any = {};

      if (syncType === "PRICE" || syncType === "ALL") {
        if (latestProduct.price !== product.costPrice) {
          oldValue.costPrice = product.costPrice;
          newValue.costPrice = latestProduct.price;
          updateData.costPrice = latestProduct.price;

          // 重新计算零售价（保持原有的利润率）
          if (product.profitMargin) {
            const newRetailPrice = latestProduct.price / (1 - product.profitMargin / 100);
            oldValue.price = product.price;
            newValue.price = newRetailPrice;
            updateData.price = newRetailPrice;
          }

          changes.push("价格");
        }
      }

      if (syncType === "STOCK" || syncType === "ALL") {
        const latestStock = await shopifyApiService.getInventory(product.sourceProductId);

        if (latestStock !== product.stockQuantity) {
          oldValue.stockQuantity = product.stockQuantity;
          newValue.stockQuantity = latestStock;
          updateData.stockQuantity = latestStock;
          updateData.stockSyncedAt = new Date();

          // 根据库存更新产品状态
          if (latestStock === 0 && product.status !== "OUT_OF_STOCK") {
            updateData.status = "OUT_OF_STOCK";
            changes.push("状态（缺货）");
          } else if (latestStock > 0 && product.status === "OUT_OF_STOCK") {
            updateData.status = "ACTIVE";
            changes.push("状态（有货）");
          }

          changes.push("库存");
        }
      }

      if (syncType === "INFO" || syncType === "ALL") {
        const fieldsToSync = ["title", "description", "images"];
        let infoChanged = false;

        if (latestProduct.title !== product.title) {
          oldValue.title = product.title;
          newValue.title = latestProduct.title;
          updateData.title = latestProduct.title;
          infoChanged = true;
        }

        if (latestProduct.description !== product.description) {
          oldValue.description = product.description;
          newValue.description = latestProduct.description;
          updateData.description = latestProduct.description;
          infoChanged = true;
        }

        const currentImages = JSON.parse(product.images || "[]");
        if (JSON.stringify(latestProduct.images) !== JSON.stringify(currentImages)) {
          oldValue.images = currentImages;
          newValue.images = latestProduct.images;
          updateData.images = JSON.stringify(latestProduct.images);
          infoChanged = true;
        }

        if (infoChanged) {
          changes.push("产品信息");
        }
      }

      // 如果有变化，更新数据库
      if (Object.keys(updateData).length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: updateData,
        });

        return {
          success: true,
          message: `同步成功，更新了: ${changes.join("、")}`,
          oldValue,
          newValue,
          changes,
        };
      } else {
        return {
          success: true,
          message: "产品数据已是最新，无需更新",
          oldValue: {},
          newValue: {},
          changes: [],
        };
      }
    } catch (error: any) {
      throw new Error(`Shopify 同步失败: ${error.message}`);
    }
  }

  /**
   * 批量同步产品
   */
  async syncBatch(productIds: string[], syncType: SyncType): Promise<BatchSyncResult> {
    const results: BatchSyncResult["results"] = [];

    for (const productId of productIds) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, title: true },
      });

      if (!product) {
        results.push({
          productId,
          productTitle: "未知产品",
          status: "FAILED",
          message: "产品不存在",
        });
        continue;
      }

      const result = await this.syncProduct(productId, syncType);

      results.push({
        productId: product.id,
        productTitle: product.title,
        status: result.success ? "SUCCESS" : "FAILED",
        message: result.message,
      });
    }

    const successCount = results.filter((r) => r.status === "SUCCESS").length;
    const failedCount = results.filter((r) => r.status === "FAILED").length;

    return {
      total: productIds.length,
      success: successCount,
      failed: failedCount,
      results,
    };
  }

  /**
   * 同步所有符合条件的产品
   */
  async syncAll(
    filters: {
      platform?: Platform;
      dropshippingOnly?: boolean;
    },
    syncType: SyncType
  ): Promise<BatchSyncResult> {
    // 获取符合条件的产品
    const products = await prisma.product.findMany({
      where: {
        sourcePlatform: filters.platform,
        dropshippingSupported: filters.dropshippingOnly ? true : undefined,
      },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    return this.syncBatch(productIds, syncType);
  }

  /**
   * 创建同步日志
   */
  private async createSyncLog(data: {
    productId: string;
    syncType: SyncType;
    platform: Platform;
    status: string;
    message: string;
    oldValue: string | null;
    newValue: string | null;
  }) {
    await prisma.productSyncLog.create({
      data,
    });
  }

  /**
   * 获取产品的同步日志
   */
  async getSyncLogs(productId: string, limit: number = 10) {
    return prisma.productSyncLog.findMany({
      where: { productId },
      orderBy: { syncedAt: "desc" },
      take: limit,
    });
  }

  /**
   * 获取所有同步日志
   */
  async getAllSyncLogs(params: {
    page?: number;
    pageSize?: number;
    platform?: Platform;
    status?: string;
  }) {
    const { page = 1, pageSize = 20, platform, status } = params;

    const where: any = {};
    if (platform) where.platform = platform;
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
      prisma.productSyncLog.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              sourcePlatform: true,
            },
          },
        },
        orderBy: { syncedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.productSyncLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}

export const productSyncService = new ProductSyncService();

