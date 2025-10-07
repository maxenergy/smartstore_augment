/**
 * Platform Search Service
 * 统一的平台产品搜索服务
 */

import { Platform } from "@prisma/client";
import { shopifyApiService, ShopifyProduct } from "./shopify-api.service";
import { amazonApiService, AmazonProduct } from "./amazon-api.service";

/**
 * 搜索参数
 */
export interface SearchParams {
  platform: Platform;
  keyword: string;
  filters?: SearchFilters;
  page?: number;
  pageSize?: number;
}

/**
 * 搜索筛选条件
 */
export interface SearchFilters {
  minSalesCount?: number;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  dropshippingOnly?: boolean;
  inStock?: boolean;
}

/**
 * 外部产品数据（统一格式）
 */
export interface ExternalProduct {
  externalId: string; // 外部平台的产品ID
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[]; // 图片URL数组
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  supplierName: string;
  supplierUrl: string;
  dropshippingSupported: boolean;
  shippingTime?: string;
  shippingFrom?: string;
  stockQuantity?: number;
  minOrderQuantity: number;
  category?: string;
  tags?: string[];
}

/**
 * 搜索结果
 */
export interface SearchResult {
  items: ExternalProduct[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Platform Search Service 类
 */
export class PlatformSearchService {
  /**
   * 搜索产品（统一接口）
   */
  async searchProducts(params: SearchParams): Promise<SearchResult> {
    const { platform, keyword, filters, page = 1, pageSize = 10 } = params;

    switch (platform) {
      case "SHOPIFY":
        return this.searchShopify({ keyword, filters, page, pageSize });

      case "AMAZON":
        return this.searchAmazon({ keyword, filters, page, pageSize });

      case "TIKTOK":
        // TODO: 实现 TikTok Shop 搜索
        throw new Error("TikTok Shop search not implemented yet");

      case "EBAY":
        // TODO: 实现 eBay 搜索
        throw new Error("eBay search not implemented yet");

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Shopify 产品搜索
   */
  private async searchShopify(params: {
    keyword: string;
    filters?: SearchFilters;
    page: number;
    pageSize: number;
  }): Promise<SearchResult> {
    try {
      const { keyword, filters, page, pageSize } = params;

      // 调用 Shopify API
      const shopifyProducts = await shopifyApiService.searchProducts({
        keyword,
        limit: pageSize,
        page,
      });

      // 转换为统一格式
      let products = shopifyProducts.map((product) => this.formatShopifyProduct(product));

      // 应用筛选条件
      if (filters) {
        products = this.applyFilters(products, filters);
      }

      // 计算分页信息
      const total = products.length;
      const totalPages = Math.ceil(total / pageSize);

      return {
        items: products,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Shopify search error:", error);
      throw new Error(`Failed to search Shopify products: ${(error as Error).message}`);
    }
  }

  /**
   * 格式化 Shopify 产品数据
   */
  private formatShopifyProduct(product: ShopifyProduct): ExternalProduct {
    // 获取第一个变体的价格和库存
    const firstVariant = product.variants[0];
    const price = firstVariant ? parseFloat(firstVariant.price) : 0;
    const stockQuantity = firstVariant ? firstVariant.inventory_quantity : 0;

    // 提取图片URL
    const images = product.images.map((img) => img.src);

    // 构建供应商URL
    const supplierUrl = `https://${process.env.SHOPIFY_SHOP_DOMAIN}/products/${product.handle}`;

    return {
      externalId: product.id,
      title: product.title,
      description: product.body_html || "",
      price,
      currency: "USD", // Shopify 默认货币
      images,
      rating: undefined, // Shopify API 不直接提供评分
      reviewCount: undefined,
      salesCount: undefined, // Shopify API 不直接提供销量
      supplierName: product.vendor || "Unknown Vendor",
      supplierUrl,
      dropshippingSupported: true, // 假设 Shopify 产品都支持一件代发
      shippingTime: "7-15 days", // 默认发货时效
      shippingFrom: "US", // 默认发货地
      stockQuantity,
      minOrderQuantity: 1,
      category: product.product_type || undefined,
      tags: undefined,
    };
  }

  /**
   * Amazon 产品搜索
   */
  private async searchAmazon(params: {
    keyword: string;
    filters?: SearchFilters;
    page: number;
    pageSize: number;
  }): Promise<SearchResult> {
    try {
      const { keyword, filters = {}, page, pageSize } = params;

      // 调用 Amazon API
      const amazonProducts = await amazonApiService.searchProducts({
        keyword,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating,
        page,
        pageSize,
      });

      // 转换为统一格式
      const products = amazonProducts.map((p) => this.formatAmazonProduct(p));

      // 应用额外筛选
      const filtered = this.applyFilters(products, filters);

      return {
        items: filtered,
        pagination: {
          page,
          pageSize,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize),
        },
      };
    } catch (error: any) {
      throw new Error(`Amazon search failed: ${error.message}`);
    }
  }

  /**
   * 格式化 Amazon 产品数据
   */
  private formatAmazonProduct(product: AmazonProduct): ExternalProduct {
    return {
      externalId: product.asin,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      images: product.images,
      rating: product.rating,
      reviewCount: product.reviewCount,
      salesCount: undefined, // Amazon API 不直接提供销量
      supplierName: product.brand || "Amazon",
      supplierUrl: product.url,
      dropshippingSupported: true, // 假设 Amazon 产品都支持一件代发
      shippingTime: "7-15 days", // 默认发货时效
      shippingFrom: "US", // 默认发货地
      stockQuantity: undefined, // Amazon API 不直接提供库存
      minOrderQuantity: 1,
      category: product.category,
      tags: product.features,
    };
  }

  /**
   * 应用筛选条件
   */
  private applyFilters(products: ExternalProduct[], filters: SearchFilters): ExternalProduct[] {
    let filtered = products;

    // 价格筛选
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
    }

    // 评分筛选
    if (filters.minRating !== undefined) {
      filtered = filtered.filter((p) => p.rating && p.rating >= filters.minRating!);
    }

    // 销量筛选
    if (filters.minSalesCount !== undefined) {
      filtered = filtered.filter((p) => p.salesCount && p.salesCount >= filters.minSalesCount!);
    }

    // 一件代发筛选
    if (filters.dropshippingOnly) {
      filtered = filtered.filter((p) => p.dropshippingSupported);
    }

    // 库存筛选
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.stockQuantity && p.stockQuantity > 0);
    }

    return filtered;
  }

  /**
   * 获取产品详情
   */
  async getProductDetails(platform: Platform, externalId: string): Promise<ExternalProduct | null> {
    switch (platform) {
      case "SHOPIFY":
        const shopifyProduct = await shopifyApiService.getProduct(externalId);
        if (!shopifyProduct) {
          return null;
        }
        return this.formatShopifyProduct(shopifyProduct);

      case "AMAZON":
        const amazonProduct = await amazonApiService.getProduct(externalId);
        if (!amazonProduct) {
          return null;
        }
        return this.formatAmazonProduct(amazonProduct);

      case "TIKTOK":
        // TODO: 实现 TikTok Shop 产品详情获取
        throw new Error("TikTok Shop product details not implemented yet");

      case "EBAY":
        // TODO: 实现 eBay 产品详情获取
        throw new Error("eBay product details not implemented yet");

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * 验证平台连接
   */
  async testPlatformConnection(platform: Platform): Promise<boolean> {
    switch (platform) {
      case "SHOPIFY":
        return shopifyApiService.testConnection();

      case "AMAZON":
        return amazonApiService.testConnection();

      case "TIKTOK":
        // TODO: 实现 TikTok Shop 连接测试
        return false;

      case "EBAY":
        // TODO: 实现 eBay 连接测试
        return false;

      default:
        return false;
    }
  }
}

// 导出单例实例
export const platformSearchService = new PlatformSearchService();

