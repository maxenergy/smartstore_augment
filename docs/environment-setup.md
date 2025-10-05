# 环境变量配置指南

## 📋 概述

本文档说明如何配置跨境电商分销系统的环境变量。

## 🚀 快速开始

### 1. 复制环境变量模板

```bash
cp .env.example .env.local
```

### 2. 编辑 `.env.local` 文件

根据您的环境填入实际的配置值。

## 📝 环境变量说明

### 应用配置

| 变量名                     | 说明                                   | 默认值                | 必填 |
| -------------------------- | -------------------------------------- | --------------------- | ---- |
| `NODE_ENV`                 | 应用环境 (development/production/test) | development           | 是   |
| `NEXT_PUBLIC_APP_URL`      | 应用访问URL                            | http://localhost:3000 | 是   |
| `NEXT_PUBLIC_API_BASE_URL` | API基础路径                            | /api/v1               | 是   |

### 数据库配置

| 变量名         | 说明             | 示例                                                                                | 必填 |
| -------------- | ---------------- | ----------------------------------------------------------------------------------- | ---- |
| `DATABASE_URL` | 数据库连接字符串 | `file:./dev.db` (SQLite)<br>`postgresql://user:pass@localhost:5432/db` (PostgreSQL) | 是   |

### 认证配置

| 变量名            | 说明                | 生成方法                  | 必填 |
| ----------------- | ------------------- | ------------------------- | ---- |
| `NEXTAUTH_SECRET` | NextAuth.js 密钥    | `openssl rand -base64 32` | 是   |
| `NEXTAUTH_URL`    | NextAuth.js 回调URL | http://localhost:3000     | 是   |
| `JWT_EXPIRATION`  | JWT 过期时间 (秒)   | 2592000 (30天)            | 否   |

### 第三方平台 API

#### Amazon Selling Partner API

| 变量名                  | 说明              | 必填 |
| ----------------------- | ----------------- | ---- |
| `AMAZON_CLIENT_ID`      | Amazon 客户端ID   | 否   |
| `AMAZON_CLIENT_SECRET`  | Amazon 客户端密钥 | 否   |
| `AMAZON_REFRESH_TOKEN`  | Amazon 刷新令牌   | 否   |
| `AMAZON_REGION`         | Amazon 区域       | 否   |
| `AMAZON_MARKETPLACE_ID` | Amazon 市场ID     | 否   |

#### TikTok Shop API

| 变量名                | 说明            | 必填 |
| --------------------- | --------------- | ---- |
| `TIKTOK_APP_KEY`      | TikTok 应用密钥 | 否   |
| `TIKTOK_APP_SECRET`   | TikTok 应用密钥 | 否   |
| `TIKTOK_ACCESS_TOKEN` | TikTok 访问令牌 | 否   |
| `TIKTOK_SHOP_ID`      | TikTok 店铺ID   | 否   |

#### Shopify API

| 变量名                 | 说明             | 必填 |
| ---------------------- | ---------------- | ---- |
| `SHOPIFY_API_KEY`      | Shopify API密钥  | 否   |
| `SHOPIFY_API_SECRET`   | Shopify API密钥  | 否   |
| `SHOPIFY_ACCESS_TOKEN` | Shopify 访问令牌 | 否   |
| `SHOPIFY_SHOP_DOMAIN`  | Shopify 店铺域名 | 否   |

#### eBay API

| 变量名               | 说明                           | 必填 |
| -------------------- | ------------------------------ | ---- |
| `EBAY_CLIENT_ID`     | eBay 客户端ID                  | 否   |
| `EBAY_CLIENT_SECRET` | eBay 客户端密钥                | 否   |
| `EBAY_REFRESH_TOKEN` | eBay 刷新令牌                  | 否   |
| `EBAY_ENVIRONMENT`   | eBay 环境 (SANDBOX/PRODUCTION) | 否   |

### Redis 配置 (可选)

| 变量名           | 说明             | 默认值                 | 必填 |
| ---------------- | ---------------- | ---------------------- | ---- |
| `REDIS_URL`      | Redis 连接URL    | redis://localhost:6379 | 否   |
| `REDIS_PASSWORD` | Redis 密码       | -                      | 否   |
| `REDIS_DB`       | Redis 数据库编号 | 0                      | 否   |

