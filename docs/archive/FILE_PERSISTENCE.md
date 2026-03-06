# 文件持久化功能使用文档

## 概述

当 Dify 智能体返回包含文件 URL（如图片、PDF 文档）的内容时，系统会自动将这些临时 URL 转换为 Supabase Storage 的永久链接，确保文件的长期可用性。

## 功能特性

### 1. 自动检测文件 URL

系统会自动识别以下格式的文件 URL：

- **HTTP/HTTPS URL**: `https://example.com/file.jpg`
- **Markdown 图片**: `![alt](https://example.com/image.png)`
- **HTML 标签**: `<img src="https://example.com/file.jpg">`
- **Dify 文件格式**: `[file:https://example.com/document.pdf]`

### 2. 支持的文件类型

- **图片**: JPEG, PNG, GIF, WebP, SVG
- **文档**: PDF, TXT, Markdown
- **最大文件大小**: 10MB

### 3. 异步处理

- 文件下载和上传过程完全异步
- 不阻塞流式文字输出
- 确保用户实时看到生成的内容

### 4. 用户隔离

- 每个用户的文件存储在独立的文件夹中
- 文件路径格式: `{userId}/{agentType}/{timestamp}_{random}_{filename}`
- 用户只能访问自己的文件

## 使用方式

### 对于开发者

#### 1. 运行数据库迁移

首先在 Supabase SQL Editor 中运行以下迁移脚本：

```sql
-- 创建 asset_files 表和相关函数
-- 文件：supabase/migration_asset_files.sql
```

#### 2. 确保 Supabase Storage 已配置

在 Supabase 后台创建 `assets` 存储桶：

1. 进入 Supabase 项目
2. 点击 "Storage" → "New bucket"
3. 输入存储桶名称: `assets`
4. 设置为 Public（公共访问）
5. 配置 CORS 规则：
   - 允许的来源: `*` 或你的域名
   - 允许的方法: `GET`, `POST`, `PUT`, `DELETE`

#### 3. 在 API 路由中启用

文件持久化功能已集成在 `app/api/workplace/route.ts` 中，无需额外配置。

### 对于用户

#### 1. 正常使用

当智能体生成包含文件的内容时，系统会自动：

1. 识别内容中的文件 URL
2. 从 Dify 临时服务器下载文件
3. 上传到 Supabase Storage
4. 替换内容中的 URL 为永久链接

#### 2. 查看我的资产文件

```tsx
import { getUserAssets } from "@/lib/supabase/storage";

async function MyAssets() {
  const assets = await getUserAssets(userId, "content");

  return (
    <div>
      <h2>我的资产文件</h2>
      {assets.map(asset => (
        <div key={asset.id}>
          <a href={asset.permanent_url} download={asset.file_name}>
            {asset.file_name}
          </a>
          <span>{formatFileSize(asset.file_size)}</span>
          <span>{new Date(asset.created_at).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
}
```

#### 3. 删除资产文件

```tsx
import { deleteAssetFile } from "@/lib/supabase/storage";

async function handleDelete(assetId: string) {
  const success = await deleteAssetFile(assetId, userId);

  if (success) {
    console.log("文件删除成功");
    // 重新加载资产列表
  } else {
    console.error("文件删除失败");
  }
}
```

## API 使用示例

### Workplace API 自动文件持久化

```tsx
// 调用任何智能体时，文件会自动持久化
const { startStreaming } = useApiStreaming();

async function handleGenerate() {
  await startStreaming("/api/workplace", {
    agentType: "content",
    query: "生成带图片的小红书脚本",
    inputs: {
      content_type: "video_script_with_images",
    },
  });

  // 如果 Dify 返回了图片 URL，系统会自动：
  // 1. 下载图片
  // 2. 上传到 Supabase Storage
  // 3. 替换内容中的 URL
  // 4. 保存到 asset_files 表
}
```

## 工作流程图

```
Dify 返回内容
    ↓
检测文件 URL
    ↓
下载临时文件
    ↓
上传到 Supabase Storage
    ↓
替换内容中的 URL
    ↓
保存到 asset_files 表
    ↓
用户看到永久链接的内容
```

## 数据库结构

### asset_files 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID |
| file_name | TEXT | 文件名 |
| file_type | TEXT | 文件类型 |
| file_size | INTEGER | 文件大小（字节） |
| storage_path | TEXT | Supabase Storage 路径 |
| original_url | TEXT | Dify 临时 URL |
| permanent_url | TEXT | Supabase 永久 URL |
| agent_type | TEXT | 智能体类型 |
| related_content_id | UUID | 关联内容 ID |
| created_at | TIMESTAMPTZ | 创建时间 |

## 错误处理

### 下载失败

如果 Dify 临时 URL 已过期或无法访问，系统会：
- 记录错误日志
- 保留原始 URL 在内容中
- 不影响其他文件的处理

### 上传失败

如果 Supabase Storage 上传失败，系统会：
- 记录错误日志
- 保留原始 URL 在内容中
- 不影响流式文字的显示

### 文件过大

如果文件超过 10MB 限制，系统会：
- 跳过该文件
- 记录警告日志
- 保留原始 URL 在内容中

## 监控日志

所有文件持久化操作都会输出日志：

```
[Storage] Scanning content for file URLs...
[Storage] Found 3 file URLs
[Storage] Starting file download: https://dify.xxx.com/file.jpg
[Storage] File persisted successfully: https://xxx.supabase.co/storage/...
[Storage] Persisted 3/3 files
```

## 安全考虑

1. **用户隔离**: 所有文件都存储在用户的独立文件夹中
2. **访问控制**: 通过 RLS 策略确保用户只能访问自己的文件
3. **URL 签名**: Supabase Storage 使用签名 URL，防止未授权访问
4. **临时 URL 清理**: 定期清理 Supabase Storage 中的过期文件

## 注意事项

1. **存储成本**: Supabase Storage 按 GB 收费，建议设置文件大小和数量限制
2. **清理策略**: 建议定期清理用户删除的文件，释放存储空间
3. **CDN 缓存**: Supabase Storage 集成了 CDN，文件访问速度更快
4. **并发限制**: 大量文件同时处理时，可能会受到 API 速率限制

## 故障排除

### 问题：文件没有持久化

**检查步骤**：
1. 查看浏览器控制台是否有错误日志
2. 检查 Supabase Storage 是否已创建
3. 检查存储桶权限是否正确配置
4. 查看 Server 日志确认文件 URL 是否被检测到

### 问题：文件显示 404

**可能原因**：
1. Supabase Storage 未配置为 Public
2. 文件未成功上传到 Storage
3. 存储路径错误

**解决方案**：
1. 检查 Supabase Storage 配置
2. 查看数据库 asset_files 表确认文件记录
3. 测试 permanent_url 是否可访问

### 问题：流式输出很慢

**可能原因**：
1. 文件太大导致下载时间长
2. 网络带宽限制

**解决方案**：
1. 设置文件大小限制（已实现：10MB）
2. 异步处理文件，不阻塞文字输出（已实现）
3. 添加文件数量限制（待实现）

## 未来改进

- [ ] 支持更多文件类型（视频、音频等）
- [ ] 实现文件预览功能
- [ ] 添加文件批量删除功能
- [ ] 实现文件分享功能
- [ ] 添加文件使用统计
- [ ] 实现自动清理过期文件
