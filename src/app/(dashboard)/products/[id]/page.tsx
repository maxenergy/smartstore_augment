/**
 * 产品详情页面
 */

"use client";

import { use } from "react";
import Link from "next/link";
import { useProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">加载中...</p>
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

  const product = data.data;
  const images = product.images ? JSON.parse(product.images) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">产品详情</h1>
          </div>
        </div>
        <Link href={`/dashboard/products/${id}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            编辑
          </Button>
        </Link>
      </div>

      {/* Product Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>产品图片</CardTitle>
          </CardHeader>
          <CardContent>
            {images.length > 0 ? (
              <div className="grid gap-4">
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <img src={images[0]} alt={product.title} className="object-cover w-full h-full" />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(1, 5).map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                      >
                        <img
                          src={img}
                          alt={`${product.title} ${idx + 2}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-400">
                无图片
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {product.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">价格</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {product.currency} {product.price}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">状态</p>
                  <p
                    className={`text-lg font-semibold ${
                      product.status === "ACTIVE"
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {product.status === "ACTIVE"
                      ? "上架"
                      : product.status === "INACTIVE"
                        ? "下架"
                        : "缺货"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">来源平台</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {product.sourcePlatform}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">分类</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {product.category || "未分类"}
                  </p>
                </div>
              </div>

              {product.description && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">描述</p>
                  <p className="text-gray-900 dark:text-white">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
