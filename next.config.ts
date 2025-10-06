import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 图片优化配置
  images: {
    // 允许的图片域名白名单
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com", // AWS S3
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com", // Cloudinary
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Unsplash
      },
      {
        protocol: "https",
        hostname: "**.shopify.com", // Shopify
      },
      {
        protocol: "https",
        hostname: "**.tiktokcdn.com", // TikTok
      },
    ],
    // 图片格式优化
    formats: ["image/avif", "image/webp"],
    // 图片尺寸配置
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 最小化缓存时间（秒）
    minimumCacheTTL: 60,
  },

  // 生产环境优化
  reactStrictMode: true,
  poweredByHeader: false, // 移除 X-Powered-By 头

  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 实验性功能
  experimental: {
    optimizePackageImports: ["@/components", "@/lib", "@/hooks"],
  },

  // Docker 部署配置
  output: "standalone",
};

export default nextConfig;
