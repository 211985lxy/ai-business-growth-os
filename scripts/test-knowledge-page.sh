#!/bin/bash

# Soul Injection 功能测试脚本

echo "🚀 开始测试 Soul Injection 功能..."
echo ""

# 检查开发服务器是否运行
echo "📡 检查开发服务器状态..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 开发服务器运行正常"
else
    echo "❌ 开发服务器未运行，请先运行: npm run dev"
    exit 1
fi

echo ""
echo "📋 测试项目:"
echo ""

# 测试 1: 主页
echo "1. 测试主页 (http://localhost:3000)"
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ 主页加载成功"
else
    echo "   ❌ 主页加载失败"
fi

# 测试 2: 战略页面
echo ""
echo "2. 测试战略页面 (http://localhost:3000/strategy)"
if curl -s http://localhost:3000/strategy > /dev/null; then
    echo "   ✅ 战略页面加载成功"
else
    echo "   ❌ 战略页面加载失败"
fi

# 测试 3: 知识库页面
echo ""
echo "3. 测试知识库页面 (http://localhost:3000/knowledge)"
if curl -s http://localhost:3000/knowledge > /dev/null; then
    echo "   ✅ 知识库页面加载成功"
else
    echo "   ❌ 知识库页面加载失败"
fi

# 测试 4: API - 同步状态查询
echo ""
echo "4. 测试 API - 同步状态查询"
RESPONSE=$(curl -s "http://localhost:3000/api/knowledge/sync-status?user_id=test")
if [ -n "$RESPONSE" ]; then
    echo "   ✅ API 响应成功"
    echo "   响应内容: $RESPONSE"
else
    echo "   ❌ API 无响应"
fi

echo ""
echo "✅ 基础测试完成！"
echo ""
echo "📝 下一步建议:"
echo "   1. 在浏览器中访问: http://localhost:3000/knowledge"
echo "   2. 查看 Soul Map 图谱是否正常显示"
echo "   3. 尝试上传一个测试文件"
echo "   4. 查看完整的测试清单: docs/SOUL_INJECTION_TEST_GUIDE.md"
echo ""
echo "🎉 测试愉快！"
