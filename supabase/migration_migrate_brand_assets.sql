-- ============================================================================
-- Migration: Brand Assets → Knowledge Files
-- ============================================================================
-- 将现有的 brand_assets 数据迁移到 knowledge_files 表
-- 保持"单一事实来源"原则

-- 步骤 1: 迁移数据
INSERT INTO public.knowledge_files (
    id,
    user_id,
    file_name,
    file_type,
    file_size,
    dify_file_id,
    meridian_type,
    page_count,
    word_count,
    sync_status,
    synced_at,
    created_at,
    updated_at
)
SELECT
    ba.id,
    ba.user_id,
    ba.name as file_name,
    CASE ba.asset_type
        WHEN 'persona' THEN 'markdown'
        WHEN 'product_selling_points' THEN 'markdown'
        WHEN 'target_audience' THEN 'markdown'
        WHEN 'writing_style' THEN 'markdown'
        ELSE 'text'
    END as file_type,
    1000 as file_size, -- 估算值
    'migrated_' || ba.id::TEXT as dify_file_id,
    CASE ba.asset_type
        WHEN 'persona' THEN 'ren' -- 人和·模式
        WHEN 'product_selling_points' THEN 'di' -- 地利·产品
        WHEN 'target_audience' THEN 'ren' -- 人和·模式
        WHEN 'writing_style' THEN 'shen' -- 神韵·内容
    END as meridian_type,
    NULL as page_count,
    1000 as word_count, -- 估算值
    'synced' as sync_status,
    NOW() as synced_at,
    ba.created_at,
    NOW() as updated_at
FROM public.brand_assets ba
WHERE ba.is_active = true
ON CONFLICT (id) DO NOTHING;

-- 步骤 2: 创建同步日志记录
INSERT INTO public.knowledge_sync_log (
    user_id,
    sync_status,
    total_files,
    indexed_files,
    failed_files,
    coverage_percentage,
    last_sync_at
)
SELECT
    ba.user_id,
    'completed' as sync_status,
    COUNT(*) as total_files,
    COUNT(*) as indexed_files,
    0 as failed_files,
    75 as coverage_percentage, -- 默认 75% 覆盖度
    NOW() as last_sync_at
FROM public.brand_assets ba
WHERE ba.is_active = true
GROUP BY ba.user_id
ON CONFLICT DO NOTHING;

-- 步骤 3: 记录迁移信息（可选）
-- 可以创建一个迁移日志表来记录这次迁移

-- ============================================================================
-- 验证迁移结果
-- ============================================================================

-- 查询迁移后的知识文件
SELECT
    kf.id,
    kf.file_name,
    kf.meridian_type,
    kf.sync_status,
    kf.created_at
FROM public.knowledge_files kf
WHERE kf.dify_file_id LIKE 'migrated_%'
ORDER BY kf.created_at DESC;

-- 查询同步日志
SELECT
    ksl.user_id,
    ksl.sync_status,
    ksl.total_files,
    ksl.coverage_percentage,
    ksl.last_sync_at
FROM public.knowledge_sync_log ksl
ORDER BY ksl.last_sync_at DESC;

-- ============================================================================
-- 注意事项
-- ============================================================================
-- 1. 迁移后，旧的 brand_assets 表仍然存在，但建议逐步弃用
-- 2. 新的知识文件以 'migrated_' 前缀标识
-- 3. 同步状态设为 'synced'，表示这些文件已迁移完成
-- 4. 覆盖度设为默认值 75%，后续可以根据实际情况调整
-- 5. 建议在生产环境执行前先在测试环境验证
