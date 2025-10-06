import { UserRole } from "@/types/auth";

/**
 * 权限枚举
 * 定义系统中所有可用的权限
 */
export enum Permission {
  // 用户管理权限
  USER_READ = "user:read", // 查看用户信息
  USER_CREATE = "user:create", // 创建用户
  USER_UPDATE = "user:update", // 更新用户信息
  USER_DELETE = "user:delete", // 删除用户
  USER_MANAGE_ROLE = "user:manage_role", // 管理用户角色

  // 店铺管理权限
  SHOP_READ = "shop:read", // 查看店铺信息
  SHOP_CREATE = "shop:create", // 创建店铺
  SHOP_UPDATE = "shop:update", // 更新店铺信息
  SHOP_DELETE = "shop:delete", // 删除店铺
  SHOP_MANAGE_TOKEN = "shop:manage_token", // 管理店铺令牌

  // 产品管理权限
  PRODUCT_READ = "product:read", // 查看产品信息
  PRODUCT_CREATE = "product:create", // 创建产品
  PRODUCT_UPDATE = "product:update", // 更新产品信息
  PRODUCT_DELETE = "product:delete", // 删除产品
  PRODUCT_IMPORT = "product:import", // 导入产品
  PRODUCT_EXPORT = "product:export", // 导出产品

  // 订单管理权限
  ORDER_READ = "order:read", // 查看订单信息
  ORDER_CREATE = "order:create", // 创建订单
  ORDER_UPDATE = "order:update", // 更新订单信息
  ORDER_DELETE = "order:delete", // 删除订单
  ORDER_PROCESS = "order:process", // 处理订单

  // 平台产品管理权限
  PLATFORM_PRODUCT_READ = "platform_product:read", // 查看平台产品
  PLATFORM_PRODUCT_CREATE = "platform_product:create", // 创建平台产品
  PLATFORM_PRODUCT_UPDATE = "platform_product:update", // 更新平台产品
  PLATFORM_PRODUCT_DELETE = "platform_product:delete", // 删除平台产品
  PLATFORM_PRODUCT_SYNC = "platform_product:sync", // 同步平台产品

  // 系统管理权限
  SYSTEM_SETTINGS = "system:settings", // 系统设置
  SYSTEM_LOGS = "system:logs", // 查看系统日志
  SYSTEM_BACKUP = "system:backup", // 系统备份
  SYSTEM_RESTORE = "system:restore", // 系统恢复

  // API 权限
  API_ACCESS = "api:access", // API 访问权限
  API_MANAGE = "api:manage", // API 管理权限
}

/**
 * 角色权限映射
 * 定义每个角色拥有的权限列表
 */
export const RolePermissions: Record<UserRole, Permission[]> = {
  // 管理员：拥有所有权限
  [UserRole.ADMIN]: [
    // 用户管理
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE_ROLE,

    // 店铺管理
    Permission.SHOP_READ,
    Permission.SHOP_CREATE,
    Permission.SHOP_UPDATE,
    Permission.SHOP_DELETE,
    Permission.SHOP_MANAGE_TOKEN,

    // 产品管理
    Permission.PRODUCT_READ,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.PRODUCT_IMPORT,
    Permission.PRODUCT_EXPORT,

    // 订单管理
    Permission.ORDER_READ,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE,
    Permission.ORDER_DELETE,
    Permission.ORDER_PROCESS,

    // 平台产品管理
    Permission.PLATFORM_PRODUCT_READ,
    Permission.PLATFORM_PRODUCT_CREATE,
    Permission.PLATFORM_PRODUCT_UPDATE,
    Permission.PLATFORM_PRODUCT_DELETE,
    Permission.PLATFORM_PRODUCT_SYNC,

    // 系统管理
    Permission.SYSTEM_SETTINGS,
    Permission.SYSTEM_LOGS,
    Permission.SYSTEM_BACKUP,
    Permission.SYSTEM_RESTORE,

    // API 权限
    Permission.API_ACCESS,
    Permission.API_MANAGE,
  ],

  // 商户：拥有自己资源的管理权限
  [UserRole.MERCHANT]: [
    // 用户管理（仅自己）
    Permission.USER_READ,
    Permission.USER_UPDATE,

    // 店铺管理（仅自己的店铺）
    Permission.SHOP_READ,
    Permission.SHOP_CREATE,
    Permission.SHOP_UPDATE,
    Permission.SHOP_DELETE,
    Permission.SHOP_MANAGE_TOKEN,

    // 产品管理（仅自己的产品）
    Permission.PRODUCT_READ,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.PRODUCT_IMPORT,
    Permission.PRODUCT_EXPORT,

    // 订单管理（仅自己的订单）
    Permission.ORDER_READ,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE,
    Permission.ORDER_PROCESS,

    // 平台产品管理（仅自己的平台产品）
    Permission.PLATFORM_PRODUCT_READ,
    Permission.PLATFORM_PRODUCT_CREATE,
    Permission.PLATFORM_PRODUCT_UPDATE,
    Permission.PLATFORM_PRODUCT_DELETE,
    Permission.PLATFORM_PRODUCT_SYNC,

    // API 权限
    Permission.API_ACCESS,
  ],

  // API 用户：仅拥有 API 访问权限
  [UserRole.API_USER]: [
    // 用户管理（仅自己）
    Permission.USER_READ,

    // 店铺管理（只读）
    Permission.SHOP_READ,

    // 产品管理（只读）
    Permission.PRODUCT_READ,

    // 订单管理（只读）
    Permission.ORDER_READ,

    // 平台产品管理（只读）
    Permission.PLATFORM_PRODUCT_READ,

    // API 权限
    Permission.API_ACCESS,
  ],
};

