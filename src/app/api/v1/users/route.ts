/**
 * 用户列表 API
 * GET /api/v1/users - 获取用户列表（支持分页、筛选、搜索、排序）
 */

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { validateQueryParams } from "@/lib/validate-request";
import { userListQuerySchema } from "@/lib/validations/user";
import { userService } from "@/services/user.service";
import { createPaginatedResponse } from "@/lib/pagination";
import { successResponse } from "@/lib/api-response";

/**
 * GET /api/v1/users
 * 获取用户列表
 * 权限：仅管理员
 */
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    await requireAdmin(request);

    // 验证查询参数
    const queryParams = await validateQueryParams(request, userListQuerySchema);

    // 调用服务层获取用户列表
    const { users, total } = await userService.getUsers({
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      role: queryParams.role,
      status: queryParams.status,
      search: queryParams.search,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });

    // 创建分页响应
    const paginatedData = createPaginatedResponse(
      users,
      queryParams.page,
      queryParams.pageSize,
      total
    );

    // 返回成功响应
    return successResponse(paginatedData, 200, "获取用户列表成功");
  } catch (error) {
    return handleError(error);
  }
}
