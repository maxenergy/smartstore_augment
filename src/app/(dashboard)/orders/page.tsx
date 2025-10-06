/**
 * 订单列表页面
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye } from "lucide-react";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");

  const { data, isLoading, error } = useOrders({
    page,
    pageSize: 10,
    search: search || undefined,
    status: status || undefined,
    platform: platform || undefined,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">加载失败，请刷新重试</p>
      </div>
    );
  }

  const orders = data?.data?.data || [];
  const pagination = data?.data?.meta;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "text-yellow-600 dark:text-yellow-400",
      PAID: "text-blue-600 dark:text-blue-400",
      PROCESSING: "text-purple-600 dark:text-purple-400",
      SHIPPED: "text-indigo-600 dark:text-indigo-400",
      DELIVERED: "text-green-600 dark:text-green-400",
      CANCELLED: "text-red-600 dark:text-red-400",
      REFUNDED: "text-gray-600 dark:text-gray-400",
    };
    return colors[status] || "text-gray-600 dark:text-gray-400";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: "待支付",
      PAID: "已支付",
      PROCESSING: "处理中",
      SHIPPED: "已发货",
      DELIVERED: "已送达",
      CANCELLED: "已取消",
      REFUNDED: "已退款",
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">订单管理</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">管理您的所有订单</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索订单..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="PENDING">待支付</SelectItem>
                <SelectItem value="PAID">已支付</SelectItem>
                <SelectItem value="PROCESSING">处理中</SelectItem>
                <SelectItem value="SHIPPED">已发货</SelectItem>
                <SelectItem value="DELIVERED">已送达</SelectItem>
                <SelectItem value="CANCELLED">已取消</SelectItem>
                <SelectItem value="REFUNDED">已退款</SelectItem>
              </SelectContent>
            </Select>

            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="平台" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部平台</SelectItem>
                <SelectItem value="AMAZON">Amazon</SelectItem>
                <SelectItem value="TIKTOK">TikTok</SelectItem>
                <SelectItem value="SHOPIFY">Shopify</SelectItem>
                <SelectItem value="OWN">自有</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatus("");
                setPlatform("");
              }}
            >
              重置筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无订单</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          订单号: {order.orderNumber}
                        </h3>
                        <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">客户：</span>
                          <span className="ml-1 text-gray-900 dark:text-white">
                            {order.customerName}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-600 dark:text-gray-400">金额：</span>
                          <span className="ml-1 text-gray-900 dark:text-white">
                            {order.currency} {order.totalAmount}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-600 dark:text-gray-400">平台：</span>
                          <span className="ml-1 text-gray-900 dark:text-white">
                            {order.platform}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-600 dark:text-gray-400">创建时间：</span>
                          <span className="ml-1 text-gray-900 dark:text-white">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
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
    </div>
  );
}
