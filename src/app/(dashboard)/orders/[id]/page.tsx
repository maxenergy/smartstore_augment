/**
 * 订单详情页面
 */

"use client";

import { use } from "react";
import Link from "next/link";
import { useOrder, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (status: string) => {
    if (confirm(`确定要将订单状态更新为 ${status} 吗？`)) {
      try {
        await updateStatus.mutateAsync({ id, status });
      } catch {
        alert("状态更新失败，请重试");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">加载失败，请刷新重试</p>
      </div>
    );
  }

  const order = data.data;
  const items = order.items ? JSON.parse(order.items) : [];
  const shippingAddress = order.shippingAddress ? JSON.parse(order.shippingAddress) : {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">订单详情</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">订单号: {order.orderNumber}</p>
          </div>
        </div>

        <Select
          value={order.status}
          onValueChange={handleStatusChange}
          disabled={updateStatus.isPending}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">待支付</SelectItem>
            <SelectItem value="PAID">已支付</SelectItem>
            <SelectItem value="PROCESSING">处理中</SelectItem>
            <SelectItem value="SHIPPED">已发货</SelectItem>
            <SelectItem value="DELIVERED">已送达</SelectItem>
            <SelectItem value="CANCELLED">已取消</SelectItem>
            <SelectItem value="REFUNDED">已退款</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">订单金额</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {order.currency} {order.totalAmount}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">平台</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {order.platform}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">创建时间</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              {order.paidAt && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">支付时间</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(order.paidAt).toLocaleString()}
                  </p>
                </div>
              )}

              {order.shippedAt && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">发货时间</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(order.shippedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {order.deliveredAt && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">送达时间</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(order.deliveredAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>客户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">姓名</p>
              <p className="text-gray-900 dark:text-white">{order.customerName}</p>
            </div>

            {order.customerEmail && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">邮箱</p>
                <p className="text-gray-900 dark:text-white">{order.customerEmail}</p>
              </div>
            )}

            {order.customerPhone && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">电话</p>
                <p className="text-gray-900 dark:text-white">{order.customerPhone}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">收货地址</p>
              <p className="text-gray-900 dark:text-white">
                {shippingAddress.country} {shippingAddress.state} {shippingAddress.city}
                <br />
                {shippingAddress.address}
                <br />
                {shippingAddress.postalCode}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>订单项</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    数量: {item.quantity} × {order.currency} {item.price}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {order.currency} {item.total}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
