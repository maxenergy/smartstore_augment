"use client";

import { useState } from "react";
import { useSyncLogs } from "@/hooks/use-sync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function SyncLogsPage() {
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading, error, refetch } = useSyncLogs({
    page,
    pageSize: 20,
    platform: platform === "all" ? undefined : platform,
    status: status === "all" ? undefined : status,
  });

  const logs = data?.data || [];
  const pagination = data?.pagination;

  // 格式化同步类型
  const formatSyncType = (type: string) => {
    const types: Record<string, string> = {
      PRICE: "价格",
      STOCK: "库存",
      INFO: "信息",
      ALL: "全部",
    };
    return types[type] || type;
  };

  // 格式化平台
  const formatPlatform = (platform: string) => {
    const platforms: Record<string, string> = {
      SHOPIFY: "Shopify",
      AMAZON: "Amazon",
      TIKTOK: "TikTok Shop",
      EBAY: "eBay",
    };
    return platforms[platform] || platform;
  };

  // 解析变更详情
  const parseChanges = (oldValue: string | null, newValue: string | null) => {
    if (!oldValue || !newValue) return null;

    try {
      const old = JSON.parse(oldValue);
      const newVal = JSON.parse(newValue);
      const changes: string[] = [];

      Object.keys(newVal).forEach((key) => {
        if (old[key] !== newVal[key]) {
          changes.push(`${key}: ${old[key]} → ${newVal[key]}`);
        }
      });

      return changes.length > 0 ? changes.join(", ") : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">同步日志</h1>
          <p className="text-muted-foreground mt-1">查看所有产品的同步历史记录</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">平台</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="选择平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部平台</SelectItem>
                  <SelectItem value="SHOPIFY">Shopify</SelectItem>
                  <SelectItem value="AMAZON">Amazon</SelectItem>
                  <SelectItem value="TIKTOK">TikTok Shop</SelectItem>
                  <SelectItem value="EBAY">eBay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">状态</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="SUCCESS">成功</SelectItem>
                  <SelectItem value="FAILED">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setPlatform("all");
                  setStatus("all");
                  setPage(1);
                }}
                className="w-full"
              >
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 同步日志列表 */}
      <Card>
        <CardHeader>
          <CardTitle>同步记录</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">加载失败，请刷新重试</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">暂无同步记录</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>产品名称</TableHead>
                      <TableHead>同步类型</TableHead>
                      <TableHead>平台</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>同步时间</TableHead>
                      <TableHead>变更详情</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.product?.title || "未知产品"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatSyncType(log.syncType)}</Badge>
                        </TableCell>
                        <TableCell>{formatPlatform(log.platform)}</TableCell>
                        <TableCell>
                          {log.status === "SUCCESS" ? (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>成功</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <XCircle className="h-4 w-4" />
                              <span>失败</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(log.syncedAt), "yyyy-MM-dd HH:mm:ss", {
                            locale: zhCN,
                          })}
                        </TableCell>
                        <TableCell className="max-w-md">
                          {log.message || parseChanges(log.oldValue, log.newValue) || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 分页 */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    共 {pagination.total} 条记录，第 {pagination.page} /{" "}
                    {pagination.totalPages} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                    >
                      下一页
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

