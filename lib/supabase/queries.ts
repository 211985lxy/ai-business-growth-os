/**
 * Supabase Query Helpers
 * Type-safe database queries for the AI Business Growth OS
 */

import { createClient } from "./server";
import type {
  Profile,
  BrandAsset,
  BrandAssetInput,
  Task,
  TaskInput,
  AssetType,
  ContextInjection,
} from "@/types/db";

// Type assertion helper for Supabase queries
// We use a generic type to avoid strict Supabase client typing issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

// ================================================
// PROFILE QUERIES
// ================================================

/**
 * Get user profile by auth ID
 */
export async function getUserProfile(authId: string): Promise<Profile | null> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_id", authId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data as Profile | null;
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "full_name" | "avatar_url" | "tier">>
): Promise<Profile | null> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return null;
  }

  return data as Profile | null;
}

/**
 * Check if user has sufficient credits
 */
export async function checkUserCredits(userId: string, required: number): Promise<boolean> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.credits >= required;
}

/**
 * Deduct credits from user profile
 * Uses PostgreSQL's atomic update to prevent race conditions
 */
export async function deductCredits(userId: string, creditsToDeduct: number): Promise<boolean> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_credits_to_deduct: creditsToDeduct,
  });

  if (error) {
    console.error("Error deducting credits:", error);
    return false;
  }

  return data as boolean;
}

// ================================================
// BRAND ASSET QUERIES
// ================================================

/**
 * Get all brand assets for a user
 */
export async function getBrandAssets(userId: string): Promise<BrandAsset[]> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("brand_assets")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching brand assets:", error);
    return [];
  }

  return (data || []) as BrandAsset[];
}

/**
 * Get brand assets by type
 */
export async function getBrandAssetsByType(
  userId: string,
  assetType: AssetType
): Promise<BrandAsset[]> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("brand_assets")
    .select("*")
    .eq("user_id", userId)
    .eq("asset_type", assetType)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching brand assets by type:", error);
    return [];
  }

  return (data || []) as BrandAsset[];
}

/**
 * Create a new brand asset
 */
export async function createBrandAsset(
  userId: string,
  asset: BrandAssetInput
): Promise<BrandAsset | null> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("brand_assets")
    .insert({
      user_id: userId,
      ...asset,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating brand asset:", error);
    return null;
  }

  return data as BrandAsset | null;
}

/**
 * Update a brand asset
 */
export async function updateBrandAsset(
  assetId: string,
  updates: Partial<Omit<BrandAssetInput, "asset_type">>
): Promise<BrandAsset | null> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("brand_assets")
    .update(updates)
    .eq("id", assetId)
    .select()
    .single();

  if (error) {
    console.error("Error updating brand asset:", error);
    return null;
  }

  return data as BrandAsset | null;
}

/**
 * Delete a brand asset
 */
export async function deleteBrandAsset(assetId: string): Promise<boolean> {
  const supabase: SupabaseClient = await createClient();

  const { error } = await supabase.from("brand_assets").delete().eq("id", assetId);

  if (error) {
    console.error("Error deleting brand asset:", error);
    return false;
  }

  return true;
}

// ================================================
// CONTEXT INJECTION
// ================================================

/**
 * Build context injection from selected asset IDs
 * This is the Core Context Injection Pattern
 */
export async function buildContextInjection(
  userId: string,
  selectedAssetIds: string[]
): Promise<ContextInjection> {
  const supabase: SupabaseClient = await createClient();

  const { data: assets, error } = await supabase
    .from("brand_assets")
    .select("*")
    .eq("user_id", userId)
    .in("id", selectedAssetIds);

  if (error || !assets) {
    return {};
  }

  const context: ContextInjection = {};

  for (const asset of assets as BrandAsset[]) {
    switch (asset.asset_type) {
      case "persona":
        context.persona = asset.content as unknown as ContextInjection["persona"];
        break;
      case "product_selling_points":
        context.products = asset.content as unknown as ContextInjection["products"];
        break;
      case "target_audience":
        context.audience = asset.content as unknown as ContextInjection["audience"];
        break;
      case "writing_style":
        context.style = asset.content as unknown as ContextInjection["style"];
        break;
    }
  }

  return context;
}

// ================================================
// TASK QUERIES
// ================================================

/**
 * Get all tasks for a user
 */
export async function getUserTasks(userId: string, limit = 50): Promise<Task[]> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return (data || []) as Task[];
}

/**
 * Get a single task by ID
 */
export async function getTaskById(taskId: string): Promise<Task | null> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).single();

  if (error) {
    console.error("Error fetching task:", error);
    return null;
  }

  return data as Task | null;
}

/**
 * Create a new task
 */
export async function createTask(userId: string, task: TaskInput): Promise<Task | null> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      ...task,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    return null;
  }

  return data as Task | null;
}

/**
 * Update task status and output
 */
export async function updateTask(
  taskId: string,
  updates: Partial<
    Pick<
      Task,
      | "status"
      | "output_content"
      | "thinking_process"
      | "iteration_count"
      | "quality_score"
      | "error_message"
    >
  >
): Promise<Task | null> {
  const supabase: SupabaseClient = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    console.error("Error updating task:", error);
    return null;
  }

  return data as Task | null;
}

/**
 * Link assets to a task
 */
export async function linkAssetsToTask(taskId: string, assetIds: string[]): Promise<boolean> {
  const supabase: SupabaseClient = await createClient();

  const records = assetIds.map((assetId) => ({
    task_id: taskId,
    asset_id: assetId,
  }));

  const { error } = await supabase.from("asset_usage").insert(records);

  if (error) {
    console.error("Error linking assets to task:", error);
    return false;
  }

  return true;
}
