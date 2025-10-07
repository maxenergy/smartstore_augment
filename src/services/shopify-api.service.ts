/**
 * Shopify API Service
 * 封装 Shopify Admin API 调用
 */

import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";

/**
 * Shopify 产品搜索参数
 */
export interface ShopifySearchParams {
  keyword?: string;
  limit?: number;
  page?: number;
}

/**
 * Shopify 产品数据
 */
export interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  handle: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  status: string;
  images: Array<{
    id: string;
    src: string;
    alt: string | null;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    sku: string;
    inventory_quantity: number;
  }>;
}

/**
 * Shopify API Service 类
 */
export class ShopifyApiService {
  private shopify: ReturnType<typeof shopifyApi> | null = null;
  private session: any = null;

  /**
   * 检查 Shopify API 是否已配置
   */
  private isConfigured(): boolean {
    return !!(
      process.env.SHOPIFY_API_KEY &&
      process.env.SHOPIFY_API_SECRET &&
      process.env.SHOPIFY_ACCESS_TOKEN &&
      process.env.SHOPIFY_SHOP_DOMAIN
    );
  }

  /**
   * 初始化 Shopify API 客户端（延迟初始化）
   */
  private initialize() {
    if (this.shopify) {
      return; // 已初始化
    }

    if (!this.isConfigured()) {
      throw new Error(
        "Shopify API 未配置。请在环境变量中设置 SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_ACCESS_TOKEN, SHOPIFY_SHOP_DOMAIN"
      );
    }

    // 初始化 Shopify API 客户端
    this.shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY!,
      apiSecretKey: process.env.SHOPIFY_API_SECRET!,
      scopes: ["read_products", "read_inventory"],
      hostName: process.env.SHOPIFY_SHOP_DOMAIN!.replace(".myshopify.com", ""),
      apiVersion: ApiVersion.October24, // 使用具体的 API 版本
      isEmbeddedApp: false,
    });

    // 创建会话
    this.session = {
      shop: process.env.SHOPIFY_SHOP_DOMAIN!,
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
    };
  }

  /**
   * 搜索产品
   */
  async searchProducts(params: ShopifySearchParams): Promise<ShopifyProduct[]> {
    try {
      // 初始化 API 客户端
      this.initialize();

      const { keyword = "", limit = 10, page = 1 } = params;

      // 构建 GraphQL 查询
      const query = `
        query getProducts($first: Int!, $query: String) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                descriptionHtml
                vendor
                productType
                handle
                publishedAt
                createdAt
                updatedAt
                status
                images(first: 5) {
                  edges {
                    node {
                      id
                      url
                      altText
                    }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price
                      sku
                      inventoryQuantity
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const variables = {
        first: limit,
        query: keyword ? `title:*${keyword}*` : undefined,
      };

      // 创建 GraphQL 客户端
      const client = new this.shopify.clients.Graphql({ session: this.session });

      // 执行查询
      const response = await client.query({
        data: {
          query,
          variables,
        },
      });

      // 解析响应
      const products = (response.body as any).data.products.edges.map((edge: any) => {
        const node = edge.node;
        return {
          id: node.id.split("/").pop(), // 提取数字 ID
          title: node.title,
          body_html: node.descriptionHtml,
          vendor: node.vendor,
          product_type: node.productType,
          handle: node.handle,
          published_at: node.publishedAt,
          created_at: node.createdAt,
          updated_at: node.updatedAt,
          status: node.status,
          images: node.images.edges.map((imgEdge: any) => ({
            id: imgEdge.node.id.split("/").pop(),
            src: imgEdge.node.url,
            alt: imgEdge.node.altText,
          })),
          variants: node.variants.edges.map((varEdge: any) => ({
            id: varEdge.node.id.split("/").pop(),
            title: varEdge.node.title,
            price: varEdge.node.price,
            sku: varEdge.node.sku,
            inventory_quantity: varEdge.node.inventoryQuantity,
          })),
        };
      });

      return products;
    } catch (error) {
      console.error("Shopify API Error:", error);
      throw new Error(`Failed to search Shopify products: ${(error as Error).message}`);
    }
  }

  /**
   * 获取产品详情
   */
  async getProduct(productId: string): Promise<ShopifyProduct | null> {
    try {
      // 初始化 API 客户端
      this.initialize();

      const query = `
        query getProduct($id: ID!) {
          product(id: $id) {
            id
            title
            descriptionHtml
            vendor
            productType
            handle
            publishedAt
            createdAt
            updatedAt
            status
            images(first: 10) {
              edges {
                node {
                  id
                  url
                  altText
                }
              }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  price
                  sku
                  inventoryQuantity
                }
              }
            }
          }
        }
      `;

      const variables = {
        id: `gid://shopify/Product/${productId}`,
      };

      const client = new this.shopify.clients.Graphql({ session: this.session });

      const response = await client.query({
        data: {
          query,
          variables,
        },
      });

      const product = (response.body as any).data.product;

      if (!product) {
        return null;
      }

      return {
        id: product.id.split("/").pop(),
        title: product.title,
        body_html: product.descriptionHtml,
        vendor: product.vendor,
        product_type: product.productType,
        handle: product.handle,
        published_at: product.publishedAt,
        created_at: product.createdAt,
        updated_at: product.updatedAt,
        status: product.status,
        images: product.images.edges.map((edge: any) => ({
          id: edge.node.id.split("/").pop(),
          src: edge.node.url,
          alt: edge.node.altText,
        })),
        variants: product.variants.edges.map((edge: any) => ({
          id: edge.node.id.split("/").pop(),
          title: edge.node.title,
          price: edge.node.price,
          sku: edge.node.sku,
          inventory_quantity: edge.node.inventoryQuantity,
        })),
      };
    } catch (error) {
      console.error("Shopify API Error:", error);
      throw new Error(`Failed to get Shopify product: ${(error as Error).message}`);
    }
  }

  /**
   * 获取库存数量
   */
  async getInventory(productId: string): Promise<number> {
    try {
      const product = await this.getProduct(productId);
      if (!product || !product.variants || product.variants.length === 0) {
        return 0;
      }

      // 返回第一个变体的库存数量
      return product.variants[0].inventory_quantity || 0;
    } catch (error) {
      console.error("Shopify API Error:", error);
      return 0;
    }
  }

  /**
   * 验证 API 连接
   */
  async testConnection(): Promise<boolean> {
    try {
      // 检查配置
      if (!this.isConfigured()) {
        return false;
      }

      // 初始化 API 客户端
      this.initialize();

      const query = `
        query {
          shop {
            name
            email
          }
        }
      `;

      const client = new this.shopify.clients.Graphql({ session: this.session });

      await client.query({
        data: { query },
      });

      return true;
    } catch (error) {
      console.error("Shopify connection test failed:", error);
      return false;
    }
  }
}

// 导出单例实例（延迟初始化）
let shopifyApiServiceInstance: ShopifyApiService | null = null;

export const shopifyApiService = {
  getInstance(): ShopifyApiService {
    if (!shopifyApiServiceInstance) {
      shopifyApiServiceInstance = new ShopifyApiService();
    }
    return shopifyApiServiceInstance;
  },

  // 代理方法
  async searchProducts(params: ShopifySearchParams): Promise<ShopifyProduct[]> {
    return this.getInstance().searchProducts(params);
  },

  async getProduct(productId: string): Promise<ShopifyProduct | null> {
    return this.getInstance().getProduct(productId);
  },

  async getInventory(productId: string): Promise<number> {
    return this.getInstance().getInventory(productId);
  },

  async testConnection(): Promise<boolean> {
    return this.getInstance().testConnection();
  },
};

