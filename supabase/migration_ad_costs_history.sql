-- ==========================================
-- 广告成本历史表
-- ==========================================
-- 用途：存储各平台广告成本历史数据
--       用于 Database 传感器查询和分析
--
-- 作者：六脉蜂群
-- 日期：2026年3月2日
-- ==========================================

-- 创建广告成本历史表
CREATE TABLE IF NOT EXISTS ad_costs_history (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 平台信息
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('小红书', '抖音', '公众号', '快手', 'B站')),

  -- 日期
  date DATE NOT NULL,

  -- 成本指标
  cpm DECIMAL(10, 2) NOT NULL CHECK (cpm > 0),  -- 千次展示成本
  cpc DECIMAL(10, 2) NOT NULL CHECK (cpc > 0),  -- 单次点击成本
  ctr DECIMAL(10, 5) NOT NULL CHECK (ctr BETWEEN 0 AND 1),  -- 点击率

  -- 流量数据
  impressions INTEGER NOT NULL CHECK (impressions >= 0),  -- 展示次数
  clicks INTEGER NOT NULL CHECK (clicks >= 0),  -- 点击次数

  -- 元数据
  data_source VARCHAR(100) DEFAULT 'manual',  -- 数据来源：api、manual、scrape
  notes TEXT,  -- 备注

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引（优化查询性能）
CREATE INDEX IF NOT EXISTS idx_ad_costs_platform_date ON ad_costs_history(platform, date DESC);
CREATE INDEX IF NOT EXISTS idx_ad_costs_date ON ad_costs_history(date DESC);

-- 添加注释
COMMENT ON TABLE ad_costs_history IS '广告成本历史数据表';
COMMENT ON COLUMN ad_costs_history.platform IS '广告平台：小红书、抖音、公众号等';
COMMENT ON COLUMN ad_costs_history.cpm IS '千次展示成本（Cost Per Mille）';
COMMENT ON COLUMN ad_costs_history.cpc IS '单次点击成本（Cost Per Click）';
COMMENT ON COLUMN ad_costs_history.ctr IS '点击率（Click Through Rate）';

-- 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION update_ad_costs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ad_costs_updated_at
BEFORE UPDATE ON ad_costs_history
FOR EACH ROW
EXECUTE FUNCTION update_ad_costs_updated_at();

-- ==========================================
-- 示例数据（可选）
-- ==========================================

-- 插入一些示例数据用于测试
INSERT INTO ad_costs_history (platform, date, cpm, cpc, ctr, impressions, clicks, data_source)
VALUES
  ('小红书', CURRENT_DATE - INTERVAL '1 day', 150.50, 2.30, 0.015, 10000, 150, 'api'),
  ('小红书', CURRENT_DATE - INTERVAL '2 days', 148.00, 2.25, 0.014, 12000, 168, 'api'),
  ('抖音', CURRENT_DATE - INTERVAL '1 day', 180.00, 3.50, 0.020, 15000, 300, 'api'),
  ('抖音', CURRENT_DATE - INTERVAL '2 days', 175.00, 3.40, 0.019, 14000, 266, 'api'),
  ('公众号', CURRENT_DATE - INTERVAL '1 day', 200.00, 5.00, 0.025, 8000, 200, 'api')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 常用查询示例
-- ==========================================

-- 查询最近 30 天的小红书广告成本
-- SELECT * FROM ad_costs_history
-- WHERE platform = '小红书'
--   AND date >= CURRENT_DATE - INTERVAL '30 days'
-- ORDER BY date DESC;

-- 计算平均 CPM 和 CPC
-- SELECT
--   platform,
--   AVG(cpm) as avg_cpm,
--   AVG(cpc) as avg_cpc,
--   AVG(ctr) as avg_ctr
-- FROM ad_costs_history
-- WHERE date >= CURRENT_DATE - INTERVAL '30 days'
-- GROUP BY platform;

-- 查询成本趋势（比较最近两周）
-- SELECT
--   platform,
--   AVG(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN cpm END) as recent_cpm,
--   AVG(CASE WHEN date < CURRENT_DATE - INTERVAL '7 days' AND date >= CURRENT_DATE - INTERVAL '14 days' THEN cpm END) as previous_cpm
-- FROM ad_costs_history
-- WHERE date >= CURRENT_DATE - INTERVAL '14 days'
-- GROUP BY platform;
