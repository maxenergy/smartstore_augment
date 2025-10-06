import { z } from "zod";

/**
 * 用户注册验证 Schema
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, { message: "邮箱不能为空" })
    .email({ message: "邮箱格式不正确" })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, { message: "密码至少需要8个字符" })
    .max(100, { message: "密码最多100个字符" })
    .regex(/[A-Z]/, { message: "密码必须包含至少一个大写字母" })
    .regex(/[a-z]/, { message: "密码必须包含至少一个小写字母" })
    .regex(/[0-9]/, { message: "密码必须包含至少一个数字" }),
  name: z
    .string()
    .min(2, { message: "姓名至少需要2个字符" })
    .max(50, { message: "姓名最多50个字符" })
    .trim()
    .optional(),
});

/**
 * 用户登录验证 Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "邮箱不能为空" })
    .email({ message: "邮箱格式不正确" })
    .toLowerCase()
    .trim(),
  password: z.string().min(1, { message: "密码不能为空" }),
});

/**
 * 密码重置请求验证 Schema
 */
export const resetPasswordRequestSchema = z.object({
  email: z
    .string()
    .min(1, { message: "邮箱不能为空" })
    .email({ message: "邮箱格式不正确" })
    .toLowerCase()
    .trim(),
});

/**
 * 密码重置验证 Schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "重置令牌不能为空" }),
  password: z
    .string()
    .min(8, { message: "密码至少需要8个字符" })
    .max(100, { message: "密码最多100个字符" })
    .regex(/[A-Z]/, { message: "密码必须包含至少一个大写字母" })
    .regex(/[a-z]/, { message: "密码必须包含至少一个小写字母" })
    .regex(/[0-9]/, { message: "密码必须包含至少一个数字" }),
});

/**
 * 更新用户信息验证 Schema
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: "姓名至少需要2个字符" })
    .max(50, { message: "姓名最多50个字符" })
    .trim()
    .optional(),
  image: z.string().url({ message: "图片URL格式不正确" }).optional(),
});

/**
 * 更改密码验证 Schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "当前密码不能为空" }),
  newPassword: z
    .string()
    .min(8, { message: "新密码至少需要8个字符" })
    .max(100, { message: "新密码最多100个字符" })
    .regex(/[A-Z]/, { message: "新密码必须包含至少一个大写字母" })
    .regex(/[a-z]/, { message: "新密码必须包含至少一个小写字母" })
    .regex(/[0-9]/, { message: "新密码必须包含至少一个数字" }),
});

// 导出类型
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
