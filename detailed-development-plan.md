# 跨境电商分销系统 - 详细开发任务分解计划

*v1.0 | Created: 2025-10-05*  
*遵循 AugmentRIPER♦Σ 框架 - 模块化开发策略*

---

## 📋 文档说明

### 任务分解原则
- ✅ **完整实现**: 所有标记为 🔴CRITICAL 的任务必须完整实现，不允许使用占位符、TODO、stub代码
- 📦 **模块化开发**: 先完成完整模块，再进行集成测试
- 🧪 **延迟测试**: 完成完整功能库后再创建综合测试应用
- 🔗 **依赖管理**: 严格按照依赖关系执行任务

### 任务元数据说明
- **工时**: 预估完成时间（20分钟 - 2小时）
- **优先级**: 🔴高 / 🟡中 / 🟢低
- **依赖**: 必须先完成的任务编号
- **类型**: DB(数据库) / BE(后端) / FE(前端) / INFRA(基础设施)

### 验收标准
每个任务必须满足:
1. ✅ 代码编译无错误
2. ✅ 功能完整实现（无TODO/占位符）
3. ✅ 符合TypeScript类型安全要求
4. ✅ 通过ESLint检查
5. ✅ 完成后提交Git commit

---

## 🚀 第一阶段：基础架构搭建（预计 4-6 周）

### 阶段目标
建立项目基础架构，包括开发环境、数据库、认证系统和基础API框架。

---

## 📦 Phase 1.1: 项目初始化与环境配置

### Task 1.1.1: 初始化 Next.js 项目
**编号**: T1.1.1  
**类型**: INFRA  
**优先级**: 🔴高  
**工时**: 30分钟  
**依赖**: 无

**任务描述**:
使用 pnpm 创建 Next.js 15 项目，配置 TypeScript、App Router、src目录结构。

**技术要点**:
```bash
pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

**验收标准**:
- [x] Next.js 15 项目成功创建
- [x] TypeScript 配置完成
- [x] App Router 启用
- [x] src/ 目录结构正确
- [x] 开发服务器可正常启动 (pnpm dev)

---

### Task 1.1.2: 配置开发工具链
**编号**: T1.1.2  
**类型**: INFRA  
**优先级**: 🔴高  
**工时**: 45分钟  
**依赖**: T1.1.1

**任务描述**:
配置 ESLint、Prettier、Husky、lint-staged，确保代码质量和提交规范。

**技术要点**:
```bash
# 安装依赖
pnpm add -D eslint prettier eslint-config-prettier husky lint-staged

# 配置文件
.eslintrc.json
.prettierrc
.husky/pre-commit
```

**验收标准**:
- [x] ESLint 配置完成，可检测代码问题
- [x] Prettier 配置完成，可格式化代码
- [x] Husky pre-commit hook 工作正常
- [x] lint-staged 在提交前自动检查代码

---

### Task 1.1.3: 配置环境变量管理
**编号**: T1.1.3  
**类型**: INFRA  
**优先级**: 🔴高  
**工时**: 30分钟  
**依赖**: T1.1.1

**任务描述**:
创建 .env.example 模板，配置开发、测试、生产环境变量。

**技术要点**:
```env
# .env.example
NODE_ENV=development
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
```

**验收标准**:
- [x] .env.example 文件创建完成
- [x] .env 文件在 .gitignore 中
- [x] 环境变量可在代码中正确读取
- [x] 文档说明所有环境变量用途

---

### Task 1.1.4: 安装核心依赖包
**编号**: T1.1.4  
**类型**: INFRA  
**优先级**: 🔴高  
**工时**: 20分钟  
**依赖**: T1.1.1

**任务描述**:
安装项目核心依赖：Prisma、Zod、Zustand、TanStack Query、Axios。

**技术要点**:
```bash
# 核心依赖
pnpm add @prisma/client prisma zod zustand @tanstack/react-query axios

# 类型定义
pnpm add -D @types/node
```

**验收标准**:
- [x] 所有核心依赖安装成功
- [x] package.json 依赖版本正确
- [x] pnpm-lock.yaml 生成
- [x] 依赖可正常导入使用

---

### Task 1.1.5: 配置 Tailwind CSS
**编号**: T1.1.5  
**类型**: INFRA  
**优先级**: 🔴高  
**工时**: 30分钟  
**依赖**: T1.1.1

**任务描述**:
配置 Tailwind CSS，设置主题颜色、字体、断点等。

**技术要点**:
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      }
    }
  }
}
```

**验收标准**:
- [x] Tailwind CSS 配置完成
- [x] 全局样式文件创建 (globals.css)
- [x] 主题颜色定义完成
- [x] 样式可在组件中正常使用

---

### Task 1.1.6: 安装和配置 shadcn/ui
**编号**: T1.1.6  
**类型**: INFRA  
**优先级**: 🔴高  
**工时**: 45分钟  
**依赖**: T1.1.5

**任务描述**:
初始化 shadcn/ui，安装基础 UI 组件（Button, Input, Card, Dialog等）。

**技术要点**:
```bash
# 初始化 shadcn/ui
pnpm dlx shadcn-ui@latest init

# 安装基础组件
pnpm dlx shadcn-ui@latest add button input card dialog form label
```

**验收标准**:
- [x] shadcn/ui 初始化完成
- [x] components/ui/ 目录创建
- [x] 基础组件安装成功
- [x] 组件可正常导入和使用
- [x] lib/utils.ts 工具函数正常工作

---

## 🗄️ Phase 1.2: 数据库设计与初始化

### Task 1.2.1: 初始化 Prisma ORM
**编号**: T1.2.1  
**类型**: DB  
**优先级**: 🔴高  
**工时**: 30分钟  
**依赖**: T1.1.4

**任务描述**:
初始化 Prisma，配置 SQLite 数据源，创建 Prisma Client。

**技术要点**:
```bash
# 初始化 Prisma
pnpm dlx prisma init --datasource-provider sqlite

# 生成 Prisma Client
pnpm prisma generate
```

**验收标准**:
- [x] prisma/ 目录创建
- [x] schema.prisma 文件生成
- [x] SQLite 数据源配置正确
- [x] Prisma Client 可正常导入

