/**
 * Amazon Product Advertising API Service
 * 封装 Amazon PA-API 5.0 调用
 */

import axios from "axios";
import * as aws4 from "aws4";
import * as crypto from "crypto";

/**
 * Amazon 搜索参数
 */
export interface AmazonSearchParams {
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Amazon 产品数据
 */
export interface AmazonProduct {
  asin: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  rating?: number;
  reviewCount?: number;
  brand?: string;
  category?: string;
  features?: string[];
  url: string;
}

/**
 * Amazon API Service 类
 */
class AmazonApiService {
  private accessKey: string;
  private secretKey: string;
  private partnerTag: string;
  private marketplace: string;
  private region: string;
  private host: string;

  constructor() {
    this.accessKey = process.env.AMAZON_ACCESS_KEY || "";
    this.secretKey = process.env.AMAZON_SECRET_KEY || "";
    this.partnerTag = process.env.AMAZON_PARTNER_TAG || "";
    this.marketplace = process.env.AMAZON_MARKETPLACE || "www.amazon.com";
    this.region = process.env.AMAZON_REGION || "us-east-1";
    this.host = "webservices.amazon.com";
  }

  /**
   * 检查 API 是否已配置
   */
  private isConfigured(): boolean {
    return !!(this.accessKey && this.secretKey && this.partnerTag);
  }

  /**
   * 生成 AWS Signature V4
   */
  private signRequest(request: any): any {
    const signedRequest = aws4.sign(
      {
        host: this.host,
        path: request.path,
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(request.body),
        service: "ProductAdvertisingAPI",
        region: this.region,
      },
      {
        accessKeyId: this.accessKey,
        secretAccessKey: this.secretKey,
      }
    );

    return signedRequest;
  }

  /**
   * 搜索产品
   */
  async searchProducts(params: AmazonSearchParams): Promise<AmazonProduct[]> {
    if (!this.isConfigured()) {
      throw new Error(
        "Amazon API 未配置。请在环境变量中设置 AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG"
      );
    }

    try {
      const { keyword, minPrice, maxPrice, minRating, page = 1, pageSize = 10 } = params;

      // 构建请求体
      const requestBody = {
        Keywords: keyword,
        Resources: [
          "Images.Primary.Large",
          "ItemInfo.Title",
          "ItemInfo.Features",
          "ItemInfo.ByLineInfo",
          "ItemInfo.ContentInfo",
          "Offers.Listings.Price",
          "CustomerReviews.StarRating",
          "CustomerReviews.Count",
        ],
        PartnerTag: this.partnerTag,
        PartnerType: "Associates",
        Marketplace: this.marketplace,
        ItemCount: Math.min(pageSize, 10), // Amazon 限制最多 10 个
        ItemPage: page,
      };

      // 添加价格筛选
      if (minPrice !== undefined || maxPrice !== undefined) {
        requestBody["MinPrice"] = minPrice ? Math.round(minPrice * 100) : undefined;
        requestBody["MaxPrice"] = maxPrice ? Math.round(maxPrice * 100) : undefined;
      }

      // 准备请求
      const request = {
        method: "POST",
        path: "/paapi5/searchitems",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "X-Amz-Target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
          "Content-Encoding": "amz-1.0",
        },
        body: requestBody,
      };

      // 签名请求
      const signedRequest = this.signRequest(request);

      // 发送请求
      const response = await axios({
        method: "POST",
        url: `https://${this.host}${request.path}`,
        headers: signedRequest.headers,
        data: JSON.stringify(requestBody),
      });

      // 解析响应
      const items = response.data.SearchResult?.Items || [];

      return items
        .map((item: any) => this.parseAmazonProduct(item))
        .filter((product: AmazonProduct | null) => {
          if (!product) return false;

          // 应用评分筛选
          if (minRating && product.rating && product.rating < minRating) {
            return false;
          }

          return true;
        });
    } catch (error: any) {
      console.error("Amazon API search error:", error.response?.data || error.message);
      throw new Error(
        `Amazon 搜索失败: ${error.response?.data?.Errors?.[0]?.Message || error.message}`
      );
    }
  }

