import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client 单例实例
 *
 * 在开发环境中，由于 Next.js 的热重载机制，每次代码更改都会创建新的 PrismaClient 实例，
 * 这可能导致数据库连接池耗尽。为了避免这个问题，我们使用全局变量来存储 PrismaClient 实例。
 *
 * 在生产环境中，每次部署都会创建一个新的 PrismaClient 实例，不会有连接池耗尽的问题。
 */

// 扩展全局类型以包含 prisma 属性
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 创建 Prisma Client 实例
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// 在开发环境中，将 Prisma Client 实例存储到全局变量
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * 使用示例：
 *
 * import { prisma } from '@/lib/prisma';
 *
 * // 查询用户
 * const users = await prisma.user.findMany();
 *
 * // 创建用户
 * const user = await prisma.user.create({
 *   data: {
 *     email: 'user@example.com',
 *     name: 'John Doe',
 *   },
 * });
 */
