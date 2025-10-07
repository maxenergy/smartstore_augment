"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductSearchParams } from "@/hooks/use-product-search";

/**
 * 搜索表单 Schema
 */
const searchFormSchema = z.object({
  platform: z.nativeEnum(Platform),
  keyword: z.string().min(1, "请输入搜索关键词").max(200, "关键词过长"),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minSalesCount: z.coerce.number().int().min(0).optional(),
  dropshippingOnly: z.boolean().optional(),
  inStock: z.boolean().optional(),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

interface ProductSearchFormProps {
  onSearch: (params: ProductSearchParams) => void;
  isLoading?: boolean;
}

export function ProductSearchForm({ onSearch, isLoading }: ProductSearchFormProps) {
  const [showFilters, setShowFilters] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      platform: Platform.SHOPIFY,
      keyword: "",
      dropshippingOnly: false,
      inStock: true,
    },
  });

  const platform = watch("platform");
  const dropshippingOnly = watch("dropshippingOnly");
  const inStock = watch("inStock");

  const onSubmit = (data: SearchFormData) => {
    const { platform, keyword, minPrice, maxPrice, minRating, minSalesCount, dropshippingOnly, inStock } = data;

    onSearch({
      platform,
      keyword,
      filters: {
        minPrice,
        maxPrice,
        minRating,
        minSalesCount,
        dropshippingOnly,
        inStock,
      },
      page: 1,
      pageSize: 10,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {/* 平台选择和关键词搜索 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 平台选择 */}
        <div className="w-full sm:w-48">
          <Label htmlFor="platform">平台</Label>
          <Select
            value={platform}
            onValueChange={(value) => setValue("platform", value as Platform)}
          >
            <SelectTrigger id="platform">
              <SelectValue placeholder="选择平台" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Platform.SHOPIFY}>Shopify</SelectItem>
              <SelectItem value={Platform.AMAZON}>Amazon</SelectItem>
              <SelectItem value={Platform.TIKTOK}>TikTok Shop</SelectItem>
              <SelectItem value={Platform.EBAY}>eBay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 关键词输入 */}
        <div className="flex-1">
          <Label htmlFor="keyword">搜索关键词</Label>
          <div className="flex gap-2">
            <Input
              id="keyword"
              placeholder="输入产品名称或关键词..."
              {...register("keyword")}
              className={errors.keyword ? "border-red-500" : ""}
            />
            <Button type="submit" disabled={isLoading} size="default" className="shrink-0">
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{isLoading ? "搜索中..." : "搜索"}</span>
            </Button>
          </div>
          {errors.keyword && (
            <p className="mt-1 text-sm text-red-500">{errors.keyword.message}</p>
          )}
        </div>

        {/* 筛选按钮 */}
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            筛选
          </Button>
        </div>
      </div>

      {/* 高级筛选 */}
      {showFilters && (
        <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
          <h3 className="font-semibold text-sm">高级筛选</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 价格区间 */}
            <div>
              <Label htmlFor="minPrice">最低价格</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                step="0.01"
                {...register("minPrice")}
              />
            </div>

            <div>
              <Label htmlFor="maxPrice">最高价格</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="不限"
                step="0.01"
                {...register("maxPrice")}
              />
            </div>

            {/* 评分 */}
            <div>
              <Label htmlFor="minRating">最低评分</Label>
              <Select
                onValueChange={(value) =>
                  setValue("minRating", value ? parseFloat(value) : undefined)
                }
              >
                <SelectTrigger id="minRating">
                  <SelectValue placeholder="不限" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">不限</SelectItem>
                  <SelectItem value="4.5">4.5 星及以上</SelectItem>
                  <SelectItem value="4.0">4.0 星及以上</SelectItem>
                  <SelectItem value="3.5">3.5 星及以上</SelectItem>
                  <SelectItem value="3.0">3.0 星及以上</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 销量 */}
            <div>
              <Label htmlFor="minSalesCount">最低销量</Label>
              <Input
                id="minSalesCount"
                type="number"
                placeholder="0"
                {...register("minSalesCount")}
              />
            </div>
          </div>

          {/* 复选框筛选 */}
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dropshippingOnly"
                checked={dropshippingOnly}
                onCheckedChange={(checked) =>
                  setValue("dropshippingOnly", checked as boolean)
                }
              />
              <Label
                htmlFor="dropshippingOnly"
                className="text-sm font-normal cursor-pointer"
              >
                仅显示支持一件代发的产品
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={inStock}
                onCheckedChange={(checked) => setValue("inStock", checked as boolean)}
              />
              <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
                仅显示有库存的产品
              </Label>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

