"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBatchSync, SyncType } from "@/hooks/use-sync";
import { AlertCircle, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productIds: string[];
  productTitles?: string[];
}

export function ProductSyncDialog({
  open,
  onOpenChange,
  productIds,
  productTitles = [],
}: ProductSyncDialogProps) {
  const [syncType, setSyncType] = useState<SyncType>("ALL");
  const { toast } = useToast();
  const batchSyncMutation = useBatchSync();

  const handleSync = async () => {
    try {
      const result = await batchSyncMutation.mutateAsync({
        productIds,
        syncType,
      });

      toast({
        title: "同步完成",
        description: `成功同步 ${result.success} 个产品，失败 ${result.failed} 个`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "同步失败",
        description: error.response?.data?.error?.message || error.message || "同步产品时发生错误",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>批量同步产品</DialogTitle>
          <DialogDescription>
            选择同步类型，系统将从供应商平台获取最新数据
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 同步类型选择 */}
          <div>
            <Label htmlFor="syncType">同步类型</Label>
            <Select
              value={syncType}
              onValueChange={(value) => setSyncType(value as SyncType)}
            >
              <SelectTrigger id="syncType">
                <SelectValue placeholder="选择同步类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRICE">价格同步</SelectItem>
                <SelectItem value="STOCK">库存同步</SelectItem>
                <SelectItem value="INFO">信息同步</SelectItem>
                <SelectItem value="ALL">全部同步</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 同步类型说明 */}
          <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
            <p className="font-semibold">同步说明：</p>
            {syncType === "PRICE" && (
              <ul className="space-y-1 text-muted-foreground">
                <li>• 更新产品的成本价</li>
                <li>• 自动重新计算零售价（保持原有利润率）</li>
                <li>• 记录价格变更历史</li>
              </ul>
            )}
            {syncType === "STOCK" && (
              <ul className="space-y-1 text-muted-foreground">
                <li>• 更新产品的库存数量</li>
                <li>• 自动更新产品状态（缺货/有货）</li>
                <li>• 更新库存同步时间</li>
              </ul>
            )}
            {syncType === "INFO" && (
              <ul className="space-y-1 text-muted-foreground">
                <li>• 更新产品标题</li>
                <li>• 更新产品描述</li>
                <li>• 更新产品图片</li>
              </ul>
            )}
            {syncType === "ALL" && (
              <ul className="space-y-1 text-muted-foreground">
                <li>• 同步所有信息（价格 + 库存 + 信息）</li>
                <li>• 确保产品数据与供应商完全一致</li>
                <li>• 推荐定期执行全部同步</li>
              </ul>
            )}
          </div>

          {/* 产品列表 */}
          <div>
            <p className="text-sm font-medium mb-2">
              将同步以下 {productIds.length} 个产品：
            </p>
            <div className="rounded-lg border p-4 max-h-48 overflow-y-auto space-y-2">
              {productTitles.length > 0 ? (
                productTitles.map((title, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="truncate">{title}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {productIds.length} 个产品
                </p>
              )}
            </div>
          </div>

          {/* 警告提示 */}
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 text-sm">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                注意事项
              </p>
              <ul className="mt-1 space-y-1 text-yellow-800 dark:text-yellow-200">
                <li>• 同步过程可能需要几分钟，请耐心等待</li>
                <li>• 同步期间请勿关闭此页面</li>
                <li>• 如果供应商平台数据未变化，则不会更新</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={batchSyncMutation.isPending}
          >
            取消
          </Button>
          <Button
            onClick={handleSync}
            disabled={batchSyncMutation.isPending}
          >
            {batchSyncMutation.isPending ? (
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

