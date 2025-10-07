/**
 * 产品详情页面
 */

"use client";

import { use, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useProduct } from "@/hooks/use-products";
import {
  usePlatformProducts,
  useDistributeProduct,
  useDeletePlatformProduct,
} from "@/hooks/use-platform-products";
import { useShops } from "@/hooks/use-shops";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Pencil, Plus, Trash2, RefreshCw, Clock } from "lucide-react";
import { useSyncProduct, useProductSyncLogs, SyncType } from "@/hooks/use-sync";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ProductImage } from "@/components/ui/optimized-image";

// 动态导入对话框组件（懒加载）
const Dialog = dynamic(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.Dialog })), { ssr: false });
const DialogContent = dynamic(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogContent })), { ssr: false });
const DialogHeader = dynamic(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogHeader })), { ssr: false });
const DialogTitle = dynamic(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogTitle })), { ssr: false });
const DialogTrigger = dynamic(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogTrigger })), { ssr: false });

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
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [selectedSyncType, setSelectedSyncType] = useState<SyncType>("ALL");

  const { toast } = useToast();
  const syncProductMutation = useSyncProduct();
  const { data: syncLogsData } = useProductSyncLogs(id, 5);

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

  const handleSync = async () => {
    try {
      const result = await syncProductMutation.mutateAsync({
        productId: id,
        syncType: selectedSyncType,
      });

      toast({
        title: result.success ? "同步成功" : "同步失败",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

      setIsSyncDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "同步失败",
        description: error.response?.data?.error?.message || error.message || "同步产品时发生错误",
      });
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
          <Link href="/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">产品详情</h1>
          </div>
        </div>
        <div className="flex gap-2">
          {product.dropshippingSupported && (
            <Button variant="outline" onClick={() => setIsSyncDialogOpen(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              同步产品
            </Button>
          )}
          <Link href={`/products/${id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              编辑
            </Button>
          </Link>
        </div>
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
                <ProductImage
                  src={images[0]}
                  alt={product.title}
                  className="rounded-lg"
                  priority
                />
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(1, 5).map((img: string, idx: number) => (
                      <ProductImage
                        key={idx}
                        src={img}
                        alt={`${product.title} ${idx + 2}`}
                        className="rounded-lg"
                      />
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

      {/* 同步日志 */}
      {product.dropshippingSupported && (
        <Card>
          <CardHeader>
            <CardTitle>同步日志</CardTitle>
          </CardHeader>
          <CardContent>
            {syncLogsData && syncLogsData.length > 0 ? (
              <div className="space-y-3">
                {syncLogsData.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between border-b border-gray-200 dark:border-gray-800 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{log.syncType}</Badge>
                        <Badge
                          variant={log.status === "SUCCESS" ? "default" : "destructive"}
                        >
                          {log.status === "SUCCESS" ? "成功" : "失败"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.message}</p>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(log.syncedAt), "MM-dd HH:mm", { locale: zhCN })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                暂无同步记录
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 同步对话框 */}
      <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>同步产品</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">同步类型</label>
              <Select
                value={selectedSyncType}
                onValueChange={(value) => setSelectedSyncType(value as SyncType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRICE">价格同步</SelectItem>
                  <SelectItem value="STOCK">库存同步</SelectItem>
                  <SelectItem value="INFO">信息同步</SelectItem>
                  <SelectItem value="ALL">全部同步</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSync}
              disabled={syncProductMutation.isPending}
              className="w-full"
            >
              {syncProductMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  同步中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  开始同步
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
