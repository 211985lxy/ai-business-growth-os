#!/bin/bash
#
# 六脉蜂群 - 数据库迁移执行脚本
#
# 用法：
#   1. 确保 SUPABASE_URL 和 SUPABASE_SERVICE_KEY 已设置
#   2. 运行：bash supabase/run-migrations.sh
#
# 或者手动在 Supabase SQL Editor 中执行：
#   - supabase/migration_ad_costs_history.sql
#   - supabase/migration_competitor_pricing.sql
#

set -e

echo "🚀 六脉蜂群 - 数据库迁移"
echo ""

# 检查环境变量
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ 错误：请设置 SUPABASE_URL 和 SUPABASE_SERVICE_KEY 环境变量"
  echo ""
  echo "示例："
  echo "  export SUPABASE_URL=https://your-project.supabase.co"
  echo "  export SUPABASE_SERVICE_KEY=your-service-key"
  echo ""
  echo "或者在 Supabase SQL Editor 中手动执行："
  echo "  1. supabase/migration_ad_costs_history.sql"
  echo "  2. supabase/migration_competitor_pricing.sql"
  exit 1
fi

# 迁移文件
MIGRATIONS=(
  "supabase/migration_ad_costs_history.sql"
  "supabase/migration_competitor_pricing.sql"
)

# 执行迁移
for migration in "${MIGRATIONS[@]}"; do
  if [ ! -f "$migration" ]; then
    echo "❌ 错误：迁移文件不存在：$migration"
    exit 1
  fi

  echo "📋 执行迁移：$migration"
  echo "─".repeat(50)

  # 读取 SQL 文件
  SQL=$(cat "$migration")

  # 发送到 Supabase
  RESPONSE=$(curl -X POST \
    "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_SERVICE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": $(echo "$SQL" | jq -Rs .)}" \
    -s -o /dev/null -w "%{http_code}")

  if [ "$RESPONSE" = "200" ]; then
    echo "✅ 成功"
  else
    echo "❌ 失败 (HTTP $RESPONSE)"
    echo ""
    echo "请手动在 Supabase SQL Editor 中执行此迁移："
    echo "  https://app.supabase.com/project/_/sql"
    exit 1
  fi

  echo ""
done

echo ""
echo "✅ 所有迁移执行完成！"
echo ""
echo "下一步："
echo "  1. 验证表已创建：在 Supabase Table Editor 中查看"
echo "  2. 测试传感器：npx tsx scripts/test-sensor-mock.ts"
