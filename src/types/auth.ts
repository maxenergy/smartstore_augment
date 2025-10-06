import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = "ADMIN",
  MERCHANT = "MERCHANT",
  API_USER = "API_USER",
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

/**
 * 扩展的用户类型
 * 与 Prisma User 模型对应
 */
export interface User extends DefaultUser {
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
 * 扩展的 Session 类型
 * 包含用户的完整信息
 */
export interface Session extends DefaultSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    status: UserStatus;
    image?: string | null;
  };
}

/**
 * 扩展的 JWT 类型
 * 包含用户的基本信息
 */
export interface JWT extends DefaultJWT {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  status: UserStatus;
  image?: string | null;
}

/**
 * 登录凭证类型
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * 注册数据类型
 */
export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}
