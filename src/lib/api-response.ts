import { NextResponse } from "next/server";

/**
 * API 响应接口
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * 创建成功响应
 * @param data 响应数据
 * @param status HTTP 状态码
 * @param message 可选的成功消息
 * @param meta 可选的元数据
 */
export function successResponse<T>(
  data: T,
  status?: number,
  message?: string,
  meta?: ApiResponse<T>["meta"]
): NextResponse<ApiResponse<T>> {
  const httpStatus = status || 200;

  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status: httpStatus }
  );
}

/**
 * 创建错误响应
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * 创建分页响应
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  status: number = 200
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * 常见错误响应
 */
export const ApiErrors = {
  // 认证错误 (401)
  UNAUTHORIZED: (message: string = "未授权访问") => errorResponse("UNAUTHORIZED", message, 401),

  // 权限错误 (403)
  FORBIDDEN: (message: string = "没有权限执行此操作") => errorResponse("FORBIDDEN", message, 403),

  // 未找到 (404)
  NOT_FOUND: (resource: string = "资源") => errorResponse("NOT_FOUND", `${resource}不存在`, 404),

  // 验证错误 (400)
  VALIDATION_ERROR: (message: string, details?: unknown) =>
    errorResponse("VALIDATION_ERROR", message, 400, details),

  // 冲突错误 (409)
  CONFLICT: (message: string) => errorResponse("CONFLICT", message, 409),

  // 服务器错误 (500)
  INTERNAL_ERROR: (message: string = "服务器内部错误") =>
    errorResponse("INTERNAL_ERROR", message, 500),

  // 请求方法不允许 (405)
  METHOD_NOT_ALLOWED: (method: string) =>
    errorResponse("METHOD_NOT_ALLOWED", `不支持的请求方法: ${method}`, 405),

  // 请求过于频繁 (429)
  TOO_MANY_REQUESTS: (message: string = "请求过于频繁，请稍后再试") =>
    errorResponse("TOO_MANY_REQUESTS", message, 429),

  // 无效的请求体 (400)
  INVALID_REQUEST_BODY: (message: string = "请求体格式不正确") =>
    errorResponse("INVALID_REQUEST_BODY", message, 400),

  // 缺少必需参数 (400)
  MISSING_REQUIRED_PARAMS: (params: string[]) =>
    errorResponse("MISSING_REQUIRED_PARAMS", `缺少必需参数: ${params.join(", ")}`, 400),
};

/**
 * 处理 API 错误
 * @deprecated 请使用 src/lib/error-handler.ts 中的 handleError 函数
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error("API Error:", error);

  if (error instanceof Error) {
    // Zod 验证错误
    if (error.name === "ZodError") {
      return ApiErrors.VALIDATION_ERROR("数据验证失败", error);
    }

    // Prisma 错误
    if (error.message.includes("Prisma")) {
      return ApiErrors.INTERNAL_ERROR("数据库操作失败");
    }

    // 其他已知错误
    return errorResponse("ERROR", error.message, 500);
  }

  // 未知错误
  return ApiErrors.INTERNAL_ERROR();
}
