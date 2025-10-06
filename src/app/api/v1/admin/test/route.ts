import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { successResponse, ApiErrors, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/admin/test
 * 管理员测试接口
 *
 * @description 仅管理员可访问的测试接口，用于验证权限中间件
 * @returns { success: boolean, data: { message: string } }
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户是否为管理员
    const authResult = await requireAdmin(request);

    if (authResult.error) {
      return authResult.error;
    }

    const session = authResult.session!;

    // 返回成功响应
    return successResponse({
      message: "欢迎，管理员！",
      user: session.user,
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
