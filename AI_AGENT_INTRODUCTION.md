# 🤖 六脉增长系统 - 全栈智能体介绍

## 📋 项目概览

**六脉增长系统**是一个基于 Next.js 16 + Tailwind CSS v4 + Supabase 的全栈 AI 商业增长平台，采用 Lobe Chat 设计风格，为创业者提供完整的商业战略和内容创作解决方案。

## 🏗️ 技术架构

### 核心技术栈

- **前端框架**: Next.js 16 (App Router)
- **样式系统**: Tailwind CSS v4 (无配置)
- **状态管理**: React Server Actions + useState
- **数据库**: Supabase (PostgreSQL)
- **认证系统**: Supabase Auth
- **AI 集成**: Dify API (双智能体分流)
- **部署**: Vercel

### 架构设计原则

遵循 **"铁律三原则"**：

1. **UI 和逻辑分离** - 组件只负责展示，页面负责业务逻辑
2. **利用 Layout 复用** - 全局布局自动应用导航和页脚
3. **避免过度封装** - 保持简单，只抄视觉样式

## 🎨 设计系统

### 视觉风格

- **设计语言**: Lobe Hub 现代化设计
- **颜色系统**: Slate 色系 + 蓝紫色渐变主题
- **字体系统**: Geist Sans (系统字体栈)
- **动画效果**: 平滑过渡 + 微交互
- **暗色主题**: 默认深色模式，支持主题切换

### 组件库

**基础组件** (`components/ui/`):
- Button - 多种变体（默认、渐变、玻璃、轮廓、幽灵）
- Card - 卡片容器，支持玻璃效果
- Input/Textarea - 表单输入组件
- Badge - 状态徽章
- Loading - 加载动画和骨架屏
- Markdown - GitHub 风格 Markdown 渲染

**业务组件** (`components/business/`):
- StrategyForm - 战略研究表单
- StreamingOutput - 流式输出面板
- SplitScreenLayout - 分屏布局

## 🔄 双智能体系统

### 智能体分流架构

系统采用 **双智能体分流** 设计，通过环境变量隔离不同业务模块：

#### 【天道·战略】模块
- **环境变量**: `DIFY_STRATEGY_KEY`
- **功能**: 商业战略研究、市场分析、RAG 检索
- **访问权限**: 支持匿名访问
- **API 端点**: `/api/strategy`
- **Server Action**: `streamBusinessStrategy`

#### 【神韵·IP】模块
- **环境变量**: `DIFY_CONTENT_KEY`
- **功能**: 内容创作、脚本生成、IP 内容生产
- **访问权限**: 需要用户认证
- **API 端点**: `/api/generate-strategy`
- **Server Action**: `streamContentIP`

### 智能体工作流程

```
用户输入 → 环境变量路由 → 对应智能体 → 流式响应 → 前端展示
```

**核心优势**:
- ✅ 完全隔离的智能体配置
- ✅ 独立的认证和权限控制
- ✅ 可扩展的多智能体架构
- ✅ 无缝的流式传输体验

## 📱 页面模块

### 1. 首页 (`/`)
**功能**: 平台概览和快速入口
- 模块导航卡片
- 功能特色展示
- 用户认证状态显示

### 2. 战略中心 (`/strategy`)
**功能**: 商业战略研究和市场分析
- **左侧面板**: 策略表单（核心赛道、营收目标、创始人故事）
- **右侧面板**: AI 生成的战略报告
- **特色**: 支持文件上传和 RAG 检索

### 3. 内容工场 (`/content-factory`)
**功能**: AI 内容创作和脚本生成
- **左侧面板**: 脚本表单（主题、平台、内容类型）
- **右侧面板**: 生成的脚本内容
- **流程**: Draft → Critic → Refiner 三阶段优化

### 4. 产品中心 (`/products`)
**功能**: 产品管理和展示
- 产品列表和详情
- 库存和价格管理
- 产品分类和标签

### 5. 模型管理 (`/model`)
**功能**: AI 模型配置和管理
- 模型参数调优
- 提示词管理
- 模型性能监控

### 6. 管理中心 (`/management`)
**功能**: 用户和系统管理
- 用户管理
- 系统设置
- 数据统计

## 🔐 认证系统

### Supabase Auth 集成

**认证流程**:
1. 用户注册/登录
2. Supabase 生成 JWT token
3. 前端存储 session
4. 页面级权限控制

**权限控制**:
- **匿名访问**: 战略中心（部分功能）
- **认证访问**: 内容工场、产品中心、模型管理
- **管理员**: 管理中心

