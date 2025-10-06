/**
 * 产品详情页面
 */

"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useProduct } from "@/hooks/use-products";
import {
  usePlatformProducts,
  useDistributeProduct,
  useDeletePlatformProduct,
} from "@/hooks/use-platform-products";
import { useShops } from "@/hooks/use-shops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useProduct(id);
  const { data: platformProductsData } = usePlatformProducts({ productId: id });
  const { data: shopsData } = useShops({ pageSize: 100 });
  const distributeProduct = useDistributeProduct();
  const deletePlatformProduct = useDeletePlatformProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [platformProductId, setPlatformProductId] = useState("");
  const [price, setPrice] = useState("");
  const [inventory, setInventory] = useState("");

  const handleDistribute = async () => {
    if (!selectedShopId || !platformProductId || !price || !inventory) {
      alert("请填写所有字段");
      return;
    }

    try {
      await distributeProduct.mutateAsync({
        productId: id,
        data: {
          shopId: selectedShopId,
          platformProductId,
          price: parseFloat(price),
          inventory: parseInt(inventory),
        },
      });
      setIsDialogOpen(false);
      setSelectedShopId("");
      setPlatformProductId("");
      setPrice("");
      setInventory("");
    } catch {
      alert("分发失败，请重试");
    }
  };

  const handleDelete = async (platformProductId: string) => {
    if (confirm("确定要取消分发吗？")) {
      try {
        await deletePlatformProduct.mutateAsync(platformProductId);
      } catch {
        alert("取消分发失败，请重试");
      }
    }
  };

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

      {/* Platform Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>分销平台</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  添加分销
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>分发产品到店铺</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">选择店铺</label>
                    <Select value={selectedShopId} onValueChange={setSelectedShopId}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择店铺" />
                      </SelectTrigger>
                      <SelectContent>
                        {shopsData?.data?.data?.map((shop: any) => (
                          <SelectItem key={shop.id} value={shop.id}>
                            {shop.shopName} ({shop.platform})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">平台产品ID</label>
                    <Input
                      value={platformProductId}
                      onChange={(e) => setPlatformProductId(e.target.value)}
                      placeholder="输入平台产品ID"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">价格</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="输入价格"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">库存</label>
                    <Input
                      type="number"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      placeholder="输入库存"
                    />
                  </div>

                  <Button
                    onClick={handleDistribute}
                    disabled={distributeProduct.isPending}
                    className="w-full"
                  >
                    {distributeProduct.isPending ? "分发中..." : "确认分发"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {platformProductsData?.data?.data?.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">暂未分发到任何平台</p>
          ) : (
            <div className="space-y-4">
              {platformProductsData?.data?.data?.map((pp: any) => (
                <div
                  key={pp.id}
                  className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{pp.shop.shopName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      平台: {pp.platform} | 价格: {pp.price} | 库存: {pp.inventory}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(pp.id)}
                    disabled={deletePlatformProduct.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
