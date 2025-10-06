import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { successResponse, ApiErrors, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/auth/me
 * 获取当前登录用户信息
 *
 * @description 返回当前登录用户的详细信息（需要认证）
 * @returns { success: boolean, data: { user: User } }
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户是否已登录
    const authResult = await requireAuth(request);

    if (authResult.error) {
      return authResult.error;
    }

    const session = authResult.session!;

    // 返回用户信息
    return successResponse({
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
