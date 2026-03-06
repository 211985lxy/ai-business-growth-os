# Soul Injection 灵魂注入功能实现总结

## 概述

本文档总结了"企业灵魂注入"功能的完整实现，包括数据库架构、核心组件和集成指南。

## 实现进度

### ✅ Phase 1: 数据库 Schema 扩展和基础设施

#### 1.1 数据库表设计

**knowledge_files 表** - 存储企业知识文件

- 文件基本信息（名称、类型、大小）
- Dify 集成（file_id, dataset_id）
- 六脉分类（meridian_type）
- 同步状态追踪（sync_status）
- 统计信息（page_count, word_count）

**knowledge_sync_log 表** - 记录知识库同步状态

- 同步进度追踪（total_files, indexed_files）
- 覆盖率计算（coverage_percentage）
- 错误日志（sync_error）

**ai_citations 表** - AI 输出引用溯源

- 引用编号（citation_number）
- 源文件信息（source_file_name, source_page）
- 上下文预览（source_text_preview, context_before, context_after）

#### 1.2 核心服务

**DifyService** (`lib/dify/knowledge-service.ts`)

- 文件上传到 Dify 知识库
- 创建和管理数据集
- 状态查询和更新
- 错误处理和重试机制

#### 1.3 API 端点

**POST /api/knowledge/upload**

- 处理文件上传
- 同步到 Dify
- 更新数据库状态
- 返回上传进度

### ✅ Phase 3: 中栏 - 注入感提示

#### 3.1 SoulInjectionBar 组件

**位置**: `components/soul/SoulInjectionBar.tsx`

**功能**:

- 显示核心资产状态（CORE ASSETS）
- 知识库覆盖率进度条
- 激活文档数量统计
- 动态脉冲动画（激活时）

**Props**:

```typescript
{
  companyName?: string;        // 企业名称
  activeFileCount?: number;   // 激活文档数
  totalFileCount?: number;    // 总文档数
  version?: string;          // 版本号
  className?: string;
}
```

#### 3.2 MeridianSelector 组件

**位置**: `components/soul/MeridianSelector.tsx`

**功能**:

- 六脉选择器（天地人神财法）
- 单选/多选切换
- 视觉反馈（选中标记）
- 全选/取消全选

**Props**:

```typescript
{
  selectedMeridians?: string[];  // 选中的脉络类型
  onChange?: (meridians: string[]) => void;
  className?: string;
}
```

#### 3.3 KnowledgeRetrievalIndicator 组件

**位置**: `components/soul/KnowledgeRetrievalIndicator.tsx`

**功能**:

- 知识库检索状态指示
- 脉冲动画效果
- 检索完成提示

**Props**:

```typescript
{
  isRetrieving?: boolean;  // 是否正在检索
  className?: string;
}
```

### ✅ Phase 4: 右栏 - 溯源与证据系统

#### 4.1 CitationBadge 组件

**位置**: `components/soul/CitationBadge.tsx`

**功能**:

- 脚注引用标记 [1], [2]
- 可点击显示详情
- Hover 效果

**Props**:

```typescript
{
  number: number;           // 引用编号
  onClick?: () => void;   // 点击回调
  className?: string;
}
```

#### 4.2 CitationCard 组件

**位置**: `components/soul/CitationCard.tsx`

**功能**:

- 详细引用信息展示
- 文件名和页码
- 内容预览
- 置信度评分
- 匹配度进度条

**Props**:

```typescript
{
  number: number;              // 引用编号
  fileName?: string;          // 文件名
  page?: number;              // 页码
  content?: string;           // 内容预览
  confidence?: number;         // 置信度 (0-1)
  isOpen?: boolean;           // 是否展开
  onClose?: () => void;      // 关闭回调
  className?: string;
}
```

#### 4.3 SoulConsistencyScore 组件

**位置**: `components/soul/SoulConsistencyScore.tsx`

**功能**:

- AI 建议与 SOP 契合度评分
- 颜色编码（绿/蓝/黄/红）
- 进度条可视化
- 图标反馈

