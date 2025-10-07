/**
 * 数据同步管理页面
 */

"use client";

import { useState } from "react";
import { useSyncLogs, useSyncStats } from "@/hooks/use-sync";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";

export default function SyncPage() {
  const [page, setPage] = useState(1);
  const [syncType, setSyncType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data: statsData, isLoading: statsLoading } = useSyncStats();
  const { data: logsData, isLoading: logsLoading } = useSyncLogs({
    page,
    pageSize: 10,
    syncType: syncType === "all" ? undefined : syncType,
    status: status === "all" ? undefined : status,
  });

  const stats = statsData?.data;
  const logs = logsData?.data?.data || [];
  const pagination = logsData?.data?.meta;

  const getSyncTypeText = (type: string) => {
    const texts: Record<string, string> = {
      INVENTORY: "库存同步",
      PRICE: "价格同步",
      ORDER: "订单同步",
    };
    return texts[type] || type;
  };

  const getStatusIcon = (status: string) => {
    if (status === "SUCCESS") {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (status === "FAILED") {
      return <XCircle className="h-4 w-4 text-red-600" />;
    } else {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      SUCCESS: "成功",
      FAILED: "失败",
      PENDING: "进行中",
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">数据同步</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">管理和监控数据同步状态</p>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                总同步次数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalSyncs || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                成功次数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats?.successSyncs || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                失败次数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{stats?.failedSyncs || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                成功率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats?.successRate || 0}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Select value={syncType} onValueChange={setSyncType}>
              <SelectTrigger>
                <SelectValue placeholder="同步类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="INVENTORY">库存同步</SelectItem>
                <SelectItem value="PRICE">价格同步</SelectItem>
                <SelectItem value="ORDER">订单同步</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="SUCCESS">成功</SelectItem>
                <SelectItem value="FAILED">失败</SelectItem>
                <SelectItem value="PENDING">进行中</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSyncType("");
                setStatus("");
              }}
            >
              重置筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Logs */}
      <Card>
        <CardHeader>
          <CardTitle>同步日志</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">暂无同步日志</p>
          ) : (
            <>
              <div className="space-y-4">
                {logs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 border-b border-gray-200 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="mt-1">{getStatusIcon(log.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getSyncTypeText(log.syncType)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {getStatusText(log.status)}
                        </span>
                      </div>
                      {log.message && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {log.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(log.syncedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    上一页
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    第 {page} / {pagination.totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
