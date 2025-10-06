import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiErrors } from "@/lib/api-response";
import { UserRole, UserStatus } from "@/types/auth";

/**
 * 认证中间件 - 验证用户是否已登录
 *
 * @description 检查用户是否已通过认证，未认证返回 401 错误
 * @returns Session 对象或错误响应
 */
export async function requireAuth(_request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      error: ApiErrors.UNAUTHORIZED("请先登录"),
      session: null,
    };
  }

  // 检查用户状态
  if (session.user.status === UserStatus.SUSPENDED) {
    return {
      error: ApiErrors.FORBIDDEN("账号已被暂停，请联系管理员"),
      session: null,
    };
  }

  if (session.user.status === UserStatus.INACTIVE) {
    return {
      error: ApiErrors.FORBIDDEN("账号未激活，请先激活邮箱"),
      session: null,
    };
  }

  return {
    error: null,
    session,
  };
}

/**
 * 角色验证中间件 - 验证用户是否具有指定角色
 *
 * @description 检查用户是否具有指定的角色权限
 * @param allowedRoles 允许的角色列表
 * @returns Session 对象或错误响应
 */
export async function requireRole(request: NextRequest, allowedRoles: UserRole[]) {
  // 首先验证用户是否已登录
  const authResult = await requireAuth(request);

  if (authResult.error) {
    return authResult;
  }

  const session = authResult.session!;

  // 检查用户角色
  if (!allowedRoles.includes(session.user.role)) {
    return {
      error: ApiErrors.FORBIDDEN("没有权限执行此操作"),
      session: null,
    };
  }

  return {
    error: null,
    session,
  };
}

/**
 * 管理员权限验证中间件
 *
 * @description 验证用户是否为管理员
 * @returns Session 对象或错误响应
 */
export async function requireAdmin(request: NextRequest) {
  return requireRole(request, [UserRole.ADMIN]);
}

/**
 * 商户权限验证中间件
 *
 * @description 验证用户是否为商户或管理员
 * @returns Session 对象或错误响应
 */
export async function requireMerchant(request: NextRequest) {
  return requireRole(request, [UserRole.ADMIN, UserRole.MERCHANT]);
}

/**
 * API 用户权限验证中间件
 *
 * @description 验证用户是否为 API 用户或管理员
 * @returns Session 对象或错误响应
 */
export async function requireApiUser(request: NextRequest) {
  return requireRole(request, [UserRole.ADMIN, UserRole.API_USER]);
}

/**
 * 资源所有者验证中间件
 *
 * @description 验证用户是否为资源所有者或管理员
 * @param userId 资源所有者的用户 ID
 * @returns Session 对象或错误响应
 */
export async function requireOwnerOrAdmin(request: NextRequest, userId: string) {
  const authResult = await requireAuth(request);

  if (authResult.error) {
    return authResult;
  }

  const session = authResult.session!;

  // 管理员可以访问所有资源
  if (session.user.role === UserRole.ADMIN) {
    return {
      error: null,
      session,
    };
  }

  // 检查是否为资源所有者
  if (session.user.id !== userId) {
    return {
      error: ApiErrors.FORBIDDEN("只能访问自己的资源"),
      session: null,
    };
  }

  return {
    error: null,
    session,
  };
}

/**
 * 获取当前用户会话（不强制要求认证）
 *
 * @description 获取当前用户会话，如果未登录返回 null
 * @returns Session 对象或 null
 */
export async function getOptionalSession(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * 验证用户是否可以访问指定用户的资源
 *
 * @description 检查当前用户是否可以访问指定用户的资源（管理员或资源所有者）
 * @param currentUserId 当前用户 ID
 * @param currentUserRole 当前用户角色
 * @param targetUserId 目标用户 ID
 * @returns 是否有权限
 */
export function canAccessUserResource(
  currentUserId: string,
  currentUserRole: UserRole,
  targetUserId: string
): boolean {
  // 管理员可以访问所有资源
  if (currentUserRole === UserRole.ADMIN) {
    return true;
  }

  // 用户只能访问自己的资源
  return currentUserId === targetUserId;
}

/**
 * 验证用户是否可以修改指定用户的资源
 *
 * @description 检查当前用户是否可以修改指定用户的资源（管理员或资源所有者）
 * @param currentUserId 当前用户 ID
 * @param currentUserRole 当前用户角色
 * @param targetUserId 目标用户 ID
 * @returns 是否有权限
 */
export function canModifyUserResource(
  currentUserId: string,
  currentUserRole: UserRole,
  targetUserId: string
): boolean {
  return canAccessUserResource(currentUserId, currentUserRole, targetUserId);
}

/**
 * 验证用户是否可以删除指定用户的资源
 *
 * @description 检查当前用户是否可以删除指定用户的资源（仅管理员）
 * @param currentUserRole 当前用户角色
 * @returns 是否有权限
 */
export function canDeleteUserResource(currentUserRole: UserRole): boolean {
  return currentUserRole === UserRole.ADMIN;
}