**Props**:

```typescript
{
  score?: number;      // 一致性评分 (0-100)
  className?: string;
  showLabel?: boolean; // 显示标签
}
```

### ✅ Phase 5: 核心交互 - 灵魂快照可视化

#### 5.1 SoulMap 组件

**位置**: `components/soul/SoulMap.tsx`

**功能**:

- 使用 Mermaid 生成交互式图谱
- 中心节点显示企业概况
- 六脉分布可视化
- 统计信息展示
- 导出 SVG 功能

**Props**:

```typescript
{
  companyName?: string;            // 企业名称
  meridianData: MeridianData[];  // 脉络数据
  className?: string;
}

interface MeridianData {
  type: "tian" | "di" | "ren" | "shen" | "cai" | "fa";
  name: string;
  fileCount: number;
  wordCount: number;
  percentage: number;
}
```

## 集成指南

### 1. 在 /strategy 页面集成

```tsx
import { SoulInjectionBar, MeridianSelector, KnowledgeRetrievalIndicator } from "@/components/soul";

export default function StrategyPage() {
  const [selectedMeridians, setSelectedMeridians] = useState<string[]>([]);
  const [isRetrieving, setIsRetrieving] = useState(false);

  return (
    <div className="flex h-screen">
      {/* 左栏 */}
      <Sidebar />

      {/* 中栏 */}
      <div className="flex-1 flex flex-col">
        {/* 灵魂注入状态栏 */}
        <SoulInjectionBar
          companyName="您的企业"
          activeFileCount={12}
          totalFileCount={42}
          version="v2.1"
        />

        {/* 脉络选择器 */}
        <div className="p-4 border-b border-gray-800">
          <MeridianSelector selectedMeridians={selectedMeridians} onChange={setSelectedMeridians} />
        </div>

        {/* 输入区域 */}
        <Textarea onFocus={() => setIsRetrieving(true)} onBlur={() => setIsRetrieving(false)} />

        {/* 检索指示器 */}
        {isRetrieving && <KnowledgeRetrievalIndicator isRetrieving />}
      </div>

      {/* 右栏 */}
      <OutputPanel />
    </div>
  );
}
```

### 2. 在 StreamingOutputCanvas 集成

```tsx
import { CitationBadge, CitationCard, SoulConsistencyScore } from "@/components/soul";

export function StreamingOutputCanvas({ output, citations }: Props) {
  const [activeCitation, setActiveCitation] = useState<number | null>(null);

  return (
    <div>
      {/* 灵魂一致性评分 */}
      <div className="mb-4">
        <SoulConsistencyScore score={output.consistencyScore} />
      </div>

      {/* 输出内容 + 引用 */}
      <div className="prose">
        {output.paragraphs.map((para, idx) => (
          <p key={idx}>
            {para.text}
            {para.citations.map((citNum) => (
              <CitationBadge
                key={citNum}
                number={citNum}
                onClick={() => setActiveCitation(citNum)}
              />
            ))}
          </p>
        ))}
      </div>

      {/* 引用卡片 */}
      <div className="relative mt-4">
        {citations.map((citation) => (
          <CitationCard
            key={citation.number}
            {...citation}
            isOpen={activeCitation === citation.number}
            onClose={() => setActiveCitation(null)}
          />
        ))}
      </div>
    </div>
  );
}
```

### 3. 在知识库页面集成 SoulMap

```tsx
import { SoulMap } from "@/components/soul";

export function KnowledgePage() {
  const [meridianData, setMeridianData] = useState<MeridianData[]>([]);

  useEffect(() => {
    // 从数据库加载脉络数据
    loadMeridianData();
  }, []);

  return (
    <div>
      <SoulMap companyName="您的企业" meridianData={meridianData} />
    </div>
  );
}
```

## 数据库迁移

运行以下命令创建新表：

