/**
 * 产品列表页面
 * 支持筛选、搜索、分页
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");

  const { data, isLoading, error } = useProducts({
    page,
    pageSize: 10,
    search: search || undefined,
    status: status || undefined,
    sourcePlatform: platform || undefined,
  });

  const deleteProduct = useDeleteProduct();

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个产品吗？")) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch {
        alert("删除失败，请重试");
      }
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">加载失败，请刷新重试</p>
      </div>
    );
  }

  const products = data?.data?.data || [];
  const pagination = data?.data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">产品管理</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">管理您的所有产品</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            添加产品
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索产品..."
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
                <SelectItem value="ACTIVE">上架</SelectItem>
                <SelectItem value="INACTIVE">下架</SelectItem>
                <SelectItem value="OUT_OF_STOCK">缺货</SelectItem>
              </SelectContent>
            </Select>

            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="来源平台" />
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

      {/* Products List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无产品</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{product.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    {product.images && JSON.parse(product.images)[0] ? (
                      <img
                        src={JSON.parse(product.images)[0]}
                        alt={product.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        无图片
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">价格</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {product.currency} {product.price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">状态</span>
                      <span
                        className={`text-sm font-medium ${
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
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">平台</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.sourcePlatform}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/products/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        查看
                      </Button>
                    </Link>
                    <Link href={`/dashboard/products/${product.id}/edit`}>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteProduct.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
