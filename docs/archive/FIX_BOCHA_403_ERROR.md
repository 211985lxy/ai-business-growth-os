# 修复 Bocha AI 403 错误指南

## 问题诊断

从服务器日志可以看到错误：
```
"error": "An error occurred in the seekerliu/bocha/bocha...
403 Client Error: for url: https://api.bochaai.com/v1/ai-search"
```

**原因：** Dify workflow 中的 "Bocha AI Search" 工具缺少有效的 API 密钥。

---

## 解决方案

### 方案 1：配置 Bocha AI API 密钥（推荐）

如果你需要使用 AI 搜索功能：

1. **获取 Bocha AI API 密钥**
   - 访问：https://bochaai.com/
   - 注册账号并获取 API 密钥

2. **在 Dify 中配置密钥**
   - 登录：https://cloud.dify.ai/
   - 进入你的「天道·战略」应用
   - 点击「编排」进入 Workflow 编辑器
   - 找到「Bocha AI Search」工具节点
   - 点击节点，在右侧配置面板中填入 API 密钥
   - 保存并发布

3. **验证**
   - 重新运行脚本检查：`bash scripts/check-api-keys.sh`
   - 在应用中重新测试战略生成功能

---

### 方案 2：移除 Bocha AI Search 节点（临时方案）

如果你不需要 AI 搜索功能，可以暂时移除这个节点：

1. **在 Dify Studio 中编辑 Workflow**
   ```
   Dify 控制台 → 天道·战略应用 → 编排
   ```

2. **删除或禁用节点**
   - 找到「Bocha AI Search」节点
   - 右键点击 → 删除（或禁用）
   - 调整 workflow 连接，确保流程完整
   - 保存并发布

3. **重新测试**
   - 刷新浏览器
   - 重新填写战略参数并生成

---

### 方案 3：使用 Dify 内置的搜索工具（替代方案）

Dify 提供了其他搜索工具，可能不需要额外的 API 密钥：

1. **在 Workflow 中替换工具**
   - 删除「Bocha AI Search」节点
   - 添加「DuckDuckGo Search」或「Google Search」节点
   - 配置相应的 API 密钥（如果需要）
   - 保存并发布

---

## 快速测试

运行检查脚本：
```bash
# 检查所有 API 密钥状态
bash scripts/check-api-keys.sh
```

预期输出：
```
✅ Bocha AI API 密钥有效
✅ Supabase 连接正常
✅ Dify API 密钥格式正确
```

---

## 常见问题

### Q: 为什么会出现 403 错误？
A: Bocha AI Search 是第三方工具，需要单独的 API 密钥。Dify workflow 调用这个工具时，如果没有密钥或密钥无效，就会返回 403。

### Q: 可以完全移除搜索功能吗？
A: 可以。如果你的战略生成流程不依赖实时搜索，可以直接移除这个节点。

### Q: 如何确认修复成功？
A: 重新测试战略生成功能，右侧应该能显示完整的战略报告内容，并且服务器日志中不再出现 403 错误。

---

## 相关文件

- API 检查脚本：`scripts/check-api-keys.sh`
- Dify 客户端：`lib/dify/client.ts`
- 战略 API 路由：`app/api/strategy/route.ts`
