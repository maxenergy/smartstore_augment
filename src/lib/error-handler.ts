import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import { errorResponse, ApiResponse } from "@/lib/api-response";

/**
 * 全局错误处理器
 * 统一处理各类错误并返回标准化的错误响应
 *
 * @param error 错误对象
 * @returns NextResponse 错误响应
 */
export function handleError(error: unknown): NextResponse<ApiResponse> {
  // 记录错误日志
  console.error("Error occurred:", error);

  // 1. 处理自定义 ApiError
  if (error instanceof ApiError) {
    return errorResponse(error.code, error.message, error.statusCode, error.details);
  }

  // 2. 处理 Zod 验证错误
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
      code: err.code,
    }));

    return errorResponse("VALIDATION_ERROR", "数据验证失败", 400, formattedErrors);
  }

  // 3. 处理 Prisma 错误
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return errorResponse("DATABASE_VALIDATION_ERROR", "数据库验证失败", 400, {
      message: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return errorResponse("DATABASE_CONNECTION_ERROR", "数据库连接失败", 503, {
      message: error.message,
    });
  }

  // 4. 处理标准 Error
  if (error instanceof Error) {
    // 检查是否是 NextAuth 错误
    if (error.message.includes("NextAuth")) {
      return errorResponse("AUTH_ERROR", error.message, 401);
    }

    // 其他标准错误
    return errorResponse(
      "INTERNAL_ERROR",
      process.env.NODE_ENV === "production" ? "服务器内部错误" : error.message,
      500,
      process.env.NODE_ENV === "development" ? { stack: error.stack } : undefined
    );
  }

  // 5. 未知错误
  return errorResponse(
    "UNKNOWN_ERROR",
    "发生未知错误",
    500,
    process.env.NODE_ENV === "development" ? { error } : undefined
  );
}

/**
 * 处理 Prisma 错误
 * 将 Prisma 错误代码转换为用户友好的错误消息
 *
 * @param error Prisma 错误对象
 * @returns NextResponse 错误响应
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse<ApiResponse> {
  switch (error.code) {
    // 唯一约束违反
    case "P2002": {
      const target = (error.meta?.target as string[]) || [];
      const field = target.length > 0 ? target[0] : "字段";
      return errorResponse("UNIQUE_CONSTRAINT_VIOLATION", `${field}已存在`, 409, { field, target });
    }

    // 记录未找到
    case "P2025": {
      return errorResponse("RECORD_NOT_FOUND", "记录不存在", 404, { cause: error.meta?.cause });
    }

    // 外键约束违反
    case "P2003": {
      return errorResponse("FOREIGN_KEY_CONSTRAINT_VIOLATION", "关联的记录不存在", 400, {
        field: error.meta?.field_name,
      });
    }

    // 必填字段缺失
    case "P2011": {
      return errorResponse("NULL_CONSTRAINT_VIOLATION", "必填字段不能为空", 400, {
        constraint: error.meta?.constraint,
      });
    }

    // 数据库连接超时
    case "P1008": {
      return errorResponse("DATABASE_TIMEOUT", "数据库操作超时", 504, {
        timeout: error.meta?.timeout,
      });
    }

    // 数据库连接失败
    case "P1001": {
      return errorResponse("DATABASE_CONNECTION_FAILED", "无法连接到数据库", 503);
    }

    // 数据库不存在
    case "P1003": {
      return errorResponse("DATABASE_NOT_FOUND", "数据库不存在", 503);
    }

    // 表不存在
    case "P2021": {
      return errorResponse("TABLE_NOT_FOUND", "数据表不存在", 500, { table: error.meta?.table });
    }

    // 字段不存在
    case "P2009": {
      return errorResponse("FIELD_NOT_FOUND", "字段不存在", 500, { field: error.meta?.field });
    }

    // 记录依赖冲突（无法删除）
    case "P2014": {
      return errorResponse("RECORD_DEPENDENCY_CONFLICT", "无法删除，存在关联记录", 409, {
        relation: error.meta?.relation_name,
      });
    }

    // 默认处理
    default: {
      return errorResponse(
        "DATABASE_ERROR",
        "数据库操作失败",
        500,
        process.env.NODE_ENV === "development" ? { code: error.code, meta: error.meta } : undefined
      );
    }
  }
}

/**
 * 异步错误处理包装器
 * 用于包装异步函数，自动捕获并处理错误
 *
 * @param fn 异步函数
 * @returns 包装后的函数
 */
export function asyncHandler<T extends (...args: unknown[]) => Promise<unknown>>(fn: T): T {
  return ((...args: Parameters<T>) => {
    return Promise.resolve(fn(...args)).catch((error) => {
      throw error; // 重新抛出错误，由上层处理
    });
  }) as T;
}

/**
 * 错误日志记录器
 * 记录错误详情到日志系统
 *
 * @param error 错误对象
 * @param context 错误上下文信息
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const logLevel = error instanceof ApiError && error.statusCode < 500 ? "warn" : "error";

  const logData = {
    timestamp,
    level: logLevel,
    error: {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof ApiError ? error.code : undefined,
      statusCode: error instanceof ApiError ? error.statusCode : undefined,
      details: error instanceof ApiError ? error.details : undefined,
    },
    context,
  };

  // 在生产环境中，这里应该发送到日志服务（如 Sentry, LogRocket 等）
  if (process.env.NODE_ENV === "production") {
    // TODO: 集成日志服务
    console[logLevel](JSON.stringify(logData));
  } else {
    console[logLevel]("Error Log:", logData);
  }
}