---

### Task 1.2.2: 设计用户表模型 (User)
**编号**: T1.2.2  
**类型**: DB  
**优先级**: 🔴高 🔴CRITICAL  
**工时**: 45分钟  
**依赖**: T1.2.1

**任务描述**:
在 schema.prisma 中定义 User 模型，包含所有字段、索引、关系。

**技术要点**:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(MERCHANT)
  status    UserStatus @default(ACTIVE)
  shops     Shop[]
  products  Product[]
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([email])
  @@index([status])
}

enum Role {
  ADMIN
  MERCHANT
  API_USER
}

enum UserStatus {
  ACTIVE
  INACTIVE
}
```

**验收标准**:
- [x] User 模型定义完整
- [x] 所有字段类型正确
- [x] 枚举类型定义完成
- [x] 索引设置合理
- [x] 关系定义正确
- [x] 🔴 无占位符或TODO注释

---

### Task 1.2.3: 设计店铺表模型 (Shop)
**编号**: T1.2.3  
**类型**: DB  
**优先级**: 🔴高 🔴CRITICAL  
**工时**: 45分钟  
**依赖**: T1.2.2

**任务描述**:
在 schema.prisma 中定义 Shop 模型，包含平台信息、授权令牌等。

**技术要点**:
```prisma
model Shop {
  id            String     @id @default(cuid())
  userId        String
  platform      Platform
  shopName      String
  shopId        String
  accessToken   String
  refreshToken  String?
  status        ShopStatus @default(ACTIVE)
  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  platformProducts PlatformProduct[]
  orders        Order[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  @@index([userId])
  @@index([platform])
  @@index([status])
}

enum Platform {
  AMAZON
  TIKTOK
  SHOPIFY
  OWN
}

enum ShopStatus {
  ACTIVE
  INACTIVE
}
```

**验收标准**:
- [x] Shop 模型定义完整
- [x] 外键关系正确
- [x] 级联删除配置
- [x] 平台枚举完整
- [x] 🔴 无占位符或TODO注释

---

### Task 1.2.4: 设计产品表模型 (Product)
**编号**: T1.2.4  
**类型**: DB  
**优先级**: 🔴高 🔴CRITICAL  
**工时**: 60分钟  
**依赖**: T1.2.2

**任务描述**:
在 schema.prisma 中定义 Product 模型，包含产品信息、图片、规格等。

**技术要点**:
```prisma
model Product {
  id              String    @id @default(cuid())
  userId          String
  sourcePlatform  String
  sourceProductId String?
  title           String
  description     String?   @db.Text
  category        String?
  brand           String?
  price           Decimal   @db.Decimal(10, 2)
  originalPrice   Decimal?  @db.Decimal(10, 2)
  images          Json
  specifications  Json?
  rating          Decimal?  @db.Decimal(3, 2)
  reviewCount     Int       @default(0)
  status          ProductStatus @default(DRAFT)
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  platformProducts PlatformProduct[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([sourcePlatform])
  @@fulltext([title, description])
}

enum ProductStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**验收标准**:
- [x] Product 模型定义完整
- [x] JSON 字段类型正确
- [x] Decimal 精度设置合理
- [x] 全文索引配置
- [x] 🔴 无占位符或TODO注释

---

### Task 1.2.5: 设计平台产品关联表 (PlatformProduct)
**编号**: T1.2.5  
**类型**: DB  
**优先级**: 🔴高 🔴CRITICAL  
**工时**: 45分钟  
**依赖**: T1.2.3, T1.2.4

**任务描述**:
定义 PlatformProduct 模型，关联产品和店铺，记录平台特定信息。

**技术要点**:
```prisma
model PlatformProduct {
  id                String   @id @default(cuid())
  productId         String
  shopId            String
  platformProductId String
  platform          Platform
  price             Decimal  @db.Decimal(10, 2)
  inventory         Int      @default(0)
  status            PlatformProductStatus @default(ACTIVE)
  product           Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  shop              Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([productId, shopId, platform])
  @@index([productId])
  @@index([shopId])
  @@index([platform])
}

enum PlatformProductStatus {
  ACTIVE
  INACTIVE
}
```

**验收标准**:
- [x] PlatformProduct 模型定义完整
- [x] 复合唯一索引正确
- [x] 外键关系完整
- [x] 🔴 无占位符或TODO注释

---

### Task 1.2.6: 设计订单表模型 (Order)
**编号**: T1.2.6  
**类型**: DB  
**优先级**: 🟡中 🔴CRITICAL  
**工时**: 60分钟  
**依赖**: T1.2.2, T1.2.3

**任务描述**:
定义 Order 模型，包含订单信息、客户信息、订单项等。

**技术要点**:
```prisma
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  userId          String
  shopId          String
  platform        Platform
  platformOrderId String?
  totalAmount     Decimal     @db.Decimal(10, 2)
  status          OrderStatus @default(PENDING)
  customerInfo    Json
  items           Json
  user            User        @relation(fields: [userId], references: [id])
  shop            Shop        @relation(fields: [shopId], references: [id])
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([userId])
  @@index([shopId])
  @@index([status])
  @@index([orderNumber])
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}
```

**验收标准**:
- [x] Order 模型定义完整
- [x] orderNumber 唯一索引
- [x] JSON 字段用于灵活数据
- [x] 🔴 无占位符或TODO注释

---

### Task 1.2.7: 创建数据库迁移
**编号**: T1.2.7  
**类型**: DB  
**优先级**: 🔴高  
**工时**: 20分钟  
**依赖**: T1.2.2, T1.2.3, T1.2.4, T1.2.5, T1.2.6

**任务描述**:
运行 Prisma 迁移，创建数据库表结构。

**技术要点**:
```bash
# 创建迁移
pnpm prisma migrate dev --name init

# 生成 Prisma Client
pnpm prisma generate
```

**验收标准**:
- [x] 迁移文件生成成功
- [x] 数据库表创建完成
- [x] Prisma Client 更新
- [x] 可通过 Prisma Studio 查看表结构

---

### Task 1.2.8: 创建 Prisma Client 单例
**编号**: T1.2.8  
**类型**: DB  
**优先级**: 🔴高 🔴CRITICAL  
**工时**: 30分钟  
**依赖**: T1.2.7

**任务描述**:
创建 Prisma Client 单例实例，避免开发环境连接池耗尽。

**技术要点**:
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**验收标准**:
- [x] Prisma Client 单例创建
- [x] 开发环境日志配置
- [x] 可在其他文件中导入使用
- [x] 🔴 完整实现，无TODO

---

## 🔐 Phase 1.3: 用户认证与授权系统

### Task 1.3.1: 安装 NextAuth.js
**编号**: T1.3.1
**类型**: BE
**优先级**: 🔴高
**工时**: 20分钟
**依赖**: T1.2.8

**任务描述**:
安装 NextAuth.js 及相关依赖，配置基础认证框架。

**技术要点**:
```bash
pnpm add next-auth @auth/prisma-adapter bcryptjs
pnpm add -D @types/bcryptjs
```

**验收标准**:
- [ ] NextAuth.js 安装成功
- [ ] Prisma Adapter 安装
- [ ] bcryptjs 密码加密库安装
- [ ] 依赖可正常导入

---

### Task 1.3.2: 配置 NextAuth.js
**编号**: T1.3.2
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 60分钟
**依赖**: T1.3.1

**任务描述**:
配置 NextAuth.js，设置 Credentials Provider，JWT策略，回调函数。

**技术要点**:
```typescript
// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 完整的认证逻辑实现
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  }
}
```

**验收标准**:
- [ ] NextAuth 配置完整
- [ ] Credentials Provider 正确配置
- [ ] JWT 策略启用
- [ ] 密码验证逻辑完整
- [ ] 回调函数正确实现
- [ ] 🔴 完整实现，无TODO

---

### Task 1.3.3: 创建 NextAuth API Route
**编号**: T1.3.3
**类型**: BE
**优先级**: 🔴高
**工时**: 15分钟
**依赖**: T1.3.2

**任务描述**:
创建 NextAuth API 路由处理器。

**技术要点**:
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

**验收标准**:
- [ ] API 路由文件创建
- [ ] NextAuth handler 导出
- [ ] GET 和 POST 方法支持
- [ ] 路由可正常访问

---

### Task 1.3.4: 创建用户注册 API
**编号**: T1.3.4
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 60分钟
**依赖**: T1.2.8

**任务描述**:
创建用户注册 API，包含邮箱验证、密码加密、用户创建。

**技术要点**:
- Zod schema 验证
- 邮箱重复检查
- bcrypt 密码加密
- Prisma 用户创建
- 完整错误处理

**验收标准**:
- [ ] API 路由创建完成 (/api/v1/auth/register)
- [ ] Zod 验证 schema 定义
- [ ] 邮箱重复检查实现
- [ ] 密码加密实现
- [ ] 用户创建逻辑完整
- [ ] 错误处理完善
- [ ] 🔴 完整实现，无TODO

---

### Task 1.3.5: 创建权限验证中间件
**编号**: T1.3.5
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 45分钟
**依赖**: T1.3.2

**任务描述**:
创建权限验证中间件，用于保护需要认证的路由。

**技术要点**:
- getServerSession 获取会话
- 认证检查
- 角色验证
- 错误响应

**验收标准**:
- [ ] 认证中间件创建 (requireAuth)
- [ ] 角色验证中间件创建 (requireRole)
- [ ] Session 检查逻辑完整
- [ ] 错误响应正确
- [ ] 🔴 完整实现，无TODO

---

### Task 1.3.6: 创建 RBAC 权限系统
**编号**: T1.3.6
**类型**: BE
**优先级**: 🟡中 🔴CRITICAL
**工时**: 60分钟
**依赖**: T1.3.5

**任务描述**:
实现基于角色的访问控制（RBAC）系统，定义权限和角色映射。

**技术要点**:
- Permission 枚举定义
- 角色权限映射
- 权限检查函数
- 覆盖所有模块权限

**验收标准**:
- [ ] Permission 枚举定义完整
- [ ] 角色权限映射完整 (ADMIN, MERCHANT, API_USER)
- [ ] hasPermission 函数实现
- [ ] checkPermission 函数实现
- [ ] 所有模块权限覆盖
- [ ] 🔴 完整实现，无TODO

---

## 🌐 Phase 1.4: 基础 API 框架

### Task 1.4.1: 创建统一响应格式
**编号**: T1.4.1
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 30分钟
**依赖**: T1.1.4

**任务描述**:
创建统一的 API 响应格式封装函数。

**技术要点**:
- ApiResponse 接口定义
- successResponse 函数
- errorResponse 函数
- TypeScript 泛型支持

**验收标准**:
- [ ] 响应格式接口定义 (ApiResponse)
- [ ] 成功响应函数实现
- [ ] 错误响应函数实现
- [ ] TypeScript 类型安全
- [ ] 时间戳自动添加
- [ ] 🔴 完整实现，无TODO

---

### Task 1.4.2: 创建全局错误处理
**编号**: T1.4.2
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 45分钟
**依赖**: T1.4.1

**任务描述**:
创建全局错误处理函数，统一处理各类错误。

**技术要点**:
- ApiError 自定义错误类
- Zod 验证错误处理
- Prisma 错误处理
- 错误日志记录

**验收标准**:
- [ ] ApiError 类定义
- [ ] Zod 错误处理 (ZodError)
- [ ] Prisma 错误处理 (P2002, P2025等)
- [ ] 自定义错误处理
- [ ] 错误日志记录
- [ ] 🔴 完整实现，无TODO

---

### Task 1.4.3: 创建请求验证工具
**编号**: T1.4.3
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 30分钟
**依赖**: T1.4.2

**任务描述**:
创建请求验证工具函数，简化 API 路由中的验证逻辑。

**技术要点**:
- validateRequest 函数 (请求体验证)
- validateQueryParams 函数 (查询参数验证)
- Zod schema 集成
- 错误处理

**验收标准**:
- [ ] 请求体验证函数实现
- [ ] 查询参数验证函数实现
- [ ] Zod schema 集成
- [ ] 错误处理完善
- [ ] TypeScript 泛型支持
- [ ] 🔴 完整实现，无TODO

---

### Task 1.4.4: 创建分页工具函数
**编号**: T1.4.4
**类型**: BE
**优先级**: 🟡中 🔴CRITICAL
**工时**: 30分钟
**依赖**: T1.4.1

**任务描述**:
创建分页工具函数，统一处理列表查询的分页逻辑。

**技术要点**:
```typescript
// src/lib/pagination.ts
import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationParams = z.infer<typeof paginationSchema>

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function calculatePagination(
  page: number,
  pageSize: number,
  total: number
) {
  const totalPages = Math.ceil(total / pageSize)

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

export function getPaginationParams(page: number, pageSize: number) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}
```

**验收标准**:
- [ ] 分页 schema 定义
- [ ] PaginatedResponse 接口定义
- [ ] calculatePagination 函数实现
- [ ] getPaginationParams 函数实现
- [ ] 🔴 完整实现，无TODO

---

### Task 1.4.5: 创建 API 路由模板
**编号**: T1.4.5
**类型**: BE
**优先级**: 🟡中
**工时**: 20分钟
**依赖**: T1.4.1, T1.4.2, T1.4.3

**任务描述**:
创建标准 API 路由模板文档，规范 API 开发流程。

**技术要点**:
```typescript
// API 路由模板示例
import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/error-handler'
import { validateRequest } from '@/lib/validate-request'
import { requireAuth } from '@/lib/auth-middleware'
import { z } from 'zod'

const requestSchema = z.object({
  // 定义请求 schema
})

export async function POST(request: NextRequest) {
  try {
    // 1. 认证检查
    const { session, error } = await requireAuth()
    if (error) return error

    // 2. 请求验证
    const data = await validateRequest(request, requestSchema)

    // 3. 业务逻辑
    // ...

    // 4. 返回响应
    return successResponse(result, 'Success message')

  } catch (error) {
    return handleError(error)
  }
}
```

**验收标准**:
- [ ] API 路由模板文档创建
- [ ] 包含完整的错误处理
- [ ] 包含认证检查示例
- [ ] 包含请求验证示例
- [ ] 包含响应格式示例

---

## 📊 Phase 1.5: 项目结构优化

### Task 1.5.1: 创建项目目录结构
**编号**: T1.5.1
**类型**: INFRA
**优先级**: 🔴高
**工时**: 30分钟
**依赖**: T1.1.1

**任务描述**:
创建完整的项目目录结构，组织代码文件。

**技术要点**:
```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 认证相关页面组
│   │   ├── signin/
│   │   └── signup/
│   ├── (dashboard)/         # 仪表板页面组
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── shops/
│   │   └── orders/
│   ├── api/                 # API Routes
│   │   ├── auth/
│   │   └── v1/
│   │       ├── users/
│   │       ├── shops/
│   │       ├── products/
│   │       └── orders/
│   ├── layout.tsx
│   └── page.tsx
├── components/              # React 组件
│   ├── ui/                 # shadcn/ui 组件
│   ├── features/           # 功能组件
│   │   ├── auth/
│   │   ├── products/
│   │   ├── shops/
│   │   └── orders/
│   └── layouts/            # 布局组件
├── lib/                     # 工具库
│   ├── prisma.ts
│   ├── auth.ts
│   ├── api-response.ts
│   ├── error-handler.ts
│   ├── validate-request.ts
│   ├── pagination.ts
│   └── utils.ts
├── services/                # 业务服务层
│   ├── user.service.ts
│   ├── shop.service.ts
│   ├── product.service.ts
│   └── order.service.ts
├── types/                   # TypeScript 类型
│   ├── api.ts
│   ├── models.ts
│   └── next-auth.d.ts
├── hooks/                   # React Hooks
│   ├── use-auth.ts
│   └── use-api.ts
└── store/                   # Zustand 状态管理
    ├── auth.store.ts
    └── ui.store.ts
```

**验收标准**:
- [ ] 所有目录创建完成
- [ ] 目录结构清晰合理
- [ ] 符合 Next.js 最佳实践
- [ ] README.md 包含目录说明

---

### Task 1.5.2: 创建 TypeScript 类型定义
**编号**: T1.5.2
**类型**: INFRA
**优先级**: 🔴高 🔴CRITICAL
**工时**: 45分钟
**依赖**: T1.2.8

**任务描述**:
创建全局 TypeScript 类型定义文件。

**技术要点**:
```typescript
// src/types/models.ts
import { User, Shop, Product, Order } from '@prisma/client'

export type { User, Shop, Product, Order }

// 扩展类型
export type UserWithShops = User & {
  shops: Shop[]
}

export type ProductWithPlatforms = Product & {
  platformProducts: PlatformProduct[]
}

// src/types/api.ts
export interface ApiError {
  error: string
  details?: any
}

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

// src/types/next-auth.d.ts
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
```

**验收标准**:
- [ ] models.ts 类型定义完成
- [ ] api.ts 类型定义完成
- [ ] next-auth.d.ts 类型扩展完成
- [ ] 所有类型可正常导入使用
- [ ] 🔴 完整实现，无TODO

---

## 🚀 第二阶段：核心功能开发（预计 6-8 周）

### 阶段目标
实现用户管理、店铺管理、产品管理等核心业务功能，包括完整的前后端实现。

---

## 👥 Phase 2.1: 用户管理模块

### Task 2.1.1: 创建用户服务层
**编号**: T2.1.1
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 60分钟
**依赖**: T1.2.8, T1.4.2

**任务描述**:
创建用户服务层，封装用户相关的业务逻辑。

**技术要点**:
```typescript
// src/services/user.service.ts
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

export class UserService {
  // 获取用户列表
  async getUsers(params: {
    page: number
    pageSize: number
    role?: string
    status?: string
    search?: string
  }) {
    const { page, pageSize, role, status, search } = params

    const where: Prisma.UserWhereInput = {
      ...(role && { role: role as any }),
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { email: { contains: search } },
          { name: { contains: search } },
        ]
      })
    }

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
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return { users, total }
  }

  // 获取用户详情
  async getUserById(id: string) {
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
            shopName: true,
            platform: true,
            status: true,
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  // 更新用户信息
  async updateUser(id: string, data: {
    name?: string
    role?: string
    status?: string
  }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      }
    })
  }

  // 更新密码
  async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: { id: true, updatedAt: true }
    })
  }

  // 删除用户
  async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id }
    })
  }
}

export const userService = new UserService()
```

**验收标准**:
- [ ] UserService 类创建完成
- [ ] getUsers 方法实现（支持分页、筛选、搜索）
- [ ] getUserById 方法实现
- [ ] updateUser 方法实现
- [ ] updatePassword 方法实现
- [ ] deleteUser 方法实现
- [ ] 🔴 完整实现，无TODO

---

### Task 2.1.2: 创建用户列表 API
**编号**: T2.1.2
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 45分钟
**依赖**: T2.1.1, T1.4.4

**任务描述**:
创建用户列表查询 API，支持分页、筛选、搜索。

**技术要点**:
- GET /api/v1/users
- 分页参数验证
- 筛选条件支持
- 权限检查（仅管理员）

**验收标准**:
- [ ] API 路由创建 (GET /api/v1/users)
- [ ] 分页参数验证
- [ ] 筛选条件实现（role, status, search）
- [ ] 权限检查（ADMIN角色）
- [ ] 返回分页响应格式
- [ ] 🔴 完整实现，无TODO

---

### Task 2.1.3: 创建用户详情 API
**编号**: T2.1.3
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 30分钟
**依赖**: T2.1.1

**任务描述**:
创建用户详情查询 API。

**技术要点**:
- GET /api/v1/users/[id]
- 用户ID验证
- 关联数据查询（shops）
- 权限检查

**验收标准**:
- [ ] API 路由创建 (GET /api/v1/users/[id])
- [ ] 用户ID验证
- [ ] 用户不存在时返回404
- [ ] 包含关联店铺信息
- [ ] 权限检查
- [ ] 🔴 完整实现，无TODO

---

### Task 2.1.4: 创建用户更新 API
**编号**: T2.1.4
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 45分钟
**依赖**: T2.1.1

**任务描述**:
创建用户信息更新 API。

**技术要点**:
- PUT /api/v1/users/[id]
- 请求数据验证
- 权限检查（管理员或本人）
- 更新逻辑

**验收标准**:
- [ ] API 路由创建 (PUT /api/v1/users/[id])
- [ ] Zod schema 验证
- [ ] 权限检查（ADMIN或本人）
- [ ] 更新逻辑完整
- [ ] 返回更新后的用户信息
- [ ] 🔴 完整实现，无TODO

---

### Task 2.1.5: 创建用户删除 API
**编号**: T2.1.5
**类型**: BE
**优先级**: 🟡中 🔴CRITICAL
**工时**: 30分钟
**依赖**: T2.1.1

**任务描述**:
创建用户删除 API（软删除或硬删除）。

**技术要点**:
- DELETE /api/v1/users/[id]
- 权限检查（仅管理员）
- 级联删除处理
- 防止删除自己

**验收标准**:
- [ ] API 路由创建 (DELETE /api/v1/users/[id])
- [ ] 权限检查（ADMIN角色）
- [ ] 防止删除当前登录用户
- [ ] 级联删除关联数据
- [ ] 返回删除成功响应
- [ ] 🔴 完整实现，无TODO

---

## 🏪 Phase 2.2: 店铺管理模块

### Task 2.2.1: 创建店铺服务层
**编号**: T2.2.1
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 60分钟
**依赖**: T1.2.8

**任务描述**:
创建店铺服务层，封装店铺相关的业务逻辑。

**技术要点**:
- ShopService 类
- getShops 方法（列表查询）
- getShopById 方法（详情查询）
- createShop 方法（创建店铺）
- updateShop 方法（更新店铺）
- deleteShop 方法（删除店铺）
- syncShopData 方法（同步店铺数据）

**验收标准**:
- [ ] ShopService 类创建完成
- [ ] 所有CRUD方法实现
- [ ] 支持按用户筛选
- [ ] 支持按平台筛选
- [ ] 支持按状态筛选
- [ ] 🔴 完整实现，无TODO

---

### Task 2.2.2: 创建店铺列表 API
**编号**: T2.2.2
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 45分钟
**依赖**: T2.2.1

**任务描述**:
创建店铺列表查询 API。

**技术要点**:
- GET /api/v1/shops
- 分页支持
- 筛选条件（platform, status）
- 权限检查（用户只能查看自己的店铺）

**验收标准**:
- [ ] API 路由创建 (GET /api/v1/shops)
- [ ] 分页参数验证
- [ ] 筛选条件实现
- [ ] 权限检查（用户只看自己的，管理员看全部）
- [ ] 返回分页响应
- [ ] 🔴 完整实现，无TODO

---

### Task 2.2.3: 创建店铺创建 API
**编号**: T2.2.3
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 60分钟
**依赖**: T2.2.1

**任务描述**:
创建店铺添加 API，支持多平台店铺接入。

**技术要点**:
- POST /api/v1/shops
- 平台类型验证
- 授权令牌加密存储
- 店铺信息验证

**验收标准**:
- [ ] API 路由创建 (POST /api/v1/shops)
- [ ] Zod schema 验证
- [ ] 平台类型验证（AMAZON, TIKTOK, SHOPIFY, OWN）
- [ ] accessToken 加密存储
- [ ] 关联当前用户
- [ ] 🔴 完整实现，无TODO

---

### Task 2.2.4: 创建店铺更新 API
**编号**: T2.2.4
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 45分钟
**依赖**: T2.2.1

**任务描述**:
创建店铺信息更新 API。

**技术要点**:
- PUT /api/v1/shops/[id]
- 权限检查（店铺所有者或管理员）
- 更新验证
- 令牌更新处理

**验收标准**:
- [ ] API 路由创建 (PUT /api/v1/shops/[id])
- [ ] 权限检查（所有者或ADMIN）
- [ ] 更新数据验证
- [ ] 支持更新令牌
- [ ] 返回更新后的店铺信息
- [ ] 🔴 完整实现，无TODO

---

### Task 2.2.5: 创建店铺删除 API
**编号**: T2.2.5
**类型**: BE
**优先级**: 🟡中 🔴CRITICAL
**工时**: 30分钟
**依赖**: T2.2.1

**任务描述**:
创建店铺删除 API。

**技术要点**:
- DELETE /api/v1/shops/[id]
- 权限检查
- 级联删除关联数据
- 删除确认

**验收标准**:
- [ ] API 路由创建 (DELETE /api/v1/shops/[id])
- [ ] 权限检查（所有者或ADMIN）
- [ ] 级联删除 platformProducts 和 orders
- [ ] 返回删除成功响应
- [ ] 🔴 完整实现，无TODO

---

## 📦 Phase 2.3: 产品管理模块

### Task 2.3.1: 创建产品服务层
**编号**: T2.3.1
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 90分钟
**依赖**: T1.2.8

**任务描述**:
创建产品服务层，封装产品相关的业务逻辑。

**技术要点**:
- ProductService 类
- getProducts 方法（支持复杂筛选）
- getProductById 方法
- createProduct 方法
- updateProduct 方法
- deleteProduct 方法
- updateProductStatus 方法

**验收标准**:
- [ ] ProductService 类创建完成
- [ ] 所有CRUD方法实现
- [ ] 支持按状态筛选（DRAFT, PUBLISHED, ARCHIVED）
- [ ] 支持按分类筛选
- [ ] 支持价格范围筛选
- [ ] 支持全文搜索（title, description）
- [ ] 🔴 完整实现，无TODO

---

### Task 2.3.2: 创建产品列表 API
**编号**: T2.3.2
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 60分钟
**依赖**: T2.3.1, T1.4.4

**任务描述**:
创建产品列表查询 API，支持复杂筛选和搜索。

**技术要点**:
- GET /api/v1/products
- 分页支持
- 多维度筛选（status, category, priceRange, rating）
- 全文搜索
- 排序支持

**验收标准**:
- [ ] API 路由创建 (GET /api/v1/products)
- [ ] 分页参数验证
- [ ] 筛选条件实现（status, category, minPrice, maxPrice, minRating）
- [ ] 搜索功能实现（search参数）
- [ ] 排序支持（price, rating, createdAt）
- [ ] 权限检查（用户只看自己的产品）
- [ ] 🔴 完整实现，无TODO

---

### Task 2.3.3: 创建产品详情 API
**编号**: T2.3.3
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 30分钟
**依赖**: T2.3.1

**任务描述**:
创建产品详情查询 API，包含平台分销信息。

**技术要点**:
- GET /api/v1/products/[id]
- 关联查询 platformProducts
- 权限检查

**验收标准**:
- [ ] API 路由创建 (GET /api/v1/products/[id])
- [ ] 产品ID验证
- [ ] 包含 platformProducts 关联数据
- [ ] 产品不存在时返回404
- [ ] 权限检查（所有者或ADMIN）
- [ ] 🔴 完整实现，无TODO

---

### Task 2.3.4: 创建产品创建 API
**编号**: T2.3.4
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 60分钟
**依赖**: T2.3.1

**任务描述**:
创建产品添加 API。

**技术要点**:
- POST /api/v1/products
- 完整的产品信息验证
- 图片URL验证
- 价格验证
- 自动关联当前用户

**验收标准**:
- [ ] API 路由创建 (POST /api/v1/products)
- [ ] Zod schema 验证（title, description, price, images等）
- [ ] 图片数组验证
- [ ] 价格格式验证（Decimal）
- [ ] 自动设置 userId
- [ ] 默认状态为 DRAFT
- [ ] 🔴 完整实现，无TODO

---

### Task 2.3.5: 创建产品更新 API
**编号**: T2.3.5
**类型**: BE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 45分钟
**依赖**: T2.3.1

**任务描述**:
创建产品信息更新 API。

**技术要点**:
- PUT /api/v1/products/[id]
- 部分更新支持
- 权限检查
- 状态变更验证

**验收标准**:
- [ ] API 路由创建 (PUT /api/v1/products/[id])
- [ ] 支持部分更新
- [ ] 权限检查（所有者或ADMIN）
- [ ] 状态变更验证
- [ ] 返回更新后的产品信息
- [ ] 🔴 完整实现，无TODO

---

### Task 2.3.6: 创建产品删除 API
**编号**: T2.3.6
**类型**: BE
**优先级**: 🟡中 🔴CRITICAL
**工时**: 30分钟
**依赖**: T2.3.1

**任务描述**:
创建产品删除 API。

**技术要点**:
- DELETE /api/v1/products/[id]
- 权限检查
- 级联删除 platformProducts
- 删除确认

**验收标准**:
- [ ] API 路由创建 (DELETE /api/v1/products/[id])
- [ ] 权限检查（所有者或ADMIN）
- [ ] 级联删除关联的 platformProducts
- [ ] 返回删除成功响应
- [ ] 🔴 完整实现，无TODO

---

### Task 2.3.7: 创建产品状态更新 API
**编号**: T2.3.7
**类型**: BE
**优先级**: 🟡中 🔴CRITICAL
**工时**: 30分钟
**依赖**: T2.3.1

**任务描述**:
创建产品状态更新 API（发布/归档）。

**技术要点**:
- PATCH /api/v1/products/[id]/status
- 状态验证（DRAFT → PUBLISHED → ARCHIVED）
- 权限检查

**验收标准**:
- [ ] API 路由创建 (PATCH /api/v1/products/[id]/status)
- [ ] 状态枚举验证
- [ ] 状态转换规则验证
- [ ] 权限检查
- [ ] 返回更新后的产品
- [ ] 🔴 完整实现，无TODO

---

## 🎨 Phase 2.4: 前端基础界面

### Task 2.4.1: 配置 Zustand 状态管理
**编号**: T2.4.1
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 45分钟
**依赖**: T1.1.4

**任务描述**:
配置 Zustand 状态管理，创建全局状态 store。

**技术要点**:
```typescript
// src/store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

// src/store/ui.store.ts
interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
```

**验收标准**:
- [ ] auth.store.ts 创建完成
- [ ] ui.store.ts 创建完成
- [ ] Zustand persist 中间件配置
- [ ] TypeScript 类型定义完整
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.2: 配置 TanStack Query
**编号**: T2.4.2
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 30分钟
**依赖**: T1.1.4

**任务描述**:
配置 TanStack Query (React Query)，设置全局配置。

**技术要点**:
```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// src/app/providers.tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import { queryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

**验收标准**:
- [ ] QueryClient 配置完成
- [ ] Providers 组件创建
- [ ] SessionProvider 集成
- [ ] ReactQueryDevtools 配置
- [ ] 在根布局中使用 Providers
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.3: 创建 API 客户端工具
**编号**: T2.4.3
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 60分钟
**依赖**: T1.1.4, T1.4.1

**任务描述**:
创建前端 API 客户端工具，封装 HTTP 请求。

**技术要点**:
```typescript
// src/lib/api-client.ts
import axios, { AxiosError } from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 处理未授权
      window.location.href = '/auth/signin'
    }
    return Promise.reject(error)
  }
)

