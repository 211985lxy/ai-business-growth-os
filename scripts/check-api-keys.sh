#!/bin/bash

# AI Growth OS API 密钥检查脚本
# 检查所有第三方服务的 API 密钥是否有效

echo "🔍 正在检查 AI Growth OS 核心组件..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查 Bocha AI
echo "📡 1. 检查 Bocha AI..."
if [ -z "$BOCHA_KEY" ]; then
    echo -e "${RED}❌ BOCHA_KEY 环境变量未设置${NC}"
    echo -e "${YELLOW}💡 解决方案：${NC}"
    echo "   a) 在 Dify 控制台中配置 Bocha AI API 密钥"
    echo "   b) 或者从 workflow 中移除 Bocha AI Search 节点"
else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -I https://api.bochaai.com/v1/ai-search -H "Authorization: Bearer $BOCHA_KEY")
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        echo -e "${RED}❌ Bocha AI API 密钥无效 (HTTP $HTTP_CODE)${NC}"
        echo -e "${YELLOW}💡 解决方案：${NC}"
        echo "   1. 访问 https://bochaai.com/ 获取 API 密钥"
        echo "   2. 在 Dify → 设置 → 工具配置 → Bocha AI 中配置密钥"
    elif [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Bocha AI API 密钥有效${NC}"
    else
        echo -e "${YELLOW}⚠️  Bocha AI 返回 HTTP $HTTP_CODE${NC}"
    fi
fi
echo ""

# 2. 检查 Supabase
echo "🗄️  2. 检查 Supabase..."
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ Supabase 环境变量未设置${NC}"
else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/health")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Supabase 连接正常${NC}"
    else
        echo -e "${YELLOW}⚠️  Supabase 返回 HTTP $HTTP_CODE${NC}"
    fi
fi
echo ""

# 3. 检查 Dify API
echo "🤖 3. 检查 Dify API..."
if [ -z "$DIFY_API_KEY" ]; then
    echo -e "${RED}❌ DIFY_API_KEY 环境变量未设置${NC}"
else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://api.dify.ai/v1" -H "Authorization: Bearer $DIFY_API_KEY")
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        echo -e "${RED}❌ Dify API 密钥无效 (HTTP $HTTP_CODE)${NC}"
    elif [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        echo -e "${GREEN}✅ Dify API 密钥格式正确${NC}"
    else
        echo -e "${YELLOW}⚠️  Dify API 返回 HTTP $HTTP_CODE${NC}"
    fi
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}🔧 快速修复 Bocha AI 403 错误：${NC}"
echo ""
echo "方案 1：配置 Bocha AI API 密钥（推荐）"
echo "  1. 访问 https://bochaai.com/ 注册并获取 API 密钥"
echo "  2. 登录 Dify 控制台: https://cloud.dify.ai/"
echo "  3. 进入 → 设置 → 工具 → Bocha AI Search"
echo "  4. 填入你的 Bocha AI API 密钥"
echo "  5. 保存并重新测试"
echo ""
echo "方案 2：移除 Bocha AI Search 节点（临时方案）"
echo "  1. 在 Dify Studio 中打开你的 workflow"
echo "  2. 找到 'Bocha AI Search' 节点"
echo "  3. 删除或禁用该节点"
echo "  4. 保存并发布 workflow"
echo ""