/**
 * 检查用户是否拥有指定权限
 *
 * @param userRole 用户角色
 * @param permission 要检查的权限
 * @returns 是否拥有权限
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = RolePermissions[userRole];
  return permissions.includes(permission);
}

/**
 * 检查用户是否拥有任意一个指定权限
 *
 * @param userRole 用户角色
 * @param permissions 要检查的权限列表
 * @returns 是否拥有任意一个权限
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * 检查用户是否拥有所有指定权限
 *
 * @param userRole 用户角色
 * @param permissions 要检查的权限列表
 * @returns 是否拥有所有权限
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * 获取用户角色的所有权限
 *
 * @param userRole 用户角色
 * @returns 权限列表
 */
export function getUserPermissions(userRole: UserRole): Permission[] {
  return RolePermissions[userRole];
}

/**
 * 权限检查装饰器（用于 API 路由）
 *
 * @param permission 要检查的权限
 * @returns 是否有权限
 */
export function checkPermission(userRole: UserRole, permission: Permission): boolean {
  if (!hasPermission(userRole, permission)) {
    return false;
  }
  return true;
}

/**
 * 权限组：将相关权限分组
 */
export const PermissionGroups = {
  // 用户管理权限组
  USER_MANAGEMENT: [
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE_ROLE,
  ],

  // 店铺管理权限组
  SHOP_MANAGEMENT: [
    Permission.SHOP_READ,
    Permission.SHOP_CREATE,
    Permission.SHOP_UPDATE,
    Permission.SHOP_DELETE,
    Permission.SHOP_MANAGE_TOKEN,
  ],

  // 产品管理权限组
  PRODUCT_MANAGEMENT: [
    Permission.PRODUCT_READ,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.PRODUCT_IMPORT,
    Permission.PRODUCT_EXPORT,
  ],

  // 订单管理权限组
  ORDER_MANAGEMENT: [
    Permission.ORDER_READ,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE,
    Permission.ORDER_DELETE,
    Permission.ORDER_PROCESS,
  ],

  // 平台产品管理权限组
  PLATFORM_PRODUCT_MANAGEMENT: [
    Permission.PLATFORM_PRODUCT_READ,
    Permission.PLATFORM_PRODUCT_CREATE,
    Permission.PLATFORM_PRODUCT_UPDATE,
    Permission.PLATFORM_PRODUCT_DELETE,
    Permission.PLATFORM_PRODUCT_SYNC,
  ],

  // 系统管理权限组
  SYSTEM_MANAGEMENT: [
    Permission.SYSTEM_SETTINGS,
    Permission.SYSTEM_LOGS,
    Permission.SYSTEM_BACKUP,
    Permission.SYSTEM_RESTORE,
  ],

  // API 权限组
  API_MANAGEMENT: [Permission.API_ACCESS, Permission.API_MANAGE],
};
