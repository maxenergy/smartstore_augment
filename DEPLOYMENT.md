# 跨境电商分销系统 - 部署指南

本文档提供完整的部署指南，包括开发环境、生产环境和 Docker 容器化部署。

## 目录

- [系统要求](#系统要求)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [Docker 部署](#docker-部署)
- [数据库管理](#数据库管理)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

## 系统要求

### 最低要求

- Node.js 20.x 或更高版本
- pnpm 10.x 或更高版本
- 2GB RAM
- 10GB 磁盘空间

### 推荐配置

- Node.js 20.x LTS
- pnpm 10.4.1+
- 4GB RAM
- 20GB 磁盘空间
- PostgreSQL 16+ (生产环境)

## 开发环境部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd smartstore_bykilo_deepseek
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写必要的配置：

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-characters"
```

### 4. 初始化数据库

```bash
# 运行数据库迁移
pnpm prisma migrate dev

# 生成 Prisma Client
pnpm prisma generate
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 生产环境部署

### 1. 准备生产环境

```bash
# 安装依赖
pnpm install --frozen-lockfile

# 配置生产环境变量
cp .env.production.example .env.production
```

### 2. 配置环境变量

编辑 `.env.production`：

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@localhost:5432/smartstore"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret-key"
```

### 3. 构建应用

```bash
# 生成 Prisma Client
pnpm prisma generate

# 运行数据库迁移
pnpm prisma migrate deploy

# 构建 Next.js 应用
pnpm build
```

### 4. 启动生产服务器

```bash
pnpm start
```

### 5. 使用 PM2 管理进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "smartstore" -- start

# 设置开机自启
pm2 startup
pm2 save
```

## Docker 部署

### 1. 构建 Docker 镜像

```bash
docker build -t smartstore:latest .
```

### 2. 使用 Docker Compose 部署

```bash
# 配置环境变量
cp .env.production.example .env

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down
```

### 3. 运行数据库迁移

```bash
docker-compose exec app npx prisma migrate deploy
```

### 4. 健康检查

```bash
curl http://localhost:3000/api/health
```

## 数据库管理

### 备份数据库

```bash
# 使用备份脚本
./scripts/backup-db.sh

# 手动备份 SQLite
cp ./prisma/prod.db ./backups/backup_$(date +%Y%m%d).db

# 备份 PostgreSQL
pg_dump -U username smartstore > backup_$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
# 使用恢复脚本
./scripts/restore-db.sh ./backups/backup_20250106.db.gz

# 手动恢复 SQLite
cp ./backups/backup_20250106.db ./prisma/prod.db

# 恢复 PostgreSQL
psql -U username smartstore < backup_20250106.sql
```

### 数据库迁移

```bash
# 创建新迁移
pnpm prisma migrate dev --name migration_name

# 应用迁移到生产环境
pnpm prisma migrate deploy

# 重置数据库（开发环境）
pnpm prisma migrate reset
```

## 环境变量配置

### 必需变量

| 变量名            | 说明             | 示例                      |
| ----------------- | ---------------- | ------------------------- |
| `DATABASE_URL`    | 数据库连接字符串 | `file:./prisma/prod.db`   |
| `NEXTAUTH_URL`    | 应用 URL         | `https://your-domain.com` |
| `NEXTAUTH_SECRET` | NextAuth 密钥    | 至少32字符的随机字符串    |

### 可选变量

| 变量名                    | 说明               | 默认值        |
| ------------------------- | ------------------ | ------------- |
| `PORT`                    | 服务端口           | `3000`        |
| `NODE_ENV`                | 运行环境           | `development` |
| `ALLOWED_ORIGINS`         | CORS 允许的域名    | `*`           |
| `RATE_LIMIT_MAX_REQUESTS` | 速率限制最大请求数 | `100`         |

## Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL 证书配置

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 性能优化建议

1. **启用 HTTP/2**
   - 配置 Nginx 支持 HTTP/2
   - 使用 HTTPS

2. **启用 Gzip 压缩**
   - Next.js 默认启用
   - Nginx 配置 gzip

3. **使用 CDN**
   - 静态资源托管到 CDN
   - 配置 `next.config.ts` 的 `assetPrefix`

4. **数据库优化**
   - 使用 PostgreSQL 替代 SQLite
   - 配置连接池
   - 定期清理日志

## 监控和日志

### 应用日志

```bash
# PM2 日志
pm2 logs smartstore

# Docker 日志
docker-compose logs -f app

# 日志文件位置
./logs/app.log
```

### 健康检查

```bash
# 检查服务状态
curl http://localhost:3000/api/health

# 检查数据库连接
pnpm prisma db pull
```

## 常见问题

### 1. 数据库连接失败

**问题**: `Error: P1001: Can't reach database server`

**解决方案**:

- 检查 `DATABASE_URL` 配置
- 确认数据库服务正在运行
- 检查防火墙设置

### 2. NextAuth 错误

**问题**: `[next-auth][error][SIGNIN_EMAIL_ERROR]`

**解决方案**:

- 确认 `NEXTAUTH_SECRET` 已设置
- 检查 `NEXTAUTH_URL` 是否正确
- 清除浏览器 Cookie

### 3. 构建失败

**问题**: `Error: Cannot find module`

**解决方案**:

```bash
# 清理缓存
rm -rf .next node_modules
pnpm install
pnpm build
```

### 4. 端口被占用

**问题**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:

```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或使用其他端口
PORT=3001 pnpm start
```

## 安全建议

1. **定期更新依赖**

   ```bash
   pnpm update
   ```

2. **使用强密码**
   - `NEXTAUTH_SECRET` 至少32字符
   - 数据库密码使用随机生成

3. **启用 HTTPS**
   - 生产环境必须使用 HTTPS
   - 配置 SSL 证书

4. **限制数据库访问**
   - 只允许应用服务器访问
   - 使用防火墙规则

5. **定期备份**
   - 设置自动备份任务
   - 测试备份恢复流程

## 技术支持

如有问题，请查看：

- [项目文档](./README.md)
- [使用指南](./USER_GUIDE.md)
- [API 文档](./docs/api-route-template.md)

---

最后更新: 2025-10-06
