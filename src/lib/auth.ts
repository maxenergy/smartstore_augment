import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { User, UserRole, UserStatus, Session, JWT } from "@/types/auth";

/**
 * NextAuth.js 配置
 *
 * 配置了 Credentials Provider 用于用户名密码登录
 * 使用 JWT 策略进行会话管理
 */
export const authOptions: NextAuthOptions = {
  // 配置认证提供者
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      /**
       * 授权回调函数
       * 验证用户凭证并返回用户信息
       */
      async authorize(credentials) {
        // 验证凭证是否存在
        if (!credentials?.email || !credentials?.password) {
          throw new Error("邮箱和密码不能为空");
        }

        // 查询用户
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // 用户不存在
        if (!user) {
          throw new Error("邮箱或密码错误");
        }

        // 验证密码
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("邮箱或密码错误");
        }

        // 检查用户状态
        if (user.status === "SUSPENDED") {
          throw new Error("账号已被暂停，请联系管理员");
        }

        if (user.status === "INACTIVE") {
          throw new Error("账号未激活，请先激活邮箱");
        }

        // 返回用户信息（不包含密码）
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          status: user.status as UserStatus,
          emailVerified: user.emailVerified,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        } as User;
      },
    }),
  ],

  // 配置会话策略
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },

  // 配置 JWT
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },

  // 配置自定义页面
  pages: {
    signIn: "/auth/login", // 自定义登录页面
    error: "/auth/error", // 自定义错误页面
  },

  // 配置回调函数
  callbacks: {
    /**
     * JWT 回调函数
     * 在创建或更新 JWT 时调用
     * 将用户信息添加到 token 中
     */
    async jwt({ token, user, trigger, session }) {
      // 初次登录时，将用户信息添加到 token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as User).role;
        token.status = (user as User).status;
        token.image = user.image;
      }

      // 处理 session 更新
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }

      return token as JWT;
    },

    /**
     * Session 回调函数
     * 在创建或更新 session 时调用
     * 将 token 中的用户信息添加到 session 中
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.image = token.image as string | null;
      }

      return session as Session;
    },
  },

  // 配置 secret（用于加密 JWT）
  secret: process.env.NEXTAUTH_SECRET,

  // 开启调试模式（仅在开发环境）
  debug: process.env.NODE_ENV === "development",
};
