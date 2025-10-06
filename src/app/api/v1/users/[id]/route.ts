/**
 * 用户详情 API
 * GET /api/v1/users/[id] - 获取用户详情（包含关联店铺信息）
 * PUT /api/v1/users/[id] - 更新用户信息
 * DELETE /api/v1/users/[id] - 删除用户
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin, requireOwnerOrAdmin } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { validatePathParams, validateRequestBody } from "@/lib/validate-request";
import { userIdSchema, updateUserSchema } from "@/lib/validations/user";
import { userService } from "@/services/user.service";
import { successResponse } from "@/lib/api-response";
import { ForbiddenError } from "@/lib/errors";

/**
 * GET /api/v1/users/[id]
 * 获取用户详情
 * 权限：管理员或本人
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证用户登录
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    // 验证路径参数
    const { id } = validatePathParams(params, userIdSchema);

    // 权限检查：管理员或本人
    const ownerCheckResult = await requireOwnerOrAdmin(request, id);
    if (ownerCheckResult && ownerCheckResult.error) {
      return ownerCheckResult.error;
    }

    // 获取用户详情
    const user = await userService.getUserById(id);

    // 返回成功响应
    return successResponse(user);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/v1/users/[id]
 * 更新用户信息
 * 权限：管理员或本人（本人不能修改角色）
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证用户登录
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const currentUser = authResult.session.user;

    // 验证路径参数
    const { id } = validatePathParams(params, userIdSchema);

    // 验证请求体
    const updateData = await validateRequestBody(request, updateUserSchema);

    // 权限检查
    const isAdmin = currentUser.role === "ADMIN";
    const isOwner = currentUser.id === id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError("无权修改此用户信息");
    }

    // 非管理员不能修改角色和状态
    if (!isAdmin) {
      if (updateData.role) {
        throw new ForbiddenError("无权修改用户角色");
      }
      if (updateData.status) {
        throw new ForbiddenError("无权修改用户状态");
      }
    }

    // 更新用户信息
    const user = await userService.updateUser(id, updateData);

    // 返回成功响应
    return successResponse(user);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/v1/users/[id]
 * 删除用户
 * 权限：仅管理员
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证管理员权限
    const adminResult = await requireAdmin(request);
    if (adminResult.error) {
      return adminResult.error;
    }
    const currentUser = adminResult.session.user;

    // 验证路径参数
    const { id } = validatePathParams(params, userIdSchema);

    // 防止删除自己
    if (currentUser.id === id) {
      throw new ForbiddenError("不能删除当前登录用户");
    }

    // 删除用户
    await userService.deleteUser(id);

    // 返回成功响应
    return successResponse(null);
  } catch (error) {
    return handleError(error);
  }
}
