# 🔐 Authentication Setup Guide

## 问题：登录凭证无效

如果遇到"登录凭证无效"错误，请按以下步骤排查：

---

## ✅ 解决方案

### **步骤 1: 禁用 Email 确认（推荐用于开发）**

这是最常见的原因。Supabase 默认启用 email 确认。

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 左侧菜单：**Authentication** → **Providers**
4. 点击 **Email** 提供商
5. 找到 **"Confirm email"** 设置
6. **关闭**该开关
7. 点击 **Save** 保存

### **步骤 2: 重新注册账户**

Email 确认禁用后：

1. 访问 http://localhost:3000/auth/login
2. 点击 **"Don't have an account? Sign up"**
3. 输入任意邮箱和密码（密码至少6位）
4. 点击 **"Create Account"**
5. 应该显示 "✅ Account created successfully!"
6. 自动跳转到首页

### **步骤 3: 使用新账户登录**

1. 在登录页面输入刚才创建的邮箱和密码
2. 点击 **"Sign In"**
3. 成功登录后右上角会显示您的邮箱

---

## 🔧 诊断工具

如果仍有问题，运行诊断工具：

**访问**: http://localhost:3000/auth/debug

诊断工具会检查：

- ✅ 环境变量配置
- ✅ Supabase 连接
- ✅ Email 确认设置
- ✅ 数据库 schema
- ✅ 测试注册流程

---

## 📝 常见错误及解决方案

### 错误 1: "Invalid login credentials"

**原因**: 邮箱或密码错误，或账户未创建成功

**解决**:

- 重新注册账户
- 确保密码至少 6 个字符
- 检查是否有 email 确认邮件

### 错误 2: "Email not confirmed"

**原因**: Supabase 启用了 email 确认

**解决**:

- 在 Supabase Dashboard 中禁用 email 确认（见步骤 1）
- 或检查邮箱找到确认链接

### 错误 3: "Missing environment variables"

**原因**: .env.local 文件缺失或配置错误

**解决**:

```bash
# 检查 .env.local 文件存在
cat .env.local

# 应该包含:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 错误 4: "Database schema missing"

**原因**: 数据库表未创建

**解决**:

1. 打开 Supabase Dashboard → SQL Editor
2. 复制 `supabase/schema.sql` 的内容
3. 粘贴到 SQL Editor
4. 点击 Run
5. 重新注册账户

---

## 🚀 快速测试

### 测试账户

注册时可以使用：

```
Email: test@example.com
Password: test123456
```

### 验证登录成功

登录后应该看到：

- ✅ 右上角显示您的邮箱
- ✅ 有 "Sign Out" 按钮
- ✅ 可以访问所有页面

---

## 🆘 仍需要帮助？

运行诊断工具查看详细信息：

```bash
npm run dev
# 访问 http://localhost:3000/auth/debug
```

查看浏览器控制台（F12）获取详细错误信息。

---

## 📌 重要提示

- ⚠️ **开发环境**建议禁用 email 确认
- ⚠️ **生产环境**应该启用 email 确认
- ⚠️ 每次注册会创建新的用户和 profile
- ⚠️ Seed 脚本创建的数据与测试用户无关
