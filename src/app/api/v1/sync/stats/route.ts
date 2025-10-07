/**
 * 同步统计 API
 * GET /api/v1/sync/stats - 获取同步统计信息
 */

import { NextRequest } from "next/server";
import { SyncService } from "@/services/sync.service";
import { requireAuth } from "@/lib/auth-middleware";
import { handleError } from "@/lib/error-handler";
import { successResponse } from "@/lib/api-response";
import { hasPermission } from "@/lib/permissions";

const syncService = new SyncService();

/**
 * GET /api/v1/sync/stats
 * 获取同步统计信息
 */
export async function GET(request: NextRequest) {
  try {
    // 认证检查
    const { error, session } = await requireAuth();
    if (error) return error;

    // 权限检查：普通用户只能查看自己的统计
    const userId = hasPermission(session!.user.role, "products:read:all")
      ? undefined
      : session!.user.id;

    // 获取同步统计
    const stats = await syncService.getSyncStats(userId);

    return successResponse(stats);
  } catch (err) {
    return handleError(err);
  }
}
