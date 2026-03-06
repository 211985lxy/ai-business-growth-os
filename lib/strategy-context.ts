/**
 * Strategy Context Service
 *
 * Replaces localStorage with Supabase for global strategy context.
 * Provides cross-device access, persistence, and analytics.
 */

import { createClient } from "@/lib/supabase/client";

// Lazy client creation to avoid SSR issues
const getSupabase = () => createClient();

// ============================================================================
// TYPES
// ============================================================================

export interface StrategyContext {
  id: string;
  user_id: string;
  niche: string;
  revenue_goal?: string;
  founder_story?: string;
  strengths?: string[];
  output_content?: string; // AI-generated strategy output
  is_active: boolean;
  source: "ai_generated" | "manual";
  created_at: string;
  updated_at: string;
}

export interface StrategyContextInput {
  niche: string;
  revenue_goal?: string;
  founder_story?: string;
  strengths?: string[];
  output_content?: string; // AI-generated strategy output
}

export interface AgentOutputLog {
  id: string;
  user_id: string;
  agent_type: "strategy" | "content" | "earth" | "man" | "law" | "money";
  task_id?: string;
  input_prompt: string;
  input_params: Record<string, unknown>;
  output_content?: string;
  output_summary?: string;
  duration_ms?: number;
  tokens_used?: number;
  status: "processing" | "completed" | "failed" | "timeout";
  error_message?: string;
  related_agent_ids?: string[];
  created_at: string;
  completed_at?: string;
}

export interface AgentCallInput {
  agent_type: "strategy" | "content" | "earth" | "man" | "law" | "money";
  input_prompt: string;
  input_params?: Record<string, unknown>;
  task_id?: string;
}

export interface AgentCallCompletion {
  output_content: string;
  output_summary?: string;
  duration_ms?: number;
  tokens_used?: number;
  status: "completed" | "failed" | "timeout";
  error_message?: string;
}

// ============================================================================
// STRATEGY CONTEXT SERVICE
// ============================================================================

/**
 * Get the active strategy context for the current user
 * Falls back to localStorage for unauthenticated users
 */
export async function getActiveStrategyContext(): Promise<StrategyContext | null> {
  try {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();

    if (user) {
      // Logged in: try Supabase first
      const { data, error } = await (getSupabase() as any).rpc("get_active_strategy_context", {
        p_user_id: user.id,
      });

      if (error) throw error;
      if (data?.[0]) return data?.[0];
    }

    // Not logged in or no data in Supabase: fallback to localStorage
    const localData = getFromLocalStorage();
    if (localData) {
      // Return a mock StrategyContext object
      return {
        id: "local",
        user_id: "local",
        niche: localData.niche,
        revenue_goal: localData.revenue_goal,
        founder_story: localData.founder_story,
        strengths: localData.strengths,
        output_content: localData.output_content,
        is_active: true,
        source: "ai_generated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to get active strategy context, falling back to localStorage:", error);
    // Final fallback: try localStorage
    const localData = getFromLocalStorage();
    if (localData) {
      return {
        id: "local",
        user_id: "local",
        niche: localData.niche,
        revenue_goal: localData.revenue_goal,
        founder_story: localData.founder_story,
        strengths: localData.strengths,
        output_content: localData.output_content,
        is_active: true,
        source: "ai_generated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return null;
  }
}

/**
 * Save or update strategy context
 * Automatically deactivates old contexts and creates a new active one
 */
export async function saveStrategyContext(input: StrategyContextInput): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await (getSupabase() as any).rpc("save_strategy_context", {
      p_user_id: user.id,
      p_niche: input.niche,
      p_revenue_goal: input.revenue_goal || null,
      p_founder_story: input.founder_story || null,
      p_strengths: (input.strengths || []) as unknown as Record<string, unknown>[],
    });

    if (error) throw error;
    return data as string;
  } catch (error) {
    console.error("Failed to save strategy context:", error);
    return null;
  }
}

/**
 * Save strategy context with AI-generated output
 * Falls back to localStorage for unauthenticated users
 * This is a direct table insert (bypassing RPC) to include output_content
 */
export async function saveStrategyContextWithOutput(
  input: StrategyContextInput
): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();

    if (user) {
      // Logged in: save to Supabase
      // First, deactivate all existing contexts
      await (getSupabase() as any)
        .from("strategy_contexts")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      // Then insert the new context with output
      const { data, error } = await (getSupabase() as any)
        .from("strategy_contexts")
        .insert({
          user_id: user.id,
          niche: input.niche,
          revenue_goal: input.revenue_goal || null,
          founder_story: input.founder_story || null,
          strengths: (input.strengths || []) as unknown as Record<string, unknown>[],
          output_content: input.output_content || null,
          is_active: true,
          source: "ai_generated",
        })
        .select("id")
        .single();

      if (error) throw error;
      return data.id;
    } else {
      // Not logged in: fallback to localStorage
      const contextData = {
        ...input,
        _source: "local" as const,
        saved_at: new Date().toISOString(),
      };
      saveToLocalStorage(contextData);
      saveToHistory(contextData); // Also save to history
      console.log("✅ Strategy context saved to localStorage (user not logged in)");
      return "local";
    }
  } catch (error) {
    console.error(
      "Failed to save strategy context with output to Supabase, falling back to localStorage:",
      error
    );
    // Final fallback: save to localStorage even if Supabase fails
    const contextData = {
      ...input,
      _source: "local" as const,
      saved_at: new Date().toISOString(),
    };
    saveToLocalStorage(contextData);
    saveToHistory(contextData); // Also save to history
    console.log("✅ Strategy context saved to localStorage (fallback)");
    return "local";
  }
}

