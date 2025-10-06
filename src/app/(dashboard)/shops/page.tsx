/**
 * 店铺列表页面
 */

"use client";

import { useState } from "react";
import { useShops, useDeleteShop } from "@/hooks/use-shops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Store } from "lucide-react";
import { ShopForm } from "@/components/dashboard/shop-form";

export default function ShopsPage() {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);

  const { data, isLoading, error } = useShops({ page, pageSize: 12 });
  const deleteShop = useDeleteShop();

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个店铺吗？")) {
      try {
        await deleteShop.mutateAsync(id);
      } catch {
        alert("删除失败，请重试");
      }
    }
  };

  const handleEdit = (shop: any) => {
    setEditingShop(shop);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingShop(null);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">加载失败，请刷新重试</p>
      </div>
    );
  }

  const shops = data?.data?.data || [];
  const pagination = data?.data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">店铺管理</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">管理您的所有店铺</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingShop(null)}>
              <Plus className="mr-2 h-4 w-4" />
              添加店铺
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingShop ? "编辑店铺" : "添加店铺"}</DialogTitle>
            </DialogHeader>
            <ShopForm shop={editingShop} onSuccess={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Shops List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      ) : shops.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无店铺</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop: any) => (
              <Card key={shop.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    {shop.shopName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">平台</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {shop.platform}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">店铺ID</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {shop.shopId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">状态</span>
                      <span
                        className={`text-sm font-medium ${
                          shop.status === "ACTIVE"
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {shop.status === "ACTIVE" ? "活跃" : "停用"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => handleEdit(shop)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(shop.id)}
                      disabled={deleteShop.isPending}
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
