import { NextRequest } from "next/server";
import { z, ZodSchema } from "zod";
import { ValidationError } from "@/lib/errors";

/**
 * 验证请求体
 * 使用 Zod schema 验证请求体数据
 *
 * @param request NextRequest 对象
 * @param schema Zod schema
 * @returns 验证后的数据
 * @throws ValidationError 验证失败时抛出
 */
export async function validateRequestBody<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    // 解析请求体
    const body = await request.json();

    // 验证数据
    const result = schema.safeParse(body);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
        code: err.code,
      }));

      throw new ValidationError("请求体验证失败", formattedErrors);
    }

    return result.data;
  } catch (error) {
    // 如果是 JSON 解析错误
    if (error instanceof SyntaxError) {
      throw new ValidationError("请求体格式不正确，必须是有效的 JSON");
    }

    // 重新抛出其他错误
    throw error;
  }
}

/**
 * 验证查询参数
 * 使用 Zod schema 验证 URL 查询参数
 *
 * @param request NextRequest 对象
 * @param schema Zod schema
 * @returns 验证后的数据
 * @throws ValidationError 验证失败时抛出
 */
export function validateQueryParams<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string | string[]> = {};

    // 转换 URLSearchParams 为普通对象
    searchParams.forEach((value, key) => {
      // 如果同一个 key 有多个值，转换为数组
      if (params[key]) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    });

    // 验证数据
    const result = schema.safeParse(params);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
        code: err.code,
      }));

      throw new ValidationError("查询参数验证失败", formattedErrors);
    }

    return result.data;
  } catch (error) {
    // 重新抛出错误
    throw error;
  }
}

/**
 * 验证路径参数
 * 使用 Zod schema 验证路径参数
 *
 * @param params 路径参数对象
 * @param schema Zod schema
 * @returns 验证后的数据
 * @throws ValidationError 验证失败时抛出
 */
export function validatePathParams<T extends ZodSchema>(
  params: Record<string, string | string[]>,
  schema: T
): z.infer<T> {
  try {
    // 验证数据
    const result = schema.safeParse(params);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
        code: err.code,
      }));

      throw new ValidationError("路径参数验证失败", formattedErrors);
    }

    return result.data;
  } catch (error) {
    // 重新抛出错误
    throw error;
  }
}

/**
 * 验证请求（组合验证）
 * 同时验证请求体、查询参数和路径参数
 *
 * @param request NextRequest 对象
 * @param schemas 验证 schema 对象
 * @returns 验证后的数据
 * @throws ValidationError 验证失败时抛出
 */
export async function validateRequest<
  TBody extends ZodSchema | undefined = undefined,
  TQuery extends ZodSchema | undefined = undefined,
  TParams extends ZodSchema | undefined = undefined,
>(
  request: NextRequest,
  schemas: {
    body?: TBody;
    query?: TQuery;
    params?: TParams;
    pathParams?: Record<string, string | string[]>;
  }
): Promise<{
  body: TBody extends ZodSchema ? z.infer<TBody> : undefined;
  query: TQuery extends ZodSchema ? z.infer<TQuery> : undefined;
  params: TParams extends ZodSchema ? z.infer<TParams> : undefined;
}> {
  const result: {
    body?: unknown;
    query?: unknown;
    params?: unknown;
  } = {};

  // 验证请求体
  if (schemas.body) {
    result.body = await validateRequestBody(request, schemas.body);
  }

  // 验证查询参数
  if (schemas.query) {
    result.query = validateQueryParams(request, schemas.query);
  }

  // 验证路径参数
  if (schemas.params && schemas.pathParams) {
    result.params = validatePathParams(schemas.pathParams, schemas.params);
  }

  return result as {
    body: TBody extends ZodSchema ? z.infer<TBody> : undefined;
    query: TQuery extends ZodSchema ? z.infer<TQuery> : undefined;
    params: TParams extends ZodSchema ? z.infer<TParams> : undefined;
  };
}

/**
 * 创建验证中间件
 * 返回一个可以在 API 路由中使用的验证函数
 *
 * @param schema Zod schema
 * @returns 验证函数
 */
export function createValidator<T extends ZodSchema>(schema: T) {
  return async (request: NextRequest): Promise<z.infer<T>> => {
    return validateRequestBody(request, schema);
  };
}

/**
 * 验证文件上传
 * 验证上传的文件类型和大小
 *
 * @param file File 对象
 * @param options 验证选项
 * @throws ValidationError 验证失败时抛出
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // 最大文件大小（字节）
    allowedTypes?: string[]; // 允许的 MIME 类型
    allowedExtensions?: string[]; // 允许的文件扩展名
  } = {}
): void {
  const { maxSize, allowedTypes, allowedExtensions } = options;

  // 验证文件大小
  if (maxSize && file.size > maxSize) {
    throw new ValidationError(`文件大小超过限制（最大 ${maxSize / 1024 / 1024}MB）`);
  }

  // 验证文件类型
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new ValidationError(`不支持的文件类型（允许的类型：${allowedTypes.join(", ")}）`);
  }

  // 验证文件扩展名
  if (allowedExtensions) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      throw new ValidationError(
        `不支持的文件扩展名（允许的扩展名：${allowedExtensions.join(", ")}）`
      );
    }
  }
}

/**
 * 验证多个文件上传
 * 验证多个上传文件的类型和大小
 *
 * @param files File 对象数组
 * @param options 验证选项
 * @throws ValidationError 验证失败时抛出
 */
export function validateFiles(
  files: File[],
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
    maxCount?: number; // 最大文件数量
  } = {}
): void {
  const { maxCount, ...fileOptions } = options;

  // 验证文件数量
  if (maxCount && files.length > maxCount) {
    throw new ValidationError(`文件数量超过限制（最大 ${maxCount} 个）`);
  }

  // 验证每个文件
  files.forEach((file, index) => {
    try {
      validateFile(file, fileOptions);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`文件 ${index + 1}: ${error.message}`);
      }
      throw error;
    }
  });
}
