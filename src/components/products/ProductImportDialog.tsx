"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ExternalProduct, PricingStrategy } from "@/hooks/use-product-search";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * 定价策略表单 Schema
 */
const pricingStrategySchema = z.object({
  type: z.enum(["MARGIN", "MARKUP", "CUSTOM"]),
  value: z.coerce.number().min(0).optional(),
});

type PricingStrategyFormData = z.infer<typeof pricingStrategySchema>;

interface ProductImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ExternalProduct[];
  onConfirm: (strategy: PricingStrategy) => void;
  isLoading?: boolean;
}

export function ProductImportDialog({
  open,
  onOpenChange,
  products,
  onConfirm,
  isLoading,
}: ProductImportDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PricingStrategyFormData>({
    resolver: zodResolver(pricingStrategySchema),
    defaultValues: {
      type: "MARGIN",
      value: 30,
    },
  });

  const strategyType = watch("type");
  const strategyValue = watch("value");

  const onSubmit = (data: PricingStrategyFormData) => {
    onConfirm({
      type: data.type,
      value: data.value,
    });
  };

  // 计算预览价格
  const calculateRetailPrice = (costPrice: number): number => {
    if (!strategyValue) return costPrice;

    switch (strategyType) {
      case "MARGIN":
        // 利润率定价：零售价 = 成本价 / (1 - 利润率)
        const marginRate = strategyValue / 100;
        return costPrice / (1 - marginRate);

      case "MARKUP":
        // 加价定价：零售价 = 成本价 + 加价金额
        return costPrice + strategyValue;

      case "CUSTOM":
        // 自定义定价：使用成本价
        return costPrice;

      default:
        return costPrice;
    }
  };

  // 计算利润率
  const calculateProfitMargin = (costPrice: number, retailPrice: number): number => {
    if (retailPrice <= costPrice) return 0;
    return ((retailPrice - costPrice) / retailPrice) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>批量导入产品</DialogTitle>
          <DialogDescription>
            选择定价策略，系统将自动计算零售价格
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 定价策略选择 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="strategyType">定价策略</Label>
              <Select
                value={strategyType}
                onValueChange={(value) =>
                  setValue("type", value as "MARGIN" | "MARKUP" | "CUSTOM")
                }
              >
                <SelectTrigger id="strategyType">
                  <SelectValue placeholder="选择定价策略" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARGIN">利润率定价</SelectItem>
                  <SelectItem value="MARKUP">加价定价</SelectItem>
                  <SelectItem value="CUSTOM">自定义定价</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 策略值输入 */}
            {strategyType !== "CUSTOM" && (
              <div>
                <Label htmlFor="strategyValue">
                  {strategyType === "MARGIN" ? "利润率 (%)" : "加价金额"}
                </Label>
                <Input
                  id="strategyValue"
                  type="number"
                  step={strategyType === "MARGIN" ? "1" : "0.01"}
                  placeholder={strategyType === "MARGIN" ? "30" : "10.00"}
                  {...register("value")}
                  className={errors.value ? "border-red-500" : ""}
                />
                {errors.value && (
                  <p className="mt-1 text-sm text-red-500">{errors.value.message}</p>
                )}
                {strategyType === "MARGIN" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    例如：输入 30 表示 30% 的利润率
                  </p>
                )}
              </div>
            )}

            {/* 策略说明 */}
            <div className="rounded-lg bg-muted p-3 text-sm">
              {strategyType === "MARGIN" && (
                <p>
                  <strong>利润率定价：</strong>零售价 = 成本价 / (1 - 利润率)
                  <br />
                  例如：成本价 $10，利润率 30%，零售价 = $10 / (1 - 0.3) = $14.29
                </p>
              )}
              {strategyType === "MARKUP" && (
                <p>
                  <strong>加价定价：</strong>零售价 = 成本价 + 加价金额
                  <br />
                  例如：成本价 $10，加价 $5，零售价 = $10 + $5 = $15
                </p>
              )}
              {strategyType === "CUSTOM" && (
                <p>
                  <strong>自定义定价：</strong>
                  导入后使用成本价作为零售价，您可以在产品列表中手动修改每个产品的价格
                </p>
              )}
            </div>
          </div>

          {/* 价格预览 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">价格预览（前 5 个产品）</h4>
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left">产品名称</th>
                    <th className="p-2 text-right">成本价</th>
                    <th className="p-2 text-right">零售价</th>
                    <th className="p-2 text-right">利润率</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((product, index) => {
                    const retailPrice = calculateRetailPrice(product.price);
                    const profitMargin = calculateProfitMargin(product.price, retailPrice);

                    return (
                      <tr key={index} className="border-t">
                        <td className="p-2 truncate max-w-[200px]">{product.title}</td>
                        <td className="p-2 text-right">
                          {product.currency} {product.price.toFixed(2)}
                        </td>
                        <td className="p-2 text-right font-semibold">
                          {product.currency} {retailPrice.toFixed(2)}
                        </td>
                        <td className="p-2 text-right text-green-600">
                          {profitMargin.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {products.length > 5 && (
              <p className="text-xs text-muted-foreground">
                还有 {products.length - 5} 个产品未显示
              </p>
            )}
          </div>

          {/* 导入提示 */}
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-sm">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                导入说明
              </p>
              <ul className="mt-1 space-y-1 text-blue-800 dark:text-blue-200">
                <li>• 将导入 {products.length} 个产品到您的产品库</li>
                <li>• 系统会自动检查重复产品</li>
                <li>• 导入后可以在产品列表中查看和编辑</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  导入中...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  确认导入
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

