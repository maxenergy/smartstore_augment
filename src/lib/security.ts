/**
 * 安全工具函数
 * 包括 XSS 防护、数据脱敏等
 */

/**
 * HTML 标签过滤，防止 XSS 攻击
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * 脱敏密码（用于日志）
 */
export function maskPassword(password: string): string {
  if (!password) return "";
  return "********";
}

/**
 * 脱敏邮箱
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;

  const [username, domain] = email.split("@");
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }

  const visibleChars = 2;
  const masked = username.slice(0, visibleChars) + "***";
  return `${masked}@${domain}`;
}

/**
 * 脱敏手机号
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;

  const start = phone.slice(0, 3);
  const end = phone.slice(-4);
  return `${start}****${end}`;
}

/**
 * 脱敏 Token
 */
export function maskToken(token: string): string {
  if (!token || token.length < 10) return "***";

  const start = token.slice(0, 4);
  const end = token.slice(-4);
  return `${start}...${end}`;
}

/**
 * 脱敏对象中的敏感字段
 */
export function maskSensitiveData(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  const sensitiveFields = ["password", "accessToken", "refreshToken", "token", "secret", "apiKey"];

  const masked = { ...obj };

  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase();

    if (sensitiveFields.some((field) => lowerKey.includes(field))) {
      masked[key] = "***REDACTED***";
    } else if (lowerKey.includes("email")) {
      masked[key] = maskEmail(masked[key]);
    } else if (lowerKey.includes("phone")) {
      masked[key] = maskPhone(masked[key]);
    } else if (typeof masked[key] === "object" && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
}

/**
 * 生成安全的随机字符串
 */
export function generateSecureToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  // 使用 crypto.getRandomValues 生成安全的随机数
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
  } else {
    // 降级方案（不推荐用于生产环境）
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
}

/**
 * 验证 URL 是否安全
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // 只允许 http 和 https 协议
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * CORS 配置
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

/**
 * 安全响应头
 */
export const SECURITY_HEADERS = {
  // 防止点击劫持
  "X-Frame-Options": "DENY",
  // 防止 MIME 类型嗅探
  "X-Content-Type-Options": "nosniff",
  // XSS 防护
  "X-XSS-Protection": "1; mode=block",
  // 引用策略
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // 内容安全策略
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  // 权限策略
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
