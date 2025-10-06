# API 路由模板文档

本文档提供标准的 API 路由模板和最佳实践，用于规范 API 开发流程。

## 📋 目录

- [基础 API 路由模板](#基础-api-路由模板)
- [带认证的 API 路由](#带认证的-api-路由)
- [带权限验证的 API 路由](#带权限验证的-api-路由)
- [分页查询 API 路由](#分页查询-api-路由)
- [文件上传 API 路由](#文件上传-api-路由)
- [错误处理最佳实践](#错误处理最佳实践)

---

## 基础 API 路由模板

最简单的 API 路由模板，适用于不需要认证的公开接口。

```typescript
// src/app/api/v1/example/route.ts
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { handleError } from "@/lib/error-handler";
import { validateRequestBody } from "@/lib/validate-request";
import { z } from "zod";

// 定义请求 schema
const requestSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  email: z.string().email("邮箱格式不正确"),
});

/**
 * POST /api/v1/example
 * 示例 API 接口
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证请求体
    const data = await validateRequestBody(request, requestSchema);

    // 2. 业务逻辑
    const result = {
      id: "123",
      ...data,
      createdAt: new Date().toISOString(),
    };

    // 3. 返回成功响应
    return successResponse(result, "创建成功");
  } catch (error) {
    // 4. 错误处理
    return handleError(error);
  }
}

/**
 * GET /api/v1/example
 * 获取示例数据
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    // 2. 业务逻辑
    const result = {
      id,
      name: "示例数据",
    };

    // 3. 返回成功响应
    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}
```

---

## 带认证的 API 路由

需要用户登录才能访问的 API 路由。

```typescript
// src/app/api/v1/protected/route.ts
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { handleError } from "@/lib/error-handler";
import { requireAuth } from "@/lib/auth-middleware";
import { validateRequestBody } from "@/lib/validate-request";
import { z } from "zod";

const requestSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

/**
 * POST /api/v1/protected
 * 需要认证的接口
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 认证检查
    const { session, error } = await requireAuth(request);
    if (error) return error;

    // 2. 验证请求体
    const data = await validateRequestBody(request, requestSchema);

    // 3. 业务逻辑（可以使用 session.user）
    const result = {
      id: "123",
      ...data,
      userId: session.user.id,
      createdAt: new Date().toISOString(),
    };

    // 4. 返回成功响应
    return successResponse(result, "创建成功");
  } catch (error) {
    return handleError(error);
  }
}
```

---

## 带权限验证的 API 路由

需要特定权限才能访问的 API 路由。

```typescript
// src/app/api/v1/admin/users/route.ts
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { handleError } from "@/lib/error-handler";
import { requirePermission } from "@/lib/auth-middleware";
import { Permission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/v1/admin/users
 * 获取用户列表（需要 USER_READ 权限）
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 权限验证
    const { session, error } = await requirePermission(request, Permission.USER_READ);
    if (error) return error;

    // 2. 业务逻辑
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // 3. 返回成功响应
    return successResponse(users);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/v1/admin/users/[id]
 * 删除用户（需要 USER_DELETE 权限）
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. 权限验证
    const { error } = await requirePermission(request, Permission.USER_DELETE);
    if (error) return error;

    // 2. 业务逻辑
    await prisma.user.delete({
      where: { id: params.id },
    });

    // 3. 返回成功响应
    return successResponse(null, "删除成功");
  } catch (error) {
    return handleError(error);
  }
}
```

---

## 分页查询 API 路由

支持分页、排序和搜索的列表查询接口。

```typescript
// src/app/api/v1/products/route.ts
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { handleError } from "@/lib/error-handler";
import { requireAuth } from "@/lib/auth-middleware";
import { validateQueryParams } from "@/lib/validate-request";
import {
  fullQuerySchema,
  paginatedQuery,
  createOrderBy,
  createSearchCondition,
} from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/v1/products
 * 获取产品列表（支持分页、排序、搜索）
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 认证检查
    const { session, error } = await requireAuth(request);
    if (error) return error;

    // 2. 验证查询参数
    const queryParams = validateQueryParams(request, fullQuerySchema);
    const { page, pageSize, sortBy, sortOrder, search } = queryParams;

    // 3. 构建查询条件
    const where = {
      userId: session.user.id,
      ...createSearchCondition(search, ["name", "description", "sku"]),
    };

    const orderBy = createOrderBy(sortBy, sortOrder);

    // 4. 执行分页查询
    const result = await paginatedQuery(
      { page, pageSize },
      (skip, take) =>
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
      () => prisma.product.count({ where })
    );

    // 5. 返回成功响应
    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}
```

---

## 文件上传 API 路由

处理文件上传的 API 路由。

```typescript
// src/app/api/v1/upload/route.ts
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { handleError } from "@/lib/error-handler";
import { requireAuth } from "@/lib/auth-middleware";
import { validateFile } from "@/lib/validate-request";

/**
 * POST /api/v1/upload
 * 上传文件
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 认证检查
    const { session, error } = await requireAuth(request);
    if (error) return error;

    // 2. 获取上传的文件
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new ValidationError("请选择要上传的文件");
    }

    // 3. 验证文件
    validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      allowedExtensions: ["jpg", "jpeg", "png", "webp"],
    });

    // 4. 处理文件上传（示例：保存到本地或云存储）
    // const buffer = await file.arrayBuffer();
    // const fileName = `${Date.now()}-${file.name}`;
    // ... 保存文件逻辑

    // 5. 返回成功响应
    const result = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: `/uploads/${file.name}`, // 示例 URL
    };

    return successResponse(result, "上传成功");
  } catch (error) {
    return handleError(error);
  }
}
```

---

## 错误处理最佳实践

### 1. 使用自定义错误类

```typescript
import { NotFoundError, ValidationError, UnauthorizedError, ForbiddenError } from "@/lib/errors";

// 抛出特定错误
throw new NotFoundError("用户");
throw new ValidationError("邮箱格式不正确");
throw new UnauthorizedError("请先登录");
throw new ForbiddenError("没有权限执行此操作");
```

### 2. 统一错误处理

所有 API 路由都应该使用 `handleError` 函数处理错误：

```typescript
try {
  // 业务逻辑
} catch (error) {
  return handleError(error); // 统一错误处理
}
```

### 3. 数据库错误处理

Prisma 错误会自动被 `handleError` 处理：

```typescript
try {
  await prisma.user.create({
    data: { email: "duplicate@example.com" },
  });
} catch (error) {
  // P2002 错误会自动转换为 409 CONFLICT
  return handleError(error);
}
```

---

## 📝 开发规范

### 1. 文件命名

- API 路由文件：`route.ts`
- 动态路由：`[id]/route.ts`
- 路由组：`(group)/route.ts`

### 2. 函数命名

- HTTP 方法：`GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- 使用 async/await
- 添加 JSDoc 注释

### 3. 响应格式

- 成功：使用 `successResponse(data, message)`
- 错误：使用 `handleError(error)`
- 分页：使用 `paginatedQuery` 或 `createPaginatedResponse`

### 4. 验证顺序

1. 认证检查（如果需要）
2. 权限验证（如果需要）
3. 请求参数验证
4. 业务逻辑
5. 返回响应

### 5. 安全建议

- 始终验证用户输入
- 使用参数化查询（Prisma 自动处理）
- 不要在响应中暴露敏感信息
- 使用 HTTPS（生产环境）
- 实施速率限制（TODO）

---

## 🔗 相关文档

- [API 响应格式](../src/lib/api-response.ts)
- [错误处理](../src/lib/error-handler.ts)
- [请求验证](../src/lib/validate-request.ts)
- [分页工具](../src/lib/pagination.ts)
- [认证中间件](../src/lib/auth-middleware.ts)
- [权限系统](../src/lib/permissions.ts)
