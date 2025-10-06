/**
 * 仪表板首页
 * 显示统计卡片和数据概览
 */

"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Store, ShoppingCart, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  const stats = [
    {
      name: "总产品数",
      value: "0",
      icon: Package,
      change: "+0%",
      changeType: "positive",
    },
    {
      name: "总店铺数",
      value: "0",
      icon: Store,
      change: "+0%",
      changeType: "positive",
    },
    {
      name: "总订单数",
      value: "0",
      icon: ShoppingCart,
      change: "+0%",
      changeType: "positive",
    },
    {
      name: "总销售额",
      value: "¥0",
      icon: TrendingUp,
      change: "+0%",
      changeType: "positive",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          欢迎回来，{session?.user?.name || "用户"}！
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">这是您的跨境电商分销系统仪表板</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.changeType === "positive"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {stat.change} 较上月
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/dashboard/products/new"
              className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">添加产品</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">创建新产品</p>
              </div>
            </a>

            <a
              href="/dashboard/shops"
              className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Store className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">管理店铺</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">查看所有店铺</p>
              </div>
            </a>

            <a
              href="/dashboard/orders"
              className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">查看订单</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">管理所有订单</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">暂无活动记录</div>
        </CardContent>
      </Card>
    </div>
  );
}
