/**
 * 用户相关的验证 Schema
 */

import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";

/**
 * 用户列表查询参数 Schema
 */
export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "email", "name", "role", "status"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * 用户ID参数 Schema
 */
export const userIdSchema = z.object({
  id: z.string().uuid("无效的用户ID"),
});

/**
 * 更新用户信息 Schema
 */
export const updateUserSchema = z.object({
  email: z.string().email("邮箱格式不正确").optional(),
  name: z.string().min(1, "姓名不能为空").max(100, "姓名过长").optional(),
  role: z
    .nativeEnum(UserRole, {
      errorMap: () => ({ message: "无效的用户角色" }),
    })
    .optional(),
  status: z
    .nativeEnum(UserStatus, {
      errorMap: () => ({ message: "无效的用户状态" }),
    })
    .optional(),
});

/**
 * 更新用户密码 Schema
 */
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "当前密码不能为空"),
    newPassword: z
      .string()
      .min(8, "密码至少8个字符")
      .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
      .regex(/[a-z]/, "密码必须包含至少一个小写字母")
      .regex(/[0-9]/, "密码必须包含至少一个数字"),
    confirmPassword: z.string().min(1, "确认密码不能为空"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

/**
 * 更新用户状态 Schema
 */
export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus, {
    errorMap: () => ({ message: "无效的用户状态" }),
  }),
});

// 导出类型
export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type UserId = z.infer<typeof userIdSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type UpdateUserStatus = z.infer<typeof updateUserStatusSchema>;
