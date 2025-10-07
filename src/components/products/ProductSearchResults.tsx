"use client";

import { useState } from "react";
import { ExternalProduct, SearchResult } from "@/hooks/use-product-search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ProductImage } from "@/components/ui/optimized-image";
import { ProductListSkeleton } from "@/components/products/ProductCardSkeleton";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Star,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

interface ProductSearchResultsProps {
  searchResult: SearchResult | null;
  isLoading: boolean;
  onImport: (products: ExternalProduct[]) => void;
  onPageChange: (page: number) => void;
}

export function ProductSearchResults({
  searchResult,
  isLoading,
  onImport,
  onPageChange,
}: ProductSearchResultsProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  if (isLoading) {
    return <ProductListSkeleton count={6} />;
  }

  if (!searchResult) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">输入关键词开始搜索产品</p>
        </div>
      </div>
    );
  }

  if (searchResult.items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">未找到匹配的产品</p>
          <p className="text-sm text-muted-foreground mt-2">
            尝试使用不同的关键词或调整筛选条件
          </p>
        </div>
      </div>
    );
  }

  const { items, pagination } = searchResult;

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
    if (selectedProducts.size === items.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(items.map((p) => p.externalId)));
    }
  };

  const handleImport = () => {
    const productsToImport = items.filter((p) => selectedProducts.has(p.externalId));
    onImport(productsToImport);
  };

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedProducts.size === items.length && items.length > 0}
            onCheckedChange={toggleAll}
          />
          <span className="text-sm text-muted-foreground">
            已选择 {selectedProducts.size} / {items.length} 个产品
          </span>
        </div>

        <Button
          onClick={handleImport}
          disabled={selectedProducts.size === 0}
          size="sm"
        >
          导入选中产品 ({selectedProducts.size})
        </Button>
      </div>

      {/* 产品列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((product) => (
          <Card
            key={product.externalId}
            className={`cursor-pointer transition-all ${
              selectedProducts.has(product.externalId)
                ? "ring-2 ring-primary"
                : "hover:shadow-md"
            }`}
            onClick={() => toggleProduct(product.externalId)}
          >
            <CardHeader className="p-0">
              <div className="relative">
                {product.images[0] ? (
                  <ProductImage
                    src={product.images[0]}
                    alt={product.title}
                    className="rounded-t-lg"
                  />
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center rounded-t-lg">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedProducts.has(product.externalId)}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => toggleProduct(product.externalId)}
                  />
                </div>
                {product.dropshippingSupported && (
                  <Badge className="absolute top-2 right-2" variant="secondary">
                    一件代发
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold line-clamp-2 text-sm">{product.title}</h3>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {product.currency} {product.price.toFixed(2)}
                </span>
                {product.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating.toFixed(1)}</span>
                    {product.reviewCount && (
                      <span className="text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {product.salesCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>销量: {product.salesCount}</span>
                  </div>
                )}
                {product.stockQuantity !== undefined && (
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>库存: {product.stockQuantity}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                <p>供应商: {product.supplierName}</p>
                {product.shippingTime && <p>发货时效: {product.shippingTime}</p>}
                {product.shippingFrom && <p>发货地: {product.shippingFrom}</p>}
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(product.supplierUrl, "_blank");
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                查看原产品
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>

          <span className="text-sm text-muted-foreground">
            第 {pagination.page} / {pagination.totalPages} 页
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