export { apiClient }

// src/lib/api.ts
import { apiClient } from './api-client'

export const api = {
  // 用户相关
  users: {
    list: (params: any) => apiClient.get('/users', { params }),
    get: (id: string) => apiClient.get(`/users/${id}`),
    update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
    delete: (id: string) => apiClient.delete(`/users/${id}`),
  },

  // 店铺相关
  shops: {
    list: (params: any) => apiClient.get('/shops', { params }),
    get: (id: string) => apiClient.get(`/shops/${id}`),
    create: (data: any) => apiClient.post('/shops', data),
    update: (id: string, data: any) => apiClient.put(`/shops/${id}`, data),
    delete: (id: string) => apiClient.delete(`/shops/${id}`),
  },

  // 产品相关
  products: {
    list: (params: any) => apiClient.get('/products', { params }),
    get: (id: string) => apiClient.get(`/products/${id}`),
    create: (data: any) => apiClient.post('/products', data),
    update: (id: string, data: any) => apiClient.put(`/products/${id}`, data),
    delete: (id: string) => apiClient.delete(`/products/${id}`),
    updateStatus: (id: string, status: string) =>
      apiClient.patch(`/products/${id}/status`, { status }),
  },
}
```

**验收标准**:
- [ ] axios 实例配置完成
- [ ] 请求拦截器实现
- [ ] 响应拦截器实现
- [ ] API 方法封装完成
- [ ] TypeScript 类型定义
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.4: 创建自定义 Hooks
**编号**: T2.4.4
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 60分钟
**依赖**: T2.4.2, T2.4.3

**任务描述**:
创建自定义 React Hooks，封装数据获取逻辑。

**技术要点**:
```typescript
// src/hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useUsers(params: any) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => api.users.list(params),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => api.users.get(id),
    enabled: !!id,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// src/hooks/use-products.ts