/**
 * Get all strategy contexts for the current user (history)
 */
export async function getStrategyContextHistory(limit = 10): Promise<StrategyContext[]> {
  try {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    if (!user) return [];

    const { data, error } = await getSupabase()
      .from("strategy_contexts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to get strategy context history:", error);
    return [];
  }
}

/**
 * Delete a strategy context
 */
export async function deleteStrategyContext(contextId: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    if (!user) return false;

    const { error } = await getSupabase()
      .from("strategy_contexts")
      .delete()
      .eq("id", contextId)
      .eq("user_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to delete strategy context:", error);
    return false;
  }
}

// ============================================================================
// AGENT LOGGING SERVICE
// ============================================================================

/**
 * Start logging an agent call
 */
export async function logAgentCall(input: AgentCallInput): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await (getSupabase() as any).rpc("log_agent_call", {
      p_user_id: user.id,
      p_agent_type: input.agent_type,
      p_input_prompt: input.input_prompt,
      p_input_params: (input.input_params || {}) as Record<string, unknown>,
      p_task_id: input.task_id || null,
    });

    if (error) throw error;
    return data as string;
  } catch (error) {
    console.error("Failed to log agent call:", error);
    return null;
  }
}

/**
 * Complete an agent log with results
 */
export async function completeAgentCall(
  logId: string,
  completion: AgentCallCompletion
): Promise<boolean> {
  try {
    const { error } = await (getSupabase() as any).rpc("complete_agent_call", {
      p_log_id: logId,
      p_output_content: completion.output_content,
      p_output_summary: completion.output_summary || null,
      p_duration_ms: completion.duration_ms || null,
      p_tokens_used: completion.tokens_used || null,
      p_status: completion.status,
      p_error_message: completion.error_message || null,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to complete agent call:", error);
    return false;
  }
}

/**
 * Get agent logs for analytics
 */
export async function getAgentLogs(filters?: {
  agent_type?: string;
  status?: string;
  limit?: number;
}): Promise<AgentOutputLog[]> {
  try {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    if (!user) return [];

    let query = getSupabase()
      .from("agent_outputs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (filters?.agent_type) {
      query = query.eq("agent_type", filters.agent_type);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to get agent logs:", error);
    return [];
  }
}

// ============================================================================
// LOCALSTORAGE FALLBACK
// ============================================================================

const STORAGE_KEY = "strategyContext";
const HISTORY_STORAGE_KEY = "strategy_history";

/**
 * Save strategy context to localStorage (fallback for unauthenticated users)
 */
export function saveToLocalStorage(context: StrategyContextInput): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

/**
 * Save strategy to history (localStorage)
 */
function saveToHistory(context: StrategyContextInput & { output_content?: string }): void {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
    const newRecord = {
      id: `local_${Date.now()}`,
      created_at: new Date().toISOString(),
      niche: context.niche,
      output_content: context.output_content || "",
      source: "local" as const,
    };

    // Add to beginning, keep only 50 most recent
    const updated = [newRecord, ...history].slice(0, 50);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save to history:", error);
  }
}

/**
 * Get strategy context from localStorage (fallback)
 */
export function getFromLocalStorage(): StrategyContextInput | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as StrategyContextInput;
  } catch (error) {
    console.error("Failed to read from localStorage:", error);
    return null;
  }
}

/**
 * Clear strategy context from localStorage
 */
export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
}

// ============================================================================
// LOCALSTORAGE MIGRATION HELPER
// ============================================================================

/**
 * Migrate strategy context from localStorage to Supabase
 * Call this once per user to migrate existing data
 */
export async function migrateFromLocalStorage(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    if (!user) return false;

    // Read from localStorage
    const localData = localStorage.getItem("strategyContext");
    if (!localData) return false; // Nothing to migrate

    const parsed = JSON.parse(localData) as StrategyContextInput;

    // Save to Supabase
    const contextId = await saveStrategyContext(parsed);
    if (!contextId) return false;

    // Optional: Clear localStorage after successful migration
    // localStorage.removeItem("strategyContext");

    console.log("Migrated strategy context from localStorage:", contextId);
    return true;
  } catch (error) {
    console.error("Failed to migrate from localStorage:", error);
    return false;
  }
}
