/**
 * Database 传感器
 *
 * 查询本地数据库（Supabase）中的历史数据
 *
 * @module openclaw/sensors/db-sensor
 */

import { createClient } from "@/lib/supabase/server";

export interface AdCostRecord {
  id: string;
  platform: string;
  date: string;
  cpm: number;
  cpc: number;
  ctr: number;
  impressions: number;
  clicks: number;
  created_at: string;
}

export interface CompetitorPricingRecord {
  id: string;
  competitor_id: string;
  competitor_name: string;
  product_name: string;
  price: number;
  original_price?: number;
  discount?: number;
  currency: string;
  updated_at: string;
}

export class DatabaseSensor {
  /**
   * 查询广告成本历史数据
   *
   * @param platform - 平台名称（如：小红书、抖音、公众号）
   * @param days - 查询天数
   * @returns Promise<AdCostRecord[]>
   */
  async queryAdCost(platform: string, days: number = 30): Promise<AdCostRecord[]> {
    console.log(`[DatabaseSensor] Querying ad costs for ${platform} (${days} days)`);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ad_costs_history")
      .select("*")
      .eq("platform", platform)
      .gte("date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order("date", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[DatabaseSensor] Ad cost query failed:", error);
      throw error;
    }

    console.log(`[DatabaseSensor] Retrieved ${data?.length || 0} ad cost records`);

    return (data as AdCostRecord[]) || [];
  }

  /**
   * 获取广告成本统计（聚合数据）
   *
   * @param platform - 平台名称
   * @param days - 查询天数
   * @returns Promise<统计数据>
   */
  async getAdCostStats(
    platform: string,
    days: number = 30
  ): Promise<{
    avg_cpm: number;
    avg_cpc: number;
    avg_ctr: number;
    min_cpm: number;
    max_cpm: number;
    trend: "up" | "down" | "stable";
    data_points: number;
  }> {
    const records = await this.queryAdCost(platform, days);

    if (records.length === 0) {
      return {
        avg_cpm: 0,
        avg_cpc: 0,
        avg_ctr: 0,
        min_cpm: 0,
        max_cpm: 0,
        trend: "stable",
        data_points: 0,
      };
    }

    const avgCpm = records.reduce((sum, r) => sum + r.cpm, 0) / records.length;
    const avgCpc = records.reduce((sum, r) => sum + r.cpc, 0) / records.length;
    const avgCtr = records.reduce((sum, r) => sum + r.ctr, 0) / records.length;
    const minCpm = Math.min(...records.map((r) => r.cpm));
    const maxCpm = Math.max(...records.map((r) => r.cpm));

    // 计算趋势（比较最近一周和前一周）
    const recentWeek = records.slice(0, Math.min(7, records.length));
    const previousWeek = records.slice(7, Math.min(14, records.length));

    let trend: "up" | "down" | "stable" = "stable";
    if (recentWeek.length > 0 && previousWeek.length > 0) {
      const recentAvgCpm = recentWeek.reduce((sum, r) => sum + r.cpm, 0) / recentWeek.length;
      const previousAvgCpm = previousWeek.reduce((sum, r) => sum + r.cpm, 0) / previousWeek.length;
      const changePercent = ((recentAvgCpm - previousAvgCpm) / previousAvgCpm) * 100;

      if (changePercent > 5) {
        trend = "up";
      } else if (changePercent < -5) {
        trend = "down";
      }
    }

    return {
      avg_cpm: Math.round(avgCpm * 100) / 100,
      avg_cpc: Math.round(avgCpc * 100) / 100,
      avg_ctr: Math.round(avgCtr * 1000) / 1000,
      min_cpm: Math.round(minCpm * 100) / 100,
      max_cpm: Math.round(maxCpm * 100) / 100,
      trend,
      data_points: records.length,
    };
  }

  /**
   * 查询竞品定价历史
   *
   * @param competitorId - 竞品 ID
   * @returns Promise<CompetitorPricingRecord[]>
   */
  async queryCompetitorPricing(competitorId: string): Promise<CompetitorPricingRecord[]> {
    console.log(`[DatabaseSensor] Querying competitor pricing for ${competitorId}`);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("competitor_pricing")
      .select("*")
      .eq("competitor_id", competitorId)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[DatabaseSensor] Competitor pricing query failed:", error);
      throw error;
    }

    console.log(`[DatabaseSensor] Retrieved ${data?.length || 0} pricing records`);

    return (data as CompetitorPricingRecord[]) || [];
  }

  /**
   * 查询所有竞品的最新定价
   *
   * @returns Promise<CompetitorPricingRecord[]>
   */
  async queryAllCompetitorPricing(): Promise<
    Array<{
      competitor_id: string;
      competitor_name: string;
      latest_price: number;
      price_change_30d: number;
      price_change_percent: number;
    }>
  > {
    console.log("[DatabaseSensor] Querying all competitor pricing");

    const supabase = await createClient();

    // 获取所有竞品的最新定价
    const { data: latestPrices, error: latestError } = await supabase
      .from("competitor_pricing")
      .select("competitor_id, competitor_name, price, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1000);

    if (latestError) {
      console.error("[DatabaseSensor] Latest pricing query failed:", latestError);
      throw latestError;
    }

    // 按竞品分组，取最新价格
    const competitorMap = new Map<
      string,
      {
        competitor_id: string;
        competitor_name: string;
        latest_price: number;
        latest_date: string;
      }
    >();

    (latestPrices || []).forEach((record: any) => {
      const existing = competitorMap.get(record.competitor_id);
      if (!existing || new Date(record.updated_at) > new Date(existing.latest_date)) {
        competitorMap.set(record.competitor_id, {
          competitor_id: record.competitor_id,
          competitor_name: record.competitor_name,
          latest_price: record.price,
          latest_date: record.updated_at,
        });
      }
    });

    // 获取30天前的价格（用于计算变化）
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const result = Array.from(competitorMap.values()).map((competitor) => {
      // 简化版本：实际应该查询30天前的历史价格
      return {
        ...competitor,
        price_change_30d: 0,
        price_change_percent: 0,
      };
    });

    console.log(`[DatabaseSensor] Retrieved pricing for ${result.length} competitors`);

    return result;
  }

  /**
   * 保存广告成本数据（用于持续监控）
   *
   * @param record - 广告成本记录
   */
  async saveAdCostRecord(record: Omit<AdCostRecord, "id" | "created_at">): Promise<void> {
    console.log(`[DatabaseSensor] Saving ad cost record for ${record.platform}`);

    const supabase = await createClient();

    const { error } = await (supabase as any).from("ad_costs_history").insert({
      ...record,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[DatabaseSensor] Failed to save ad cost record:", error);
      throw error;
    }

    console.log("[DatabaseSensor] Ad cost record saved successfully");
  }

  /**
   * 保存竞品定价数据
   *
   * @param record - 竞品定价记录
   */
  async saveCompetitorPricingRecord(
    record: Omit<CompetitorPricingRecord, "id" | "updated_at">
  ): Promise<void> {
    console.log(`[DatabaseSensor] Saving pricing record for ${record.competitor_name}`);

    const supabase = await createClient();

    const { error } = await (supabase as any).from("competitor_pricing").insert({
      ...record,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[DatabaseSensor] Failed to save competitor pricing record:", error);
      throw error;
    }

    console.log("[DatabaseSensor] Competitor pricing record saved successfully");
  }
}
