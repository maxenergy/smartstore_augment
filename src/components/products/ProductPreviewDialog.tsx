/**
 * 产品详情预览对话框
 * 快速查看产品详细信息
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Package,
  DollarSign,
  Star,
  TrendingUp,
  Truck,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import { Platform } from "@prisma/client";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  costPrice?: number;
  currency: string;
  images: string;
  status: string;
  sourcePlatform: Platform;
  externalId: string;
  supplierName?: string;
  supplierUrl?: string;
  dropshippingSupported: boolean;
  stockQuantity?: number;
  minOrderQuantity?: number;
  shippingTime?: string;
  shippingFrom?: string;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  profitMargin?: number;
}

interface ProductPreviewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductPreviewDialog({
  product,
  open,
  onOpenChange,
}: ProductPreviewDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const images = product.images ? JSON.parse(product.images) : [];
  const profit = product.costPrice
    ? product.price - product.costPrice
    : 0;
  const profitMargin = product.costPrice
    ? ((profit / product.costPrice) * 100).toFixed(1)
    : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 左侧：图片 */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <>
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={images[currentImageIndex]}
                    alt={product.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((img: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === index
                            ? "border-primary"
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.title} ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* 右侧：详细信息 */}
          <div className="space-y-4">
            {/* 状态和平台 */}
            <div className="flex items-center gap-2">
              <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>
                {product.status === "ACTIVE" ? "上架中" : "已下架"}
              </Badge>
              <Badge variant="outline">{product.sourcePlatform}</Badge>
              {product.dropshippingSupported && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  一件代发
                </Badge>
              )}
            </div>

            {/* 价格信息 */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-3xl font-bold">
                  {product.currency} {product.price.toFixed(2)}
                </span>
              </div>
              {product.costPrice && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    成本: {product.currency} {product.costPrice.toFixed(2)}
                  </span>
                  <span className="text-green-600 font-medium">
                    利润: {product.currency} {profit.toFixed(2)} ({profitMargin}%)
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* 评分和销量 */}
            {(product.rating || product.salesCount) && (
              <div className="flex items-center gap-4 text-sm">
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.rating.toFixed(1)}</span>
                    {product.reviewCount && (
                      <span className="text-muted-foreground">
                        ({product.reviewCount} 评论)
                      </span>
                    )}
                  </div>
                )}
                {product.salesCount && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{product.salesCount} 销量</span>
                  </div>
                )}
              </div>
            )}

            {/* 库存和起订量 */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.stockQuantity !== undefined && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>库存: {product.stockQuantity}</span>
                </div>
              )}
              {product.minOrderQuantity && (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span>起订: {product.minOrderQuantity}</span>
                </div>
              )}
            </div>

            {/* 物流信息 */}
            {(product.shippingTime || product.shippingFrom) && (
              <div className="space-y-2 text-sm">
                {product.shippingTime && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span>发货时效: {product.shippingTime}</span>
                  </div>
                )}
                {product.shippingFrom && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>发货地: {product.shippingFrom}</span>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* 供应商信息 */}
            {product.supplierName && (
              <div className="text-sm">
                <span className="text-muted-foreground">供应商: </span>
                <span className="font-medium">{product.supplierName}</span>
              </div>
            )}

            {/* 描述 */}
            {product.description && (
              <div className="space-y-2">
                <h4 className="font-semibold">产品描述</h4>
                <p className="text-sm text-muted-foreground line-clamp-6">
                  {product.description}
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(`/products/${product.id}`, "_blank")}
              >
                查看详情
              </Button>
              {product.supplierUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(product.supplierUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

