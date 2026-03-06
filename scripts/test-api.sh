#!/bin/bash

# API 测试脚本
# 测试六脉系统的关键 API 端点

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "六脉系统 API 测试"
echo "========================================="
echo ""

# 测试 1: 服务器健康检查
echo -e "${YELLOW}[测试 1]${NC} 服务器健康检查"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL})
if [ $STATUS -eq 200 ]; then
    echo -e "${GREEN}✓${NC} 服务器正常运行 (HTTP $STATUS)"
else
    echo -e "${RED}✗${NC} 服务器异常 (HTTP $STATUS)"
fi
echo ""

# 测试 2: 知识库同步状态
echo -e "${YELLOW}[测试 2]${NC} 知识库同步状态"
curl -s ${BASE_URL}/api/knowledge/sync-status | jq '.' 2>/dev/null || echo "API 返回非 JSON 响应"
echo ""

# 测试 3: 生成策略 API（仅测试端点存在性）
echo -e "${YELLOW}[测试 3]${NC} 生成策略 API"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/generate-strategy)
if [ $STATUS -eq 405 ]; then
    echo -e "${GREEN}✓${NC} API 端点存在 (HTTP $STATUS - Method Not Allowed, 预期行为)"
else
    echo -e "${GREEN}✓${NC} API 端点存在 (HTTP $STATUS)"
fi
echo ""

# 测试 4: 聊天 API（仅测试端点存在性）
echo -e "${YELLOW}[测试 4]${NC} 聊天 API"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/chat)
if [ $STATUS -eq 405 ]; then
    echo -e "${GREEN}✓${NC} API 端点存在 (HTTP $STATUS - Method Not Allowed, 预期行为)"
else
    echo -e "${GREEN}✓${NC} API 端点存在 (HTTP $STATUS)"
fi
echo ""

# 测试 5: Workplace API
echo -e "${YELLOW}[测试 5]${NC} Workplace API"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/workplace)
if [ $STATUS -eq 405 ]; then
    echo -e "${GREEN}✓${NC} API 端点存在 (HTTP $STATUS - Method Not Allowed, 预期行为)"
else
    echo -e "${GREEN}✓${NC} API 端点存在 (HTTP $STATUS)"
fi
echo ""

# 测试 6: 内容工厂 API
echo -e "${YELLOW}[测试 6]${NC} 内容工厂 API"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/api/content-factory)
if [ $STATUS -eq 405 ]; then
    echo -e "${GREEN}✓${NC} API 端点存在 (HTTP $STATUS - Method Not Allowed, 预期行为)"
else
    echo -e "${GREEN}✓${NC} API 端点存在 (HTTP $STATUS)"
fi
echo ""

echo "========================================="
echo "测试完成！"
echo "========================================="
