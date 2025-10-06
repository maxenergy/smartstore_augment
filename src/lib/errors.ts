/**
 * 自定义 API 错误类
 * 用于在应用中抛出结构化的错误
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // 维护正确的堆栈跟踪（仅在 V8 引擎中可用）
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * 认证错误 (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = "未授权访问", details?: unknown) {
    super(message, 401, "UNAUTHORIZED", details);
    this.name = "UnauthorizedError";
  }
}

/**
 * 权限错误 (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = "没有权限执行此操作", details?: unknown) {
    super(message, 403, "FORBIDDEN", details);
    this.name = "ForbiddenError";
  }
}

/**
 * 未找到错误 (404)
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = "资源", details?: unknown) {
    super(`${resource}不存在`, 404, "NOT_FOUND", details);
    this.name = "NotFoundError";
  }
}

/**
 * 验证错误 (400)
 */
export class ValidationError extends ApiError {
  constructor(message: string = "数据验证失败", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

/**
 * 冲突错误 (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = "资源冲突", details?: unknown) {
    super(message, 409, "CONFLICT", details);
    this.name = "ConflictError";
  }
}

/**
 * 请求过于频繁错误 (429)
 */
export class TooManyRequestsError extends ApiError {
  constructor(message: string = "请求过于频繁，请稍后再试", details?: unknown) {
    super(message, 429, "TOO_MANY_REQUESTS", details);
    this.name = "TooManyRequestsError";
  }
}

/**
 * 无效请求错误 (400)
 */
export class BadRequestError extends ApiError {
  constructor(message: string = "无效的请求", details?: unknown) {
    super(message, 400, "BAD_REQUEST", details);
    this.name = "BadRequestError";
  }
}

/**
 * 服务不可用错误 (503)
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = "服务暂时不可用", details?: unknown) {
    super(message, 503, "SERVICE_UNAVAILABLE", details);
    this.name = "ServiceUnavailableError";
  }
}

/**
 * 数据库错误 (500)
 */
export class DatabaseError extends ApiError {
  constructor(message: string = "数据库操作失败", details?: unknown) {
    super(message, 500, "DATABASE_ERROR", details);
    this.name = "DatabaseError";
  }
}

/**
 * 外部服务错误 (502)
 */
export class ExternalServiceError extends ApiError {
  constructor(message: string = "外部服务调用失败", details?: unknown) {
    super(message, 502, "EXTERNAL_SERVICE_ERROR", details);
    this.name = "ExternalServiceError";
  }
}
