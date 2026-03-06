# Dify 内容工厂工作流配置指南

## 📋 概述

本文档指导如何在 Dify 平台上配置**内容工厂**的 Chatflow 工作流，以支持战略上下文注入和 sub_type 中文映射。

---

## 🎯 配置目标

1. **战略上下文注入** - 从天道系统获取战略数据，确保内容创作符合品牌定位
2. **sub_type 中文映射** - 接收中文描述而非英文代码，提升 AI 生成精度
3. **流式输出** - 支持 SSE 流式响应，提供实时创作体验

---

## 📝 Dify 工作流配置步骤

### Step 1: 创建或打开 Chatflow

1. 登录 [Dify 平台](https://cloud.dify.ai/)
2. 创建新的 Chatflow 或打开现有的内容创作工作流
3. 确保工作流模式为 **Chatflow**（不是 Workflow）

### Step 2: 配置 Start 节点

在 **Start** 节点中添加以下变量：

| 变量名 | 变量类型 | 必填 | 说明 |
|---------|-----------|--------|------|
| `category` | 文本 | 是 | 内容类目（personal-story/business-showcase 等） |
| `sub_type` | 文本 | 是 | **具体方向**（如"创业故事（包含至暗时刻和反转）"） |
| `platform` | 文本 | 是 | 目标平台（xiaohongshu/douyin/wechat/shipinhao） |
| `identity` | 文本 | 是 | 用户身份（如"瑜伽教练"） |
| `brand_voice` | 段落 | 否 | 品牌调性（如"专业、真诚、温暖"） |
| `extra_context` | 段落 | 否 | 额外补充信息 |
| `strategy_context` | 段落 | **否** | **🔥 战略上下文（关键）** |

**重要提示**：
- `strategy_context` 必须设为**非必填**（Optional）
- 该变量类型建议使用 **段落（Paragraph）**，因为可能包含大量 JSON 文本

### Step 3: 配置 LLM 节点

在 LLM 节点中配置 **System Prompt**，添加战略对齐部分：

```markdown
# 你是爆款内容创作专家

## 你的任务
根据用户需求生成平台优化的爆款内容方案。

## 输入参数
- **内容类目**: {{#start.category#}}
- **具体方向**: {{#start.sub_type#}}
- **目标平台**: {{#start.platform#}}
- **身份**: {{#start.identity#}}
- **主题**: 用户在 query 中提供的主题
- **品牌调性**: {{#start.brand_voice#}}
- **额外补充**: {{#start.extra_context#}}

---

# 🎯 战略对齐 (Strategic Alignment)

以下是该用户的核心战略总纲（来自天道系统），你的所有创作**必须**基于此定位，不能偏离：

{{#start.strategy_context#}}

**重要**：
- 如果该上下文为空或只有 "暂无战略上下文"，则仅基于用户的【身份】和【主题】进行通用创作
- 如果有战略上下文，请确保：
  - 内容风格符合用户的品牌调性和价值观
  - 价值主张与战略定位一致
  - 强调用户的核心优势和独特性
  - 传达一致的信息和愿景

---

## 平台特性

### 小红书
- 标题：2-3个吸引眼球的标题
- 正文：1000-2000字，分段清晰
- 表情：适当使用，增强亲和力
- 标签：3-5个相关标签
- 图片建议：配图风格和数量

### 抖音
- 标题：1个爆款标题
- 脚本：45-60秒口语化脚本
- 分镜：3-5个分镜描述
- BGM：背景音乐风格建议
- 标签：3-5个相关话题标签

### 微信公众号
- 标题：3个优化标题（含悬念、数据、情感）
- 正文：1500-2500字
- 排版：Markdown 格式，分段明确
- 引导：关注、转发引导语

### 视频号
- 标题：2-3个吸引标题
- 脚本：3-8分钟视频脚本
- 分镜：5-8个分镜
- 画面：详细画面描述

## 输出格式

请生成 Markdown 格式的完整内容，包含：

1. **标题优化**（3个爆款标题）
2. **内容大纲**（结构化框架）
3. **完整内容/脚本**
4. **平台适配建议**（标签、配图、发布时间）
5. **创作建议**（优化技巧）

## 要求
1. 标题要有爆款潜质（引发好奇、提供价值、制造悬念）
2. 内容要符合平台调性和用户习惯
3. 提供具体的创作建议和优化技巧
4. 保持品牌调性一致性
5. 内容要有实用价值和传播性
6. **严格遵循战略上下文**（如果有的话）
```

### Step 4: 配置模型选择

建议使用以下模型：

| 模型 | 推荐理由 |
|------|-----------|
| GPT-4o | 推理能力强，适合内容创作 |
| Claude 3.5 Sonnet | 创意丰富，语言自然 |
| Qwen-Max | 中文理解优秀，成本低 |

### Step 5: 测试工作流

1. 点击 **预览** 按钮
2. 在 Start 节点中填入测试数据：

```json
{
  "category": "personal-story",
  "sub_type": "创业故事（包含至暗时刻和反转）",
  "platform": "xiaohongshu",
  "identity": "瑜伽教练",
  "brand_voice": "专业、真诚、温暖",
  "extra_context": "希望分享我的创业经历，特别是遇到的困难和如何克服的",
  "strategy_context": "{\n  \"niche\": \"瑜伽教练\",\n  \"revenue_goal\": \"月入10万\",\n  \"founder_story\": \"从0到1的创业历程\",\n  \"strengths\": [\"专业\", \"真诚\", \"温暖\"],\n  \"strategic_output\": \"专注于帮助初学者正确入门瑜伽\"\n}"
}
```

3. 输入主题：`"分享我的瑜伽创业故事"`
4. 点击 **运行**，观察输出是否符合预期

### Step 6: 获取 API Key

1. 进入工作流的 **访问 API** 页面
2. 复制 API Key
3. 将 API Key 添加到项目的 `.env.local` 文件：

```env
DIFY_CONTENT_KEY=app-xxxxxxxxxxxxx
```

---

## 🔍 sub_type 中文映射表

前端会自动将英文代码映射为中文描述，AI 接收到的是中文描述：

| 英文代码 | 中文描述 |
|---------|---------|
| 个人故事类 |
| `entrepreneurship` | 创业故事（包含至暗时刻和反转） |
| `personal-growth` | 个人成长（真实经历和感悟） |
| `success-story` | 成功案例（具体数据和成果） |
| 业务展示类 |
| `product-demo` | 产品演示（功能和价值） |
| `case-study` | 客户案例（问题和解决方案） |
| `behind-the-scenes` | 幕后故事（团队和过程） |
| 问题解决类 |
| `pain-point` | 痛点方案（问题分析和解决） |
| `how-to` | 实操教程（步骤和技巧） |
| `faq` | 常见问题（问答形式） |
| 观点分享类 |
| `industry-insight` | 行业洞察（趋势和观点） |
| `thought-leadership` | 思想领导（原创观点） |
| `debate` | 争议话题（多角度分析） |
| 主题系列类 |
| `knowledge-series` | 知识系列（系统化讲解） |
| `interview-series` | 采访系列（人物访谈） |
| `challenge-series` | 挑战系列（挑战过程） |

---

## 🔄 数据流向

```
前端 (app/content-factory/page.tsx)
  ↓
  1. 从 Supabase 获取战略上下文
  2. 用户填写表单（category, sub_type, platform 等）
  3. handleCreate 函数注入 strategy_summary
  ↓
后端 API (app/api/content-factory/route.ts)
  ↓
  1. 接收 strategy_summary
  2. 映射 sub_type 为中文描述
  3. 构造 inputs 发送给 Dify
  ↓
Dify Chatflow
  ↓
  1. 接收 strategy_context
  2. LLM 根据战略上下文生成内容
  3. 流式返回结果
  ↓
前端 (流式显示)
```

---

## ✅ 验证清单

- [ ] Start 节点添加了 `strategy_context` 变量（非必填）
- [ ] LLM 节点 System Prompt 中添加了战略对齐部分
- [ ] 测试时战略上下文正确注入到生成内容中
- [ ] 测试时无战略上下文时能正常降级
- [ ] API Key 已配置到 `.env.local`
- [ ] 前端能成功调用 API 并流式显示内容

---

## 🐛 常见问题

### Q1: 战略上下文没有生效怎么办？

**A**: 检查以下几点：
1. Start 节点的 `strategy_context` 变量是否正确添加
2. LLM Prompt 中是否使用了 `{{#start.strategy_context#}}`
3. 前端是否正确发送了 `strategy_summary` 参数
4. 查看浏览器控制台，确认战略上下文已加载

### Q2: 生成的内容不符合品牌调性？

**A**: 可能的原因：
1. 战略上下文中的 `founder_story` 或 `strategic_output` 不够详细
2. LLM Prompt 中的战略对齐部分不够强调
3. 建议在 Prompt 中增加更多约束条件

### Q3: sub_type 映射不生效？

**A**: 检查：
1. 后端 API 的 `SUB_TYPE_MAP` 是否包含对应的映射
2. Dify Start 节点是否正确接收了中文描述
3. 可以在 Dify Preview 中直接输入中文描述测试

### Q4: 流式输出中断或延迟？

**A**: 可能的原因：
1. Dify API 超时（默认 120 秒）
2. 网络连接不稳定
3. LLM 生成长度过长
4. 建议检查网络和调整 Prompt 长度

---

## 📚 相关文档

- [内容工厂架构文档](./CONTENT_FACTORY_REFACTORING.md)
- [Soul 注入实现文档](./SOUL_INJECTION_IMPLEMENTATION.md)
- [项目架构文档](./ARCHITECTURE.md)

---

**最后更新**: 2026-03-04
**维护者**: Cline AI Assistant
