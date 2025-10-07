/**
 * 产品卡片骨架屏组件
 * 用于产品列表加载时的占位显示
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 图片骨架 */}
        <Skeleton className="aspect-square w-full rounded-lg" />

        {/* 价格和状态骨架 */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>

        {/* 平台和库存骨架 */}
        <div className="flex items-center justify-between text-sm">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* 按钮骨架 */}
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 产品列表骨架屏
 */
export function ProductListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

