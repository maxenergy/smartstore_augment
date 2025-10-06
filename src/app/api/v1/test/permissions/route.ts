import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth-middleware";
import { successResponse, ApiErrors, handleApiError } from "@/lib/api-response";
import { Permission, getUserPermissions } from "@/lib/permissions";

/**
 * GET /api/v1/test/permissions
 * 权限测试接口
 *
 * @description 测试 RBAC 权限系统，返回当前用户的所有权限
 * @returns { success: boolean, data: { permissions: Permission[] } }
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户是否拥有 USER_READ 权限
    const authResult = await requirePermission(request, Permission.USER_READ);

    if (authResult.error) {
      return authResult.error;
    }

    const session = authResult.session!;

    // 获取用户的所有权限
    const permissions = getUserPermissions(session.user.role);

    // 返回权限列表
    return successResponse({
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
      permissions,
      permissionCount: permissions.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * 其他 HTTP 方法不支持
 */
export async function POST() {
  return ApiErrors.METHOD_NOT_ALLOWED("POST");
}

export async function PUT() {
  return ApiErrors.METHOD_NOT_ALLOWED("PUT");
}

export async function DELETE() {
  return ApiErrors.METHOD_NOT_ALLOWED("DELETE");
}

export async function PATCH() {
  return ApiErrors.METHOD_NOT_ALLOWED("PATCH");
}