### 文件存储配置

| 变量名                  | 说明           | 默认值           | 必填 |
| ----------------------- | -------------- | ---------------- | ---- |
| `UPLOAD_DIR`            | 本地上传目录   | ./public/uploads | 否   |
| `AWS_ACCESS_KEY_ID`     | AWS 访问密钥ID | -                | 否   |
| `AWS_SECRET_ACCESS_KEY` | AWS 访问密钥   | -                | 否   |
| `AWS_REGION`            | AWS 区域       | us-east-1        | 否   |
| `AWS_S3_BUCKET`         | S3 存储桶名称  | -                | 否   |

### 邮件服务配置 (可选)

| 变量名          | 说明        | 示例                   | 必填 |
| --------------- | ----------- | ---------------------- | ---- |
| `SMTP_HOST`     | SMTP 服务器 | smtp.gmail.com         | 否   |
| `SMTP_PORT`     | SMTP 端口   | 587                    | 否   |
| `SMTP_USER`     | SMTP 用户名 | your-email@gmail.com   | 否   |
| `SMTP_PASSWORD` | SMTP 密码   | -                      | 否   |
| `SMTP_FROM`     | 发件人地址  | noreply@smartstore.com | 否   |

### 日志配置

| 变量名          | 说明         | 默认值 | 必填 |
| --------------- | ------------ | ------ | ---- |
| `LOG_LEVEL`     | 日志级别     | info   | 否   |
| `LOG_FILE_PATH` | 日志文件路径 | ./logs | 否   |

### 安全配置

| 变量名                 | 说明                     | 默认值 | 必填 |
| ---------------------- | ------------------------ | ------ | ---- |
| `CORS_ORIGINS`         | CORS 允许的源 (逗号分隔) | -      | 否   |
| `RATE_LIMIT_MAX`       | API 速率限制 (请求/分钟) | 100    | 否   |
| `RATE_LIMIT_WINDOW_MS` | 速率限制时间窗口 (毫秒)  | 60000  | 否   |

### 功能开关

| 变量名                      | 说明           | 默认值 | 必填 |
| --------------------------- | -------------- | ------ | ---- |
| `ENABLE_REGISTRATION`       | 启用用户注册   | true   | 否   |
| `ENABLE_EMAIL_VERIFICATION` | 启用邮箱验证   | false  | 否   |
| `ENABLE_TWO_FACTOR_AUTH`    | 启用双因素认证 | false  | 否   |

### 开发工具

| 变量名            | 说明          | 默认值 | 必填 |
| ----------------- | ------------- | ------ | ---- |
| `DEBUG`           | 启用调试模式  | false  | 否   |
| `ENABLE_API_DOCS` | 启用 API 文档 | true   | 否   |

## 🔒 安全最佳实践

1. **永远不要提交 `.env.local` 到 Git**
   - 已在 `.gitignore` 中配置

2. **生产环境必须使用强密钥**

   ```bash
   # 生成安全的 NEXTAUTH_SECRET
   openssl rand -base64 32
   ```

3. **定期轮换 API 密钥和令牌**

4. **使用环境变量管理服务**
   - 生产环境推荐使用 Vercel、AWS Secrets Manager 等

## 📚 不同环境的配置

### 开发环境 (`.env.local`)

- 使用 SQLite 数据库
- 启用调试模式
- 使用本地文件存储

### 测试环境 (`.env.test`)

- 使用独立的测试数据库
- 禁用外部 API 调用
- 使用模拟数据

### 生产环境 (`.env.production`)

- 使用 PostgreSQL 数据库
- 启用所有安全特性
- 使用 S3 文件存储
- 配置 Redis 缓存

## 🆘 故障排除

### 问题：环境变量未生效

**解决方案：**

1. 确认文件名为 `.env.local`
2. 重启开发服务器 (`pnpm dev`)
3. 检查变量名拼写是否正确

### 问题：数据库连接失败

**解决方案：**

1. 检查 `DATABASE_URL` 格式是否正确
2. 确认数据库服务已启动
3. 验证数据库凭据

## 📞 获取帮助

如有问题，请查看：

- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [Prisma 连接字符串文档](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [NextAuth.js 配置文档](https://next-auth.js.org/configuration/options)
