/**
 * 数据模型类型定义
 * 从 Prisma Client 导出并扩展类型
 */

import {
  User,
  Shop,
  Product,
  PlatformProduct,
  Order,
  UserRole,
  UserStatus,
  Platform,
  ShopStatus,
  ProductStatus,
  PlatformProductStatus,
  OrderStatus,
} from "@prisma/client";

// ============================================================================
// 基础模型类型导出
// ============================================================================

export type {
  User,
  Shop,
  Product,
  PlatformProduct,
  Order,
  UserRole,
  UserStatus,
  Platform,
  ShopStatus,
  ProductStatus,
  PlatformProductStatus,
  OrderStatus,
};

// ============================================================================
// 扩展模型类型
// ============================================================================

/**
 * 用户及其店铺
 */
export type UserWithShops = User & {
  shops: Shop[];
};

/**
 * 用户及其店铺和产品
 */
export type UserWithShopsAndProducts = User & {
  shops: (Shop & {
    products: Product[];
  })[];
};

/**
 * 店铺及其产品
 */
export type ShopWithProducts = Shop & {
  products: Product[];
};

/**
 * 店铺及其所有者
 */
export type ShopWithUser = Shop & {
  user: User;
};

/**
 * 产品及其平台关联
 */
export type ProductWithPlatforms = Product & {
  platformProducts: PlatformProduct[];
};

/**
 * 产品及其所有者
 */
export type ProductWithUser = Product & {
  user: User;
};

/**
 * 产品及其平台关联和店铺信息
 */
export type ProductWithPlatformsAndShops = Product & {
  platformProducts: (PlatformProduct & {
    shop: Shop;
  })[];
};

/**
 * 平台产品及其关联信息
 */
export type PlatformProductWithRelations = PlatformProduct & {
  product: Product;
  shop: Shop;
};

/**
 * 订单及其店铺信息
 */
export type OrderWithShop = Order & {
  shop: Shop;
};

/**
 * 订单及其所有者
 */
export type OrderWithUser = Order & {
  user: User;
};

/**
 * 订单及其完整关联信息
 */
export type OrderWithRelations = Order & {
  user: User;
  shop: Shop;
};

// ============================================================================
// 安全模型类型（排除敏感字段）
// ============================================================================

/**
 * 安全的用户类型（排除密码）
 */
export type SafeUser = Omit<User, "password">;

/**
 * 安全的店铺类型（排除令牌）
 */
export type SafeShop = Omit<Shop, "accessToken" | "refreshToken">;

/**
 * 安全的用户及其店铺（排除敏感信息）
 */
export type SafeUserWithShops = SafeUser & {
  shops: SafeShop[];
};

// ============================================================================
// 创建和更新类型
// ============================================================================

/**
 * 创建用户输入类型
 */
export type CreateUserInput = Pick<User, "email" | "password" | "name" | "role">;

/**
 * 更新用户输入类型
 */
export type UpdateUserInput = Partial<Pick<User, "email" | "name" | "role" | "status">>;

/**
 * 创建店铺输入类型
 */
export type CreateShopInput = Pick<
  Shop,
  | "name"
  | "platform"
  | "platformShopId"
  | "platformShopUrl"
  | "accessToken"
  | "refreshToken"
  | "tokenExpiresAt"
>;

/**
 * 更新店铺输入类型
 */
export type UpdateShopInput = Partial<
  Pick<
    Shop,
    "name" | "platformShopUrl" | "accessToken" | "refreshToken" | "tokenExpiresAt" | "status"
  >
>;

/**
 * 创建产品输入类型
 */
export type CreateProductInput = Pick<
  Product,
  | "name"
  | "sku"
  | "description"
  | "price"
  | "compareAtPrice"
  | "cost"
  | "inventory"
  | "weight"
  | "weightUnit"
  | "images"
  | "variants"
>;

/**
 * 更新产品输入类型
 */
export type UpdateProductInput = Partial<CreateProductInput>;

/**
 * 创建平台产品输入类型
 */
export type CreatePlatformProductInput = Pick<
  PlatformProduct,
  "productId" | "shopId" | "platformProductId" | "platformSku"
>;

/**
 * 更新平台产品输入类型
 */
export type UpdatePlatformProductInput = Partial<
  Pick<PlatformProduct, "platformProductId" | "platformSku" | "syncStatus" | "lastSyncAt">
>;

/**
 * 创建订单输入类型
 */
export type CreateOrderInput = Pick<
  Order,
  | "orderNumber"
  | "platformOrderId"
  | "shopId"
  | "customerName"
  | "customerEmail"
  | "customerPhone"
  | "shippingAddress"
  | "billingAddress"
  | "items"
  | "subtotal"
  | "tax"
  | "shippingFee"
  | "discount"
  | "total"
  | "currency"
>;

/**
 * 更新订单输入类型
 */
export type UpdateOrderInput = Partial<
  Pick<
    Order,
    | "status"
    | "trackingNumber"
    | "trackingUrl"
    | "shippedAt"
    | "deliveredAt"
    | "cancelledAt"
    | "refundedAt"
    | "notes"
  >
>;

// ============================================================================
// 列表查询类型
// ============================================================================

/**
 * 用户列表查询参数
 */
export interface UserListQuery {
  page?: number;
  pageSize?: number;
  sortBy?: keyof User;
  sortOrder?: "asc" | "desc";
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

/**
 * 店铺列表查询参数
 */
export interface ShopListQuery {
  page?: number;
  pageSize?: number;
  sortBy?: keyof Shop;
  sortOrder?: "asc" | "desc";
  search?: string;
  platform?: Platform;
  status?: ShopStatus;
  userId?: string;
}

/**
 * 产品列表查询参数
 */
export interface ProductListQuery {
  page?: number;
  pageSize?: number;
  sortBy?: keyof Product;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: ProductStatus;
  userId?: string;
  minPrice?: number;
  maxPrice?: number;
  minInventory?: number;
  maxInventory?: number;
}

/**
 * 订单列表查询参数
 */
export interface OrderListQuery {
  page?: number;
  pageSize?: number;
  sortBy?: keyof Order;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: OrderStatus;
  userId?: string;
  shopId?: string;
  startDate?: Date;
  endDate?: Date;
}
