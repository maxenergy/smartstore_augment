# 跨境电商分销系统

一个基于 Next.js 15 的现代化跨境电商分销管理系统，支持多平台店铺管理、产品管理和订单处理。

## 🚀 技术栈

### 前端

- **框架**: Next.js 15.5.4 (App Router)
- **UI 库**: React 19.2.0
- **样式**: Tailwind CSS 3.4.18
- **组件库**: shadcn/ui
- **状态管理**: Zustand 5.0.8
- **数据获取**: TanStack Query 5.90.2
- **表单**: React Hook Form 7.54.2 + Zod 4.1.11
- **HTTP 客户端**: Axios 1.12.2

### 后端

- **API**: Next.js API Routes
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma 6.16.3
- **认证**: NextAuth.js 4.24.11 (JWT)
- **密码加密**: bcryptjs 3.0.2

### 开发工具

- **语言**: TypeScript 5.9.3
- **代码规范**: ESLint 9.37.0 + Prettier 3.6.2
- **Git Hooks**: Husky 9.1.7 + lint-staged 16.2.3
- **包管理器**: pnpm 10.4.1

## 📁 项目结构

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 认证相关页面组
│   │   ├── signin/          # 登录页面
│   │   └── signup/          # 注册页面
│   ├── (dashboard)/         # 仪表板页面组
│   │   ├── layout.tsx       # 仪表板布局
│   │   ├── page.tsx         # 仪表板首页
│   │   ├── products/        # 产品管理页面
│   │   ├── shops/           # 店铺管理页面
│   │   └── orders/          # 订单管理页面
│   ├── api/                 # API Routes
│   │   ├── auth/            # 认证 API
│   │   │   └── [...nextauth]/  # NextAuth.js 路由
│   │   └── v1/              # API v1
│   │       ├── auth/        # 认证相关 API
│   │       ├── users/       # 用户管理 API
│   │       ├── shops/       # 店铺管理 API
│   │       ├── products/    # 产品管理 API
│   │       └── orders/      # 订单管理 API
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── components/              # React 组件
│   ├── ui/                 # shadcn/ui 基础组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── form.tsx
│   ├── features/           # 功能组件
│   │   ├── auth/           # 认证相关组件
│   │   ├── products/       # 产品相关组件
│   │   ├── shops/          # 店铺相关组件
│   │   └── orders/         # 订单相关组件
│   └── layouts/            # 布局组件
├── lib/                     # 工具库
│   ├── prisma.ts           # Prisma Client 单例
│   ├── auth.ts             # NextAuth.js 配置
│   ├── auth-middleware.ts  # 认证中间件
│   ├── permissions.ts      # RBAC 权限系统
│   ├── api-response.ts     # API 响应格式
│   ├── error-handler.ts    # 全局错误处理
│   ├── errors.ts           # 自定义错误类
│   ├── validate-request.ts # 请求验证工具
│   ├── pagination.ts       # 分页工具
│   ├── validations/        # Zod 验证 Schema
│   │   └── auth.ts
│   └── utils.ts            # 通用工具函数
├── services/                # 业务服务层
│   ├── user.service.ts     # 用户服务
│   ├── shop.service.ts     # 店铺服务
│   ├── product.service.ts  # 产品服务
│   └── order.service.ts    # 订单服务
├── types/                   # TypeScript 类型定义
│   ├── api.ts              # API 类型
│   ├── auth.ts             # 认证类型
│   ├── models.ts           # 数据模型类型
│   └── next-auth.d.ts      # NextAuth 类型扩展
├── hooks/                   # React Hooks
│   ├── use-auth.ts         # 认证 Hook
│   └── use-api.ts          # API 请求 Hook
└── store/                   # Zustand 状态管理
    ├── auth.store.ts       # 认证状态
    └── ui.store.ts         # UI 状态
```

## 🗄️ 数据库模型

### User (用户表)

- 用户基本信息（邮箱、密码、姓名）
- 角色：ADMIN（管理员）、MERCHANT（商家）、API_USER（API用户）
- 状态：ACTIVE（活跃）、INACTIVE（未激活）、SUSPENDED（已停用）

### Shop (店铺表)

- 店铺信息（名称、平台、店铺ID）
- 平台：SHOPIFY、WOOCOMMERCE、AMAZON、EBAY、ETSY
- 授权令牌和刷新令牌
- 店铺状态：ACTIVE、INACTIVE、SUSPENDED

### Product (产品表)

- 产品信息（名称、SKU、描述、价格、库存）
- 产品图片（JSON 数组）
- 产品规格（JSON 对象）
- 产品状态：ACTIVE、INACTIVE、OUT_OF_STOCK

### PlatformProduct (平台产品关联表)

- 关联产品和店铺
- 平台产品ID和SKU
- 同步状态：PENDING、SYNCED、FAILED

### Order (订单表)

- 订单信息（订单号、金额、状态）
- 客户信息（姓名、邮箱、地址）
- 订单项（JSON 数组）
- 订单状态：PENDING、PAID、PROCESSING、SHIPPED、DELIVERED、CANCELLED、REFUNDED

## 🔐 认证与授权

### 认证方式

- JWT 认证（30天有效期）
- 密码加密（bcrypt，12轮）

### 权限系统 (RBAC)

- **ADMIN**: 所有权限（42个）
- **MERCHANT**: 自己资源的管理权限（24个）
- **API_USER**: 只读和API访问权限（6个）

### 权限分类

- 用户管理（5个权限）
- 店铺管理（5个权限）
- 产品管理（6个权限）
- 订单管理（5个权限）
- 平台产品管理（5个权限）
- 系统管理（4个权限）
- API 管理（2个权限）

## 🛠️ 开发指南

### 环境要求

- Node.js 18+
- pnpm 10+

### 安装依赖

```bash
pnpm install
```

### 环境变量配置

复制 `.env.example` 到 `.env.local` 并配置：

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=/api/v1
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
JWT_EXPIRATION=2592000
```

### 数据库迁移

```bash
# 创建迁移
pnpm prisma migrate dev --name init

# 查看数据库
pnpm prisma studio
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 代码规范

```bash
# 格式化代码
pnpm format

# 检查代码规范
pnpm lint

# 修复代码规范问题
pnpm lint:fix
```

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 📚 API 文档

### API 路由规范

- 基础路径: `/api/v1`
- 认证: Bearer Token (JWT)
- 响应格式: JSON

### 主要 API 端点

- `POST /api/auth/signin` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `GET /api/v1/auth/me` - 获取当前用户信息
- `GET /api/v1/users` - 获取用户列表（需要权限）
- `GET /api/v1/shops` - 获取店铺列表
- `GET /api/v1/products` - 获取产品列表（支持分页、排序、搜索）
- `GET /api/v1/orders` - 获取订单列表

详细 API 文档请参考 [docs/api-route-template.md](docs/api-route-template.md)

## 📖 相关文档

- [环境配置指南](docs/environment-setup.md)
- [API 路由模板](docs/api-route-template.md)
- [详细开发计划](detailed-development-plan.md)
- [架构设计](architecture.md)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

## 👥 作者

跨境电商分销系统开发团队

## 🙏 致谢

- Next.js
- Prisma
- NextAuth.js
- shadcn/ui
- Tailwind CSS
