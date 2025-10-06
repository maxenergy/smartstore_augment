import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { UserRole, UserStatus } from "./auth";

/**
 * 扩展 NextAuth 类型定义
 * 添加自定义字段到 User, Session, JWT
 */

declare module "next-auth" {
  /**
   * 扩展 User 接口
   */
  interface User extends DefaultUser {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    status: UserStatus;
    emailVerified?: Date | null;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  /**
   * 扩展 Session 接口
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      status: UserStatus;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * 扩展 JWT 接口
   */
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    status: UserStatus;
    image?: string | null;
  }
}
