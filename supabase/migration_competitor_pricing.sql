-- ==========================================
-- 竞品定价表
-- ==========================================
-- 用途：存储竞品定价历史数据
--       用于 Database 传感器查询和分析
--
-- 作者：六脉蜂群
-- 日期：2026年3月2日
-- ==========================================

-- 创建竞品定价表
CREATE TABLE IF NOT EXISTS competitor_pricing (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 竞品信息
  competitor_id VARCHAR(100) NOT NULL,
  competitor_name VARCHAR(255) NOT NULL,

  -- 产品信息
  product_name VARCHAR(255) NOT NULL,
  product_category VARCHAR(100),  -- 产品分类
  product_url TEXT,  -- 产品页面 URL

  -- 价格信息
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10, 2) CHECK (original_price >= 0),  -- 原价
  discount DECIMAL(5, 2) CHECK (discount BETWEEN 0 AND 100),  -- 折扣百分比

  -- 货币和其他
  currency VARCHAR(3) DEFAULT 'CNY',
  in_stock BOOLEAN DEFAULT true,

  -- 元数据
  data_source VARCHAR(100) DEFAULT 'manual',  -- 数据来源
  notes TEXT,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引（优化查询性能）
CREATE INDEX IF NOT EXISTS idx_competitor_pricing_competitor ON competitor_pricing(competitor_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_pricing_product ON competitor_pricing(product_name);
CREATE INDEX IF NOT EXISTS idx_competitor_pricing_updated ON competitor_pricing(updated_at DESC);

-- 添加唯一约束（防止重复数据）
CREATE UNIQUE INDEX IF NOT EXISTS idx_competitor_pricing_unique
ON competitor_pricing(competitor_id, product_name, updated_at)
WHERE updated_at = (
  SELECT MAX(updated_at)
  FROM competitor_pricing cp2
  WHERE cp2.competitor_id = competitor_pricing.competitor_id
    AND cp2.product_name = competitor_pricing.product_name
);

-- 添加注释
COMMENT ON TABLE competitor_pricing IS '竞品定价历史数据表';
COMMENT ON COLUMN competitor_pricing.competitor_id IS '竞品唯一标识';
COMMENT ON COLUMN competitor_pricing.competitor_name IS '竞品名称';
COMMENT ON COLUMN competitor_pricing.price IS '当前价格';
COMMENT ON COLUMN competitor_pricing.original_price IS '原价（用于计算折扣）';
COMMENT ON COLUMN competitor_pricing.discount IS '折扣百分比';

-- 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION update_competitor_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_competitor_pricing_updated_at
BEFORE UPDATE ON competitor_pricing
FOR EACH ROW
EXECUTE FUNCTION update_competitor_pricing_updated_at();

-- ==========================================
-- 示例数据（可选）
-- ==========================================

-- 插入一些示例数据用于测试
INSERT INTO competitor_pricing (
  competitor_id,
  competitor_name,
  product_name,
  product_category,
  price,
  original_price,
  discount,
  currency,
  data_source
)
VALUES
  (
    'competitor_001',
    '竞品A公司',
    'AI咨询基础套餐',
    '咨询服务',
    4999.00,
    5999.00,
    16.67,
    'CNY',
    'scrape'
  ),
  (
    'competitor_001',
    '竞品A公司',
    'AI咨询高级套餐',
    '咨询服务',
    9999.00,
    12999.00,
    23.08,
    'CNY',
    'scrape'
  ),
  (
    'competitor_002',
    '竞品B公司',
    '商业智能系统',
    'SaaS',
    19999.00,
    19999.00,
    0,
    'CNY',
    'manual'
  ),
  (
    'competitor_003',
    '竞品C公司',
    '企业战略咨询',
    '咨询服务',
    29999.00,
    35000.00,
    14.29,
    'CNY',
    'scrape'
  )
ON CONFLICT DO NOTHING;

-- ==========================================
-- 常用查询示例
-- ==========================================

-- 查询某个竞品的所有定价历史
-- SELECT * FROM competitor_pricing
-- WHERE competitor_id = 'competitor_001'
-- ORDER BY updated_at DESC;

-- 查询所有竞品的最新定价
-- SELECT DISTINCT ON (competitor_id, product_name)
--   competitor_id,
--   competitor_name,
--   product_name,
--   price,
--   original_price,
--   discount,
--   updated_at
-- FROM competitor_pricing
-- ORDER BY competitor_id, product_name, updated_at DESC;

-- 查询价格变化（30天内）
-- WITH latest_prices AS (
--   SELECT
--     competitor_id,
--     product_name,
--     price as current_price,
--     LAG(price) OVER (PARTITION BY competitor_id, product_name ORDER BY updated_at) as previous_price
--   FROM competitor_pricing
--   WHERE updated_at >= CURRENT_DATE - INTERVAL '30 days'
-- )
-- SELECT
--   competitor_id,
--   product_name,
--   current_price,
--   previous_price,
--   ((current_price - previous_price) / previous_price * 100) as price_change_percent
-- FROM latest_prices
-- WHERE previous_price IS NOT NULL
-- ORDER BY ABS(price_change_percent) DESC;

-- 查询平均价格（按产品分类）
-- SELECT
--   product_category,
--   AVG(price) as avg_price,
--   MIN(price) as min_price,
--   MAX(price) as max_price,
--   COUNT(*) as sample_count
-- FROM competitor_pricing
-- WHERE updated_at >= CURRENT_DATE - INTERVAL '90 days'
-- GROUP BY product_category
-- ORDER BY avg_price DESC;
