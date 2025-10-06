/**
 * 平台产品管理页面
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  usePlatformProducts,
  useUpdateInventory,
  useDeletePlatformProduct,
} from "@/hooks/use-platform-products";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Package, Trash2 } from "lucide-react";

export default function PlatformProductsPage() {
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const { data, isLoading, error } = usePlatformProducts({
    page,
    pageSize: 12,
    platform: platform || undefined,
    status: status || undefined,
  });

  const updateInventory = useUpdateInventory();
  const deletePlatformProduct = useDeletePlatformProduct();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newInventory, setNewInventory] = useState("");

  const handleUpdateInventory = async (id: string) => {
    if (!newInventory) {
      alert("请输入库存数量");
      return;
    }

    try {
      await updateInventory.mutateAsync({
        id,
        inventory: parseInt(newInventory),
      });
      setEditingId(null);
      setNewInventory("");
    } catch {
      alert("更新失败，请重试");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定要取消分发吗？")) {
      try {
        await deletePlatformProduct.mutateAsync(id);
      } catch {
        alert("取消分发失败，请重试");
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

  const platformProducts = data?.data?.data || [];
  const pagination = data?.data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">平台产品管理</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">管理所有已分发的平台产品</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
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

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="ACTIVE">活跃</SelectItem>
                <SelectItem value="INACTIVE">停用</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setPlatform("");
                setStatus("");
              }}
            >
              重置筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform Products List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      ) : platformProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无平台产品</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {platformProducts.map((pp: any) => (
              <Card key={pp.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {pp.product.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">店铺</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {pp.shop.shopName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">平台</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {pp.platform}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">价格</span>
                      <span className="font-medium text-gray-900 dark:text-white">{pp.price}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">库存</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {pp.inventory}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setEditingId(pp.id);
                            setNewInventory(pp.inventory.toString());
                          }}
                        >
                          更新库存
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>更新库存</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">新库存数量</label>
                            <Input
                              type="number"
                              value={newInventory}
                              onChange={(e) => setNewInventory(e.target.value)}
                              placeholder="输入库存数量"
                            />
                          </div>
                          <Button
                            onClick={() => handleUpdateInventory(pp.id)}
                            disabled={updateInventory.isPending}
                            className="w-full"
                          >
                            {updateInventory.isPending ? "更新中..." : "确认更新"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(pp.id)}
                      disabled={deletePlatformProduct.isPending}
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
