"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Platform } from "@prisma/client";
import { ProductSearchForm } from "@/components/products/ProductSearchForm";
import { ProductSearchResults } from "@/components/products/ProductSearchResults";

// 动态导入对话框组件（懒加载）
const ProductImportDialog = dynamic(
  () => import("@/components/products/ProductImportDialog").then((mod) => ({ default: mod.ProductImportDialog })),
  { ssr: false }
);
import {
  useProductSearch,
  useProductImport,
  ProductSearchParams,
  ExternalProduct,
  PricingStrategy,
  SearchResult,
} from "@/hooks/use-product-search";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { ProductListSkeleton } from "@/components/products/ProductCardSkeleton";

export default function ProductSearchPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [currentSearchParams, setCurrentSearchParams] = useState<ProductSearchParams | null>(
    null
  );
  const [selectedProducts, setSelectedProducts] = useState<ExternalProduct[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const searchMutation = useProductSearch();
  const importMutation = useProductImport();

  // 处理搜索
  const handleSearch = async (params: ProductSearchParams) => {
    setCurrentSearchParams(params);

    try {
      const result = await searchMutation.mutateAsync(params);
      setSearchResult(result);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "搜索失败",
        description: error.response?.data?.error?.message || error.message || "搜索产品时发生错误",
      });
      setSearchResult(null);
    }
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    if (currentSearchParams) {
      handleSearch({
        ...currentSearchParams,
        page,
      });
    }
  };

  // 打开导入对话框
  const handleImport = (products: ExternalProduct[]) => {
    setSelectedProducts(products);
    setImportDialogOpen(true);
  };

  // 确认导入
  const handleConfirmImport = async (strategy: PricingStrategy) => {
    if (!currentSearchParams) return;

    try {
      const result = await importMutation.mutateAsync({
        platform: currentSearchParams.platform,
        products: selectedProducts,
        pricingStrategy: strategy,
      });

      toast({
        title: "导入成功",
        description: `成功导入 ${result.imported} 个产品，失败 ${result.failed} 个`,
      });

      setImportDialogOpen(false);
      setSelectedProducts([]);

      // 跳转到产品列表
      router.push("/products");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "导入失败",
        description: error.response?.data?.error?.message || error.message || "导入产品时发生错误",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回产品列表
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">搜索产品</h1>
          <p className="text-muted-foreground mt-1">
            从第三方平台搜索热卖产品并批量导入
          </p>
        </div>
      </div>

      {/* API 配置提示 */}
      <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4 text-sm">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-yellow-900 dark:text-yellow-100">
            API 配置提示
          </p>
          <p className="mt-1 text-yellow-800 dark:text-yellow-200">
            当前 Shopify API 未配置。要使用产品搜索功能，请在环境变量中配置以下参数：
          </p>
          <ul className="mt-2 space-y-1 text-yellow-800 dark:text-yellow-200 list-disc list-inside">
            <li>SHOPIFY_API_KEY - Shopify API 密钥</li>
            <li>SHOPIFY_API_SECRET - Shopify API 密钥</li>
            <li>SHOPIFY_ACCESS_TOKEN - Shopify 访问令牌</li>
            <li>SHOPIFY_SHOP_DOMAIN - Shopify 店铺域名</li>
          </ul>
          <p className="mt-2 text-yellow-800 dark:text-yellow-200">
            配置完成后重启服务器即可使用搜索功能。
          </p>
        </div>
      </div>

      {/* 搜索表单 */}
      <div className="rounded-lg border bg-card p-4 sm:p-6">
        <ProductSearchForm
          onSearch={handleSearch}
          isLoading={searchMutation.isPending}
        />
      </div>

      {/* 搜索结果 */}
      <div className="rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">搜索结果</h2>
        <ProductSearchResults
          searchResult={searchResult}
          isLoading={searchMutation.isPending}
          onImport={handleImport}
          onPageChange={handlePageChange}
        />
      </div>

      {/* 导入对话框 */}
      <ProductImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        products={selectedProducts}
        onConfirm={handleConfirmImport}
        isLoading={importMutation.isPending}
      />
    </div>
  );
}

