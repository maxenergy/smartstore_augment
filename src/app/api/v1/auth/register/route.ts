import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { successResponse, ApiErrors, handleApiError } from "@/lib/api-response";
import { UserRole, UserStatus } from "@/types/auth";

/**
 * POST /api/v1/auth/register
 * 用户注册 API
 *
 * @description 创建新用户账号，包含邮箱验证、密码加密、用户创建
 * @body { email: string, password: string, name?: string }
 * @returns { success: boolean, data: { user: User } }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json();

    // 2. 验证请求数据
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR("数据验证失败", validationResult.error.errors);
    }

    const { email, password, name } = validationResult.data;

    // 3. 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return ApiErrors.CONFLICT("该邮箱已被注册");
    }

    // 4. 加密密码
    const hashedPassword = await hash(password, 12);

    // 5. 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: UserRole.MERCHANT, // 默认角色为商户
        status: UserStatus.ACTIVE, // 默认状态为激活
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        // 不返回密码
      },
    });

    // 6. 返回成功响应
    return successResponse(
      {
        user,
        message: "注册成功",
      },
      201
    );
  } catch (error) {
    // 7. 错误处理
    return handleApiError(error);
  }
}

/**
 * 其他 HTTP 方法不支持
 */
export async function GET() {
  return ApiErrors.METHOD_NOT_ALLOWED("GET");
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