**认证组件**:
- `AuthGuard` - 认证守卫组件
- `UserMenu` - 用户菜单
- `AuthContext` - 认证状态管理

## 🗄️ 数据库设计

### 核心表结构

```sql
-- 用户表
users (Supabase Auth)

-- 用户资料表
profiles (
  id UUID PRIMARY KEY,
  credits INTEGER DEFAULT 100,
  created_at TIMESTAMP
)

-- 任务表
tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  workflow_type VARCHAR,
  workflow_id VARCHAR,
  input_data JSONB,
  output_content TEXT,
  credits_used INTEGER,
  status VARCHAR,
  created_at TIMESTAMP
)

-- 资产表
assets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type VARCHAR,
  content TEXT,
  created_at TIMESTAMP
)
```

### 数据关系

- 用户 ↔ 任务 (1:N)
- 用户 ↔ 资产 (1:N)
- 任务 ↔ 资产 (N:M)

## 🚀 部署和配置

### 环境变量配置

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Dify API
DIFY_API_URL=https://api.dify.ai/v1
DIFY_STRATEGY_KEY=your-strategy-key
DIFY_CONTENT_KEY=your-content-key

# 工作流 ID
DIFY_WORKFLOW_STRATEGY_RESEARCH=workflow-strategy-id
DIFY_WORKFLOW_SCRIPT_DRAFT=workflow-script-id
```

### 部署步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd ai-business-growth-os
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 文件
   ```

4. **初始化数据库**
   ```bash
   # 在 Supabase Dashboard 中运行 schema.sql
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **生产部署**
   ```bash
   npm run build
   npm start
   ```

## 🎯 核心特性

### 1. 流式 AI 响应
- 实时显示 AI 生成过程
- 支持 Markdown 格式输出
- 优雅的加载状态和骨架屏

### 2. 文件上传和处理
- 支持 PDF、Word、TXT、MD 格式
- 自动文件类型检测
- 文件大小限制和错误处理

### 3. 响应式设计
- 移动端优先设计
- 自适应布局
- 暗色/亮色主题切换

### 4. 用户体验优化
- 无刷新表单提交
- 实时输入验证
- 友好的错误提示
- 平滑的页面过渡动画

## 🔧 开发指南

### 代码组织

```
src/
├── app/                    # Next.js App Router 页面
│   ├── strategy/          # 战略中心页面
│   ├── content-factory/   # 内容工场页面
│   └── auth/              # 认证相关页面
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── business/         # 业务逻辑组件
│   └── layout/           # 布局组件
├── lib/                  # 工具库
│   ├── supabase/         # Supabase 相关
│   └── dify/             # Dify API 客户端
├── hooks/                # React Hooks
├── actions/              # Server Actions
└── types/                # TypeScript 类型定义
```

### 开发最佳实践

1. **组件设计**
   - 组件只负责展示，不包含业务逻辑
   - 使用 props 接收数据，回调处理事件
   - 保持组件的可复用性

2. **状态管理**
   - 优先使用 useState
   - 避免过度封装
   - 页面级状态管理

3. **样式规范**
   - 使用 Tailwind CSS 类名
   - 遵循设计系统规范
   - 支持暗色主题

4. **错误处理**
   - 统一的错误边界
   - 友好的用户提示
   - 详细的开发日志

## 📊 监控和分析

### 性能监控
- 页面加载时间
- API 响应时间
- 用户交互响应

### 使用统计
- 模块使用频率
- 用户留存率
- 功能使用热力图

### 错误追踪
- 前端错误捕获
- API 错误日志
- 用户行为分析

## 🔮 未来规划

### 短期目标
- [ ] 多语言支持 (i18n)
- [ ] 高级数据分析仪表板
- [ ] 用户反馈系统
- [ ] 移动端优化

### 长期目标
- [ ] 插件系统
- [ ] 第三方集成
- [ ] 企业级功能
- [ ] AI 模型训练

## 🤝 贡献指南

### 开发环境设置
1. Fork 项目
2. 克隆到本地
3. 创建功能分支
4. 提交 PR

### 代码规范
- 使用 ESLint 和 Prettier
- 遵循 TypeScript 规范
- 编写单元测试
- 更新文档

---

## 📞 技术支持

如有问题，请参考：
- [ARCHITECTURE.md](ARCHITECTURE.md) - 架构设计文档
- [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) - 组件库文档
- [AUTH_SETUP.md](AUTH_SETUP.md) - 认证配置指南

**项目状态**: ✅ 生产就绪
**最后更新**: 2025年9月
