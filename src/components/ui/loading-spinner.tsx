/**
 * 加载指示器组件
 * 提供多种样式的加载动画
 */

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

/**
 * 全屏加载指示器
 */
export function LoadingScreen({ text = "加载中..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
}

/**
 * 页面加载指示器
 */
export function PageLoading({ text = "加载中..." }: { text?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

