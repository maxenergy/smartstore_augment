import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth.js API 路由处理器
 *
 * 处理所有 NextAuth.js 相关的 API 请求
 * 包括登录、登出、会话管理等
 *
 * 路由: /api/auth/*
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
