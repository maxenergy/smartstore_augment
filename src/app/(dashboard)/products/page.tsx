/**
 * 产品列表页面
 * 支持筛选、搜索、分页
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
import { Plus, Search, Pencil, Trash2, Package, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductListSkeleton } from "@/components/products/ProductCardSkeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/ui/optimized-image";

// 动态导入对话框组件（懒加载）
const ProductSyncDialog = dynamic(
  () => import("@/components/products/ProductSyncDialog").then((mod) => ({ default: mod.ProductSyncDialog })),
  { ssr: false }
);

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [platform, setPlatform] = useState<string>("all");
  const [dropshippingOnly, setDropshippingOnly] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);

  const { data, isLoading, error } = useProducts({
    page,
    pageSize: 10,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    sourcePlatform: platform === "all" ? undefined : platform,
    dropshippingSupported: dropshippingOnly === "all" ? undefined : dropshippingOnly === "true",
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

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p: any) => p.id)));
    }
  };

  const getSelectedProductTitles = () => {
    return products
      .filter((p: any) => selectedProducts.has(p.id))
      .map((p: any) => p.title);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">产品管理</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            管理您的所有产品
            {selectedProducts.size > 0 && (
              <span className="ml-2 text-primary">
                （已选择 {selectedProducts.size} 个）
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedProducts.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSyncDialogOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">批量同步</span>
              <span className="sm:hidden">同步</span> ({selectedProducts.size})
            </Button>
          )}
          <Link href="/products/search" className="flex-1 sm:flex-none">
            <Button size="sm" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              搜索产品
            </Button>
          </Link>
          <Link href="/products/new" className="flex-1 sm:flex-none">
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">手动添加</span>
              <span className="sm:hidden">添加</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                <SelectItem value="all">全部状态</SelectItem>
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
                <SelectItem value="all">全部平台</SelectItem>
                <SelectItem value="AMAZON">Amazon</SelectItem>
                <SelectItem value="TIKTOK">TikTok</SelectItem>
                <SelectItem value="SHOPIFY">Shopify</SelectItem>
                <SelectItem value="EBAY">eBay</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dropshippingOnly} onValueChange={setDropshippingOnly}>
              <SelectTrigger>
                <SelectValue placeholder="一件代发" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部产品</SelectItem>
                <SelectItem value="true">仅一件代发</SelectItem>
                <SelectItem value="false">非一件代发</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setPlatform("all");
                setDropshippingOnly("all");
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
        <ProductListSkeleton count={6} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="暂无产品"
          description="您还没有添加任何产品。点击下方按钮开始搜索或手动添加产品。"
          action={{
            label: "搜索产品",
            onClick: () => (window.location.href = "/products/search"),
          }}
        />
      ) : (
        <>
          {/* 批量操作栏 */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Checkbox
              checked={selectedProducts.size === products.length && products.length > 0}
              onCheckedChange={toggleAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedProducts.size === products.length && products.length > 0
                ? "取消全选"
                : "全选"}
            </span>
            {selectedProducts.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProducts(new Set())}
              >
                清除选择
              </Button>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any, index: number) => (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all duration-300 hover-lift animate-slide-in-up ${
                  selectedProducts.has(product.id)
                    ? "ring-2 ring-primary shadow-lg"
                    : ""
                } ${index < 6 ? `stagger-${index + 1}` : ""}`}
                onClick={() => product.dropshippingSupported && toggleProduct(product.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 flex-1">{product.title}</CardTitle>
                    {product.dropshippingSupported && (
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => toggleProduct(product.id)}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.images && JSON.parse(product.images)[0] ? (
                    <ProductImage
                      src={JSON.parse(product.images)[0]}
                      alt={product.title}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">价格</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {product.currency} {product.price}
                      </span>
                    </div>

                    {product.profitMargin && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">利润率</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {product.profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    )}

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

                    {product.dropshippingSupported && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Package className="mr-1 h-3 w-3" />
                          一件代发
                        </Badge>
                        {product.supplierName && (
                          <span className="text-xs text-muted-foreground truncate">
                            {product.supplierName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full active-scale">
                        查看
                      </Button>
                    </Link>
                    <Link href={`/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm" className="active-scale">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">编辑</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="active-scale"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                      disabled={deleteProduct.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">删除</span>
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

      {/* 批量同步对话框 */}
      <ProductSyncDialog
        open={isSyncDialogOpen}
        onOpenChange={setIsSyncDialogOpen}
        productIds={Array.from(selectedProducts)}
        productTitles={getSelectedProductTitles()}
      />
    </div>
  );
}