```bash
# 创建 knowledge_files 表
psql -U postgres -d your_database -f supabase/migration_knowledge_files.sql

# 创建 knowledge_sync_log 表
psql -U postgres -d your_database -f supabase/migration_knowledge_sync.sql

# 创建 ai_citations 表
psql -U postgres -d your_database -f supabase/migration_ai_citations.sql
```

## 环境变量

在 `.env.local` 中添加：

```env
# Dify API 配置
DIFY_API_URL=https://your-dify-instance.com/v1
DIFY_API_KEY=your-api-key
DIFY_DATASET_ID=your-dataset-id
```

## API 使用示例

### 上传文件到知识库

```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("meridian_type", "shen"); // 神韵·内容

const response = await fetch("/api/knowledge/upload", {
  method: "POST",
  body: formData,
});

const result = await response.json();
// {
//   success: true,
//   fileId: "xxx",
//   syncStatus: "indexing",
//   difyFileId: "yyy"
// }
```

### 查询知识库同步状态

```typescript
const response = await fetch("/api/knowledge/sync-status");
const data = await response.json();
// {
//   totalFiles: 42,
//   indexedFiles: 40,
//   coveragePercentage: 95,
//   syncStatus: "synced"
// }
```

## 设计理念

### 1. 安全感

- **私有知识库**: 用户看到自己的文档被安全存储
- **同步状态**: 实时显示索引进度
- **来源溯源**: 每个 AI 建议都有明确的来源

### 2. 专业感

- **引用系统**: 消除 AI 幻觉担忧
- **一致性评分**: 量化 AI 建议的可信度
- **脉络分类**: 精准的方法论对齐

### 3. 资产感

- **灵魂状态条**: 诱导用户上传更多 SOP
- **知识图谱**: 可视化企业大脑的强项和弱项
- **迁移成本**: 用户上传越多，产品护城越深

## 下一步工作

### ⏳ Phase 2: 左栏 - 灵魂仓库（完整版）

- [ ] 文件树状视图
- [ ] 文件拖拽上传
- [ ] 文件删除和编辑
- [ ] 同步状态实时更新

### ⏳ Phase 6: 页面集成与优化

- [ ] 集成到 /strategy 页面
- [ ] 集成到 StreamingOutputCanvas
- [ ] 性能优化（懒加载、虚拟滚动）
- [ ] 响应式设计适配
- [ ] 浏览器兼容性测试

## 技术栈

- **前端**: React 18, TypeScript, Tailwind CSS v4
- **可视化**: Mermaid.js
- **数据库**: PostgreSQL (Supabase)
- **文件存储**: Dify Knowledge Base
- **API**: Next.js 16 App Router

## 文件清单

```
components/soul/
├── SoulInjectionBar.tsx      # 灵魂注入状态栏
├── MeridianSelector.tsx       # 六脉选择器
├── KnowledgeRetrievalIndicator.tsx  # 检索指示器
├── CitationBadge.tsx          # 引用徽章
├── CitationCard.tsx           # 引用卡片
├── SoulConsistencyScore.tsx    # 一致性评分
├── SoulMap.tsx               # 灵魂快照图谱
└── index.ts                  # 组件导出

lib/dify/
└── knowledge-service.ts        # Dify 知识库服务

app/api/knowledge/
└── upload/route.ts            # 文件上传 API

supabase/migrations/
├── migration_knowledge_files.sql
├── migration_knowledge_sync.sql
└── migration_ai_citations.sql

types/database.ts              # 数据库类型定义
```

## 营销文案建议

上线后的首页文案：

> "不只是通用的 AI，而是将你企业的灵魂，注入麦肯锡的骨架。"

产品价值主张：

1. **安全感**: 你的企业知识，你的私有大脑
2. **专业感**: 每个建议都有据可查
3. **资产感**: 你的智慧越积累越有价值

## 联系与支持

如有问题，请查看：

- 架构文档: `ARCHITECTURE.md`
- 六脉定义: `docs/地利·六脉定义.md`
- 交互设计: `docs/神韵·交互设计.md`