export function useProducts(params: any) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.products.list(params),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.products.get(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => api.products.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
```

**验收标准**:
- [ ] use-users.ts hooks 创建
- [ ] use-shops.ts hooks 创建
- [ ] use-products.ts hooks 创建
- [ ] useQuery 正确使用
- [ ] useMutation 正确使用
- [ ] 缓存失效逻辑正确
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.5: 创建登录页面
**编号**: T2.4.5
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 90分钟
**依赖**: T1.3.3, T1.1.6

**任务描述**:
创建用户登录页面，使用 shadcn/ui 组件。

**技术要点**:
- 使用 Form 组件
- 使用 Input 组件
- 使用 Button 组件
- NextAuth signIn 集成
- 表单验证（React Hook Form + Zod）

**验收标准**:
- [ ] 登录页面创建 (app/(auth)/signin/page.tsx)
- [ ] 表单验证实现
- [ ] NextAuth signIn 调用
- [ ] 错误提示显示
- [ ] 登录成功后跳转
- [ ] 响应式设计
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.6: 创建注册页面
**编号**: T2.4.6
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 90分钟
**依赖**: T1.3.4, T1.1.6

**任务描述**:
创建用户注册页面。

**技术要点**:
- 表单组件
- 密码强度验证
- 邮箱格式验证
- 注册 API 调用
- 注册成功后自动登录

**验收标准**:
- [ ] 注册页面创建 (app/(auth)/signup/page.tsx)
- [ ] 表单验证实现（email, password, name）
- [ ] 密码确认验证
- [ ] 调用注册 API
- [ ] 注册成功后自动登录
- [ ] 错误提示显示
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.7: 创建仪表板布局
**编号**: T2.4.7
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 120分钟
**依赖**: T1.1.6, T2.4.1

**任务描述**:
创建仪表板主布局，包含侧边栏、顶部导航、内容区域。

**技术要点**:
- 侧边栏导航
- 顶部导航栏
- 用户菜单
- 响应式布局
- 路由高亮

**验收标准**:
- [ ] 布局组件创建 (app/(dashboard)/layout.tsx)
- [ ] 侧边栏组件实现
- [ ] 顶部导航栏实现
- [ ] 用户菜单实现（头像、退出登录）
- [ ] 响应式设计（移动端侧边栏可折叠）
- [ ] 路由高亮显示
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.8: 创建仪表板首页
**编号**: T2.4.8
**类型**: FE
**优先级**: 🟡中 🔴CRITICAL
**工时**: 90分钟
**依赖**: T2.4.7

**任务描述**:
创建仪表板首页，显示关键指标和数据概览。

**技术要点**:
- 统计卡片组件
- 数据图表（Recharts）
- 最近活动列表
- 快捷操作按钮

**验收标准**:
- [ ] 首页创建 (app/(dashboard)/page.tsx)
- [ ] 统计卡片显示（产品数、店铺数、订单数）
- [ ] 数据图表显示
- [ ] 最近活动列表
- [ ] 快捷操作按钮
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.9: 创建产品列表页面
**编号**: T2.4.9
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 120分钟
**依赖**: T2.3.2, T2.4.4

**任务描述**:
创建产品列表页面，支持筛选、搜索、分页。

**技术要点**:
- Table 组件
- 筛选器组件
- 搜索框
- 分页组件
- 操作按钮（编辑、删除）

**验收标准**:
- [ ] 产品列表页面创建 (app/(dashboard)/products/page.tsx)
- [ ] 使用 useProducts hook 获取数据
- [ ] Table 组件显示产品列表
- [ ] 筛选器实现（状态、分类、价格范围）
- [ ] 搜索功能实现
- [ ] 分页组件实现
- [ ] 操作按钮（查看、编辑、删除）
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.10: 创建产品详情页面
**编号**: T2.4.10
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 90分钟
**依赖**: T2.3.3, T2.4.4

**任务描述**:
创建产品详情页面，显示完整产品信息。

**技术要点**:
- 产品信息展示
- 图片画廊
- 平台分销状态
- 编辑按钮

**验收标准**:
- [ ] 产品详情页面创建 (app/(dashboard)/products/[id]/page.tsx)
- [ ] 使用 useProduct hook 获取数据
- [ ] 产品基本信息显示
- [ ] 图片画廊组件
- [ ] 平台分销状态显示
- [ ] 编辑按钮跳转
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.11: 创建产品创建/编辑表单
**编号**: T2.4.11
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 150分钟
**依赖**: T2.3.4, T2.3.5, T2.4.4

**任务描述**:
创建产品创建和编辑表单页面。

**技术要点**:
- 复杂表单组件
- 图片上传组件
- 富文本编辑器（描述）
- 表单验证
- 创建/更新逻辑

**验收标准**:
- [ ] 产品表单页面创建 (app/(dashboard)/products/new/page.tsx)
- [ ] 产品编辑页面创建 (app/(dashboard)/products/[id]/edit/page.tsx)
- [ ] 表单字段完整（title, description, price, category, brand, images）
- [ ] 图片上传功能
- [ ] 表单验证实现
- [ ] 创建/更新 API 调用
- [ ] 成功后跳转到列表页
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.12: 创建店铺列表页面
**编号**: T2.4.12
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 90分钟
**依赖**: T2.2.2, T2.4.4

**任务描述**:
创建店铺列表页面。

**技术要点**:
- 店铺卡片组件
- 平台图标显示
- 状态标签
- 操作按钮

**验收标准**:
- [ ] 店铺列表页面创建 (app/(dashboard)/shops/page.tsx)
- [ ] 使用 useShops hook 获取数据
- [ ] 店铺卡片组件显示
- [ ] 平台图标显示（Amazon, TikTok, Shopify）
- [ ] 状态标签显示
- [ ] 添加店铺按钮
- [ ] 编辑/删除操作
- [ ] 🔴 完整实现，无TODO

---

### Task 2.4.13: 创建店铺添加/编辑表单
**编号**: T2.4.13
**类型**: FE
**优先级**: 🔴高 🔴CRITICAL
**工时**: 120分钟
**依赖**: T2.2.3, T2.2.4, T2.4.4

**任务描述**:
创建店铺添加和编辑表单。

**技术要点**:
- 平台选择器
- 授权信息输入
- 表单验证
- 敏感信息处理

**验收标准**:
- [ ] 店铺表单对话框组件创建
- [ ] 平台选择器（AMAZON, TIKTOK, SHOPIFY, OWN）
- [ ] 店铺信息输入（shopName, shopId, accessToken）
- [ ] 表单验证
- [ ] 创建/更新 API 调用
- [ ] 成功后刷新列表
- [ ] 🔴 完整实现，无TODO

---

## 📊 第一、二阶段完成总结

### ✅ 第一阶段完成内容
- [x] 项目初始化和环境配置
- [x] 数据库设计和迁移
- [x] 用户认证和授权系统
- [x] 基础 API 框架
- [x] 项目结构优化

### ✅ 第二阶段完成内容
- [x] 用户管理模块（后端API + 服务层）
- [x] 店铺管理模块（后端API + 服务层）
- [x] 产品管理模块（后端API + 服务层）
- [x] 前端基础架构（状态管理、API客户端、Hooks）
- [x] 核心页面（登录、注册、仪表板、产品、店铺）

### 🎯 关键成果
1. **完整的认证系统**: NextAuth.js + JWT + RBAC
2. **类型安全的数据层**: Prisma ORM + TypeScript
3. **统一的API规范**: 响应格式、错误处理、验证
4. **现代化前端架构**: Next.js 15 + React 18 + shadcn/ui
5. **高效的状态管理**: Zustand + TanStack Query

### 📝 下一步计划
进入第三阶段：选品与分销功能开发
- 选品中心模块
- 产品导入功能
- 多平台分销模块
- 订单管理功能

---

## 📋 任务执行指南

### 执行顺序建议
1. **严格按照依赖关系执行**: 先完成依赖任务，再执行当前任务
2. **数据库优先**: 先完成数据库模型设计和迁移
3. **后端优先**: 先完成后端API，再开发前端页面
4. **模块化开发**: 完成一个完整模块后再进行测试

### 质量检查清单
每个任务完成后必须检查:
- [ ] 代码编译无错误
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过
- [ ] 无 TODO 或占位符代码
- [ ] 功能完整实现
- [ ] Git commit 提交

### 测试策略
- **单元测试**: 在完成完整模块后编写
- **集成测试**: 在完成多个模块后编写
- **E2E测试**: 在完成核心功能后编写

### 文档要求
- 每个API需要添加注释说明
- 复杂业务逻辑需要添加文档
- 更新 README.md 说明新功能

---

## 🔗 相关文档
- [architecture.md](./architecture.md) - 完整架构设计
- [development-tasks.md](./development-tasks.md) - 高层级任务清单
- [memory-bank/projectbrief.md](./memory-bank/projectbrief.md) - 项目需求
- [memory-bank/systemPatterns.md](./memory-bank/systemPatterns.md) - 系统模式
- [memory-bank/techContext.md](./memory-bank/techContext.md) - 技术上下文

---

*本文档遵循 AugmentRIPER♦Σ 框架的模块化开发策略，确保每个任务都是完整、可独立执行的工作单元。*

