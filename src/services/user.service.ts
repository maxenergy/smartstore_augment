/**
 * 用户服务层
 * 封装用户相关的业务逻辑
 */

import { prisma } from "@/lib/prisma";
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NotFoundError, ConflictError } from "@/lib/errors";
import type { SafeUser, UserWithShops, CreateUserInput, UpdateUserInput } from "@/types/models";

/**
 * 用户列表查询参数
 */
export interface GetUsersParams {
  page: number;
  pageSize: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * 用户服务类
 */
export class UserService {
  /**
   * 获取用户列表
   * 支持分页、筛选、搜索、排序
   */
  async getUsers(params: GetUsersParams) {
    const {
      page,
      pageSize,
      role,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // 构建查询条件
    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // 构建排序条件
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // 并行执行查询和计数
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * 根据ID获取用户详情
   * 包含关联的店铺信息
   */
  async getUserById(id: string): Promise<UserWithShops> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shops: {
          select: {
            id: true,
            name: true,
            platform: true,
            platformShopId: true,
            platformShopUrl: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("用户");
    }

    return user as UserWithShops;
  }

  /**
   * 根据邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * 创建用户
   */
  async createUser(data: CreateUserInput): Promise<SafeUser> {
    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("邮箱已被使用");
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<SafeUser> {
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError("用户");
    }

    // 如果更新邮箱，检查邮箱是否已被使用
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new ConflictError("邮箱已被使用");
      }
    }

    // 更新用户
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role }),
        ...(data.status && { status: data.status }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * 更新用户密码
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError("用户");
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 更新密码
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  /**
   * 删除用户
   * 注意：这是硬删除，会级联删除关联数据
   */
  async deleteUser(id: string): Promise<void> {
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError("用户");
    }

    // 删除用户（Prisma 会自动处理级联删除）
    await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(id: string, status: UserStatus): Promise<SafeUser> {
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError("用户");
    }

    // 更新状态
    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * 验证用户密码
   */
  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });

    if (!user) {
      return false;
    }

    return bcrypt.compare(password, user.password);
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats() {
    const [total, activeCount, inactiveCount, suspendedCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.INACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
    ]);

    return {
      total,
      active: activeCount,
      inactive: inactiveCount,
      suspended: suspendedCount,
    };
  }
}

// 导出单例实例
export const userService = new UserService();
