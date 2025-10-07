/**
 * 优化的图片组件
 * 支持懒加载、占位符、错误处理
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  aspectRatio = "auto",
  priority = false,
  fill = false,
  sizes,
  quality = 75,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 处理外部图片 URL
  const isExternalImage = src.startsWith("http://") || src.startsWith("https://");

  // 如果图片加载失败，显示占位符
  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 dark:bg-gray-800",
          aspectRatio === "square" && "aspect-square",
          aspectRatio === "video" && "aspect-video",
          className
        )}
      >
        <ImageIcon className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "video" && "aspect-video",
        className
      )}
    >
      {/* 加载占位符 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {/* 图片 */}
      {isExternalImage ? (
        // 外部图片使用 img 标签（Next.js Image 需要配置域名）
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          className={cn(
            "object-cover w-full h-full transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      ) : (
        // 本地图片使用 Next.js Image 组件
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          sizes={sizes}
          quality={quality}
          priority={priority}
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}

/**
 * 产品图片组件（专门用于产品卡片）
 */
export function ProductImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="square"
      className={className}
      priority={priority}
      quality={80}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  );
}

