/**
 * Product Import Service
 * 产品批量导入服务
 */

import { prisma } from "@/lib/prisma";
import { Platform, ProductStatus } from "@prisma/client";
import { ConflictError, ValidationError } from "@/lib/errors";
import { ExternalProduct } from "./platform-search.service";

/**
 * 定价策略
 */
export interface PricingStrategy {
  type: "MARGIN" | "MARKUP" | "CUSTOM";
  value?: number; // 利润率（百分比）或加价金额
}

/**
 * 导入结果
 */
export interface ImportResult {
  imported: number;
  failed: number;
  products: Array<{
    id?: string;
    title: string;
    status: "SUCCESS" | "FAILED";
    message?: string;
  }>;
}

/**
 * Product Import Service 类
 */
export class ProductImportService {
  /**
   * 批量导入产品
   */
  async importProducts(
    products: ExternalProduct[],
    userId: string,
    platform: Platform,
    pricingStrategy: PricingStrategy
  ): Promise<ImportResult> {
    const result: ImportResult = {
      imported: 0,
      failed: 0,
      products: [],
    };

    for (const product of products) {
      try {
        // 验证产品数据
        this.validateProductData(product);

        // 检查重复
        const isDuplicate = await this.checkDuplicate(platform, product.externalId);
        if (isDuplicate) {
          result.failed++;
          result.products.push({
            title: product.title,
            status: "FAILED",
            message: "产品已存在",
          });
          continue;
        }

        // 计算零售价
        const retailPrice = this.calculateRetailPrice(product.price, pricingStrategy);

        // 计算利润率
        const profitMargin = this.calculateProfitMargin(product.price, retailPrice);

        // 创建产品
        const createdProduct = await prisma.product.create({
          data: {
            userId,
            sourcePlatform: platform,
            sourceProductId: product.externalId,
            title: product.title,
            description: product.description,
            price: retailPrice,
            currency: product.currency,
            images: JSON.stringify(product.images),
            category: product.category,
            tags: product.tags ? JSON.stringify(product.tags) : undefined,
            rating: product.rating,
            reviewCount: product.reviewCount,
            status: ProductStatus.ACTIVE,

            // 一件代发相关字段
            dropshippingSupported: product.dropshippingSupported,
            supplierName: product.supplierName,
            supplierUrl: product.supplierUrl,
            costPrice: product.price,
            suggestedRetailPrice: retailPrice,
            profitMargin,
            minOrderQuantity: product.minOrderQuantity,
            shippingTime: product.shippingTime,
            shippingFrom: product.shippingFrom,
            stockQuantity: product.stockQuantity,
            stockSyncedAt: new Date(),
            salesCount: product.salesCount || 0,
            searchKeywords: undefined, // 可以后续添加
            importedAt: new Date(),
          },
        });

        result.imported++;
        result.products.push({
          id: createdProduct.id,
          title: createdProduct.title,
          status: "SUCCESS",
        });
      } catch (error) {
        result.failed++;
        result.products.push({
          title: product.title,
          status: "FAILED",
          message: (error as Error).message,
        });
      }
    }

    return result;
  }

  /**
   * 计算零售价
   */
  private calculateRetailPrice(costPrice: number, strategy: PricingStrategy): number {
    switch (strategy.type) {
      case "MARGIN":
        // 利润率定价：零售价 = 成本价 / (1 - 利润率)
        if (!strategy.value || strategy.value <= 0 || strategy.value >= 100) {
          throw new ValidationError("利润率必须在 0-100 之间");
        }
        const marginRate = strategy.value / 100;
        return parseFloat((costPrice / (1 - marginRate)).toFixed(2));

      case "MARKUP":
        // 加价定价：零售价 = 成本价 + 加价金额
        if (!strategy.value || strategy.value < 0) {
          throw new ValidationError("加价金额必须大于 0");
        }
        return parseFloat((costPrice + strategy.value).toFixed(2));

      case "CUSTOM":
        // 自定义定价：使用成本价作为零售价（后续手动修改）
        return costPrice;

      default:
        throw new ValidationError("无效的定价策略");
    }
  }

  /**
   * 计算利润率
   */
  private calculateProfitMargin(costPrice: number, retailPrice: number): number {
    if (retailPrice <= costPrice) {
      return 0;
    }
    const margin = ((retailPrice - costPrice) / retailPrice) * 100;
    return parseFloat(margin.toFixed(2));
  }

  /**
   * 验证产品数据
   */
  private validateProductData(product: ExternalProduct): void {
    if (!product.externalId) {
      throw new ValidationError("产品外部ID不能为空");
    }
    if (!product.title) {
      throw new ValidationError("产品标题不能为空");
    }
    if (product.price <= 0) {
      throw new ValidationError("产品价格必须大于 0");
    }
    if (!product.images || product.images.length === 0) {
      throw new ValidationError("产品必须至少有一张图片");
    }
  }

  /**
   * 检查重复
   */
  private async checkDuplicate(platform: Platform, externalId: string): Promise<boolean> {
    const existingProduct = await prisma.product.findUnique({
      where: {
        sourcePlatform_sourceProductId: {
          sourcePlatform: platform,
          sourceProductId: externalId,
        },
      },
    });

    return !!existingProduct;
  }

  /**
   * 批量更新产品价格
   */
  async updateProductsPricing(
    productIds: string[],
    pricingStrategy: PricingStrategy,
    userId: string
  ): Promise<number> {
    let updatedCount = 0;

    for (const productId of productIds) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product || product.userId !== userId) {
          continue;
        }

        const costPrice = product.costPrice || product.price;
        const newRetailPrice = this.calculateRetailPrice(costPrice, pricingStrategy);
        const newProfitMargin = this.calculateProfitMargin(costPrice, newRetailPrice);

        await prisma.product.update({
          where: { id: productId },
          data: {
            price: newRetailPrice,
            suggestedRetailPrice: newRetailPrice,
            profitMargin: newProfitMargin,
          },
        });

        updatedCount++;
      } catch (error) {
        console.error(`Failed to update product ${productId}:`, error);
      }
    }

    return updatedCount;
  }

  /**
   * 获取导入统计
   */
  async getImportStats(userId: string): Promise<{
    totalImported: number;
    byPlatform: Record<Platform, number>;
    recentImports: Array<{
      date: string;
      count: number;
    }>;
  }> {
    // 获取总导入数
    const totalImported = await prisma.product.count({
      where: { userId },
    });

    // 按平台统计
    const byPlatformData = await prisma.product.groupBy({
      by: ["sourcePlatform"],
      where: { userId },
      _count: true,
    });

    const byPlatform = byPlatformData.reduce(
      (acc, item) => {
        acc[item.sourcePlatform] = item._count;
        return acc;
      },
      {} as Record<Platform, number>
    );

    // 最近 7 天的导入统计
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentProducts = await prisma.product.findMany({
      where: {
        userId,
        importedAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        importedAt: true,
      },
      orderBy: {
        importedAt: "desc",
      },
    });

    // 按日期分组
    const recentImportsMap = new Map<string, number>();
    recentProducts.forEach((product) => {
      const date = product.importedAt.toISOString().split("T")[0];
      recentImportsMap.set(date, (recentImportsMap.get(date) || 0) + 1);
    });

    const recentImports = Array.from(recentImportsMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      totalImported,
      byPlatform,
      recentImports,
    };
  }
}

// 导出单例实例
export const productImportService = new ProductImportService();