  /**
   * 获取产品详情
   */
  async getProduct(asin: string): Promise<AmazonProduct | null> {
    if (!this.isConfigured()) {
      throw new Error("Amazon API 未配置");
    }

    try {
      // 构建请求体
      const requestBody = {
        ItemIds: [asin],
        Resources: [
          "Images.Primary.Large",
          "ItemInfo.Title",
          "ItemInfo.Features",
          "ItemInfo.ByLineInfo",
          "ItemInfo.ContentInfo",
          "Offers.Listings.Price",
          "CustomerReviews.StarRating",
          "CustomerReviews.Count",
        ],
        PartnerTag: this.partnerTag,
        PartnerType: "Associates",
        Marketplace: this.marketplace,
      };

      // 准备请求
      const request = {
        method: "POST",
        path: "/paapi5/getitems",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "X-Amz-Target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
          "Content-Encoding": "amz-1.0",
        },
        body: requestBody,
      };

      // 签名请求
      const signedRequest = this.signRequest(request);

      // 发送请求
      const response = await axios({
        method: "POST",
        url: `https://${this.host}${request.path}`,
        headers: signedRequest.headers,
        data: JSON.stringify(requestBody),
      });

      // 解析响应
      const items = response.data.ItemsResult?.Items || [];
      if (items.length === 0) return null;

      return this.parseAmazonProduct(items[0]);
    } catch (error: any) {
      console.error("Amazon API get product error:", error.response?.data || error.message);
      throw new Error(`获取 Amazon 产品失败: ${error.message}`);
    }
  }

  /**
   * 解析 Amazon 产品数据
   */
  private parseAmazonProduct(item: any): AmazonProduct | null {
    try {
      const asin = item.ASIN;
      const title = item.ItemInfo?.Title?.DisplayValue || "未知产品";
      const description =
        item.ItemInfo?.Features?.DisplayValues?.join("\n") ||
        item.ItemInfo?.ContentInfo?.Edition?.DisplayValue ||
        "";

      // 获取价格
      const priceInfo = item.Offers?.Listings?.[0]?.Price;
      const price = priceInfo?.Amount || 0;
      const currency = priceInfo?.Currency || "USD";

      // 获取图片
      const images: string[] = [];
      if (item.Images?.Primary?.Large?.URL) {
        images.push(item.Images.Primary.Large.URL);
      }

      // 获取评分和评论数
      const rating = item.CustomerReviews?.StarRating?.Value || undefined;
      const reviewCount = item.CustomerReviews?.Count || undefined;

      // 获取品牌
      const brand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || undefined;

      // 获取分类
      const category =
        item.ItemInfo?.Classifications?.ProductGroup?.DisplayValue || undefined;

      // 获取特性
      const features = item.ItemInfo?.Features?.DisplayValues || [];

      // 构建产品 URL
      const url = item.DetailPageURL || `https://www.amazon.com/dp/${asin}`;

      return {
        asin,
        title,
        description,
        price,
        currency,
        images,
        rating,
        reviewCount,
        brand,
        category,
        features,
        url,
      };
    } catch (error) {
      console.error("Parse Amazon product error:", error);
      return null;
    }
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.searchProducts({ keyword: "test", pageSize: 1 });
      return true;
    } catch {
      return false;
    }
  }
}

// 导出单例实例
let amazonApiServiceInstance: AmazonApiService | null = null;

export const amazonApiService = {
  getInstance(): AmazonApiService {
    if (!amazonApiServiceInstance) {
      amazonApiServiceInstance = new AmazonApiService();
    }
    return amazonApiServiceInstance;
  },

  async searchProducts(params: AmazonSearchParams): Promise<AmazonProduct[]> {
    return this.getInstance().searchProducts(params);
  },

  async getProduct(asin: string): Promise<AmazonProduct | null> {
    return this.getInstance().getProduct(asin);
  },

  async testConnection(): Promise<boolean> {
    return this.getInstance().testConnection();
  },
};

