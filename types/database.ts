/**
 * Database Types for Supabase
 * Auto-generated types matching Supabase schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_id: string;
          tier: "starter" | "pro" | "enterprise";
          credits: number;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          tier?: "starter" | "pro" | "enterprise";
          credits?: number;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string;
          tier?: "starter" | "pro" | "enterprise";
          credits?: number;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      brand_assets: {
        Row: {
          id: string;
          user_id: string;
          asset_type: "persona" | "product_selling_points" | "target_audience" | "writing_style";
          name: string;
          content: Json;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset_type: "persona" | "product_selling_points" | "target_audience" | "writing_style";
          name: string;
          content: Json;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset_type?: "persona" | "product_selling_points" | "target_audience" | "writing_style";
          name?: string;
          content?: Json;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          workflow_type:
            | "strategy_research"
            | "script_draft"
            | "script_critic"
            | "script_refiner"
            | "xhs_generator";
          workflow_id: string;
          input_data: Json;
          output_content: string | null;
          thinking_process: string | null;
          status: "processing" | "completed" | "failed";
          iteration_count: number;
          quality_score: number | null;
          error_message: string | null;
          credits_used: number;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          workflow_type:
            | "strategy_research"
            | "script_draft"
            | "script_critic"
            | "script_refiner"
            | "xhs_generator";
          workflow_id: string;
          input_data: Json;
          output_content?: string | null;
          thinking_process?: string | null;
          status?: "processing" | "completed" | "failed";
          iteration_count?: number;
          quality_score?: number | null;
          error_message?: string | null;
          credits_used?: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          workflow_type?:
            | "strategy_research"
            | "script_draft"
            | "script_critic"
            | "script_refiner"
            | "xhs_generator";
          workflow_id?: string;
          input_data?: Json;
          output_content?: string | null;
          thinking_process?: string | null;
          status?: "processing" | "completed" | "failed";
          iteration_count?: number;
          quality_score?: number | null;
          error_message?: string | null;
          credits_used?: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      strategy_contexts: {
        Row: {
          id: string;
          user_id: string;
          niche: string;
          revenue_goal: string | null;
          founder_story: string | null;
          strengths: Json;
          output_content: string | null;
          is_active: boolean;
          source: "ai_generated" | "manual";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          niche: string;
          revenue_goal?: string | null;
          founder_story?: string | null;
          strengths?: Json;
          output_content?: string | null;
          is_active?: boolean;
          source?: "ai_generated" | "manual";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          niche?: string;
          revenue_goal?: string | null;
          founder_story?: string | null;
          strengths?: Json;
          output_content?: string | null;
          is_active?: boolean;
          source?: "ai_generated" | "manual";
          created_at?: string;
          updated_at?: string;
        };
      };
      agent_outputs: {
        Row: {
          id: string;
          user_id: string;
          agent_type: string;
          task_id: string | null;
          input_prompt: string;
          input_params: Json;
          output_content: string | null;
          output_summary: string | null;
          duration_ms: number | null;
          tokens_used: number | null;
          status: "processing" | "completed" | "failed" | "timeout";
          error_message: string | null;
          related_agent_ids: string[] | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_type: string;
          task_id?: string | null;
          input_prompt: string;
          input_params?: Json;
          output_content?: string | null;
          output_summary?: string | null;
          duration_ms?: number | null;
          tokens_used?: number | null;
          status?: "processing" | "completed" | "failed" | "timeout";
          error_message?: string | null;
          related_agent_ids?: string[] | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_type?: string;
          task_id?: string | null;
          input_prompt?: string;
          input_params?: Json;
          output_content?: string | null;
          output_summary?: string | null;
          duration_ms?: number | null;
          tokens_used?: number | null;
          status?: "processing" | "completed" | "failed" | "timeout";
          error_message?: string | null;
          related_agent_ids?: string[] | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      asset_usage: {
        Row: {
          id: string;
          task_id: string;
          asset_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          asset_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          asset_id?: string;
          created_at?: string;
        };
      };
      knowledge_files: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          dify_file_id: string;
          dify_dataset_id: string | null;
          meridian_type: "tian" | "di" | "ren" | "shen" | "cai" | "fa";
          page_count: number | null;
          word_count: number | null;
          sync_status: "uploading" | "indexing" | "synced" | "failed";
          sync_error: string | null;
          created_at: string;
          updated_at: string;
          synced_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          dify_file_id: string;
          dify_dataset_id?: string | null;
          meridian_type: "tian" | "di" | "ren" | "shen" | "cai" | "fa";
          page_count?: number | null;
          word_count?: number | null;
          sync_status?: "uploading" | "indexing" | "synced" | "failed";
          sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
          synced_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          dify_file_id?: string;
          dify_dataset_id?: string | null;
          meridian_type?: "tian" | "di" | "ren" | "shen" | "cai" | "fa";
          page_count?: number | null;
          word_count?: number | null;
          sync_status?: "uploading" | "indexing" | "synced" | "failed";
          sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
          synced_at?: string | null;
        };
      };
      knowledge_sync_log: {
        Row: {
          id: string;
          user_id: string;
          sync_status: "idle" | "syncing" | "completed" | "failed";
          total_files: number;
          indexed_files: number;
          failed_files: number;
          coverage_percentage: number | null;
          sync_error: string | null;
          last_sync_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sync_status?: "idle" | "syncing" | "completed" | "failed";
          total_files?: number;
          indexed_files?: number;
          failed_files?: number;
          coverage_percentage?: number | null;
          sync_error?: string | null;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sync_status?: "idle" | "syncing" | "completed" | "failed";
          total_files?: number;
          indexed_files?: number;
          failed_files?: number;
          coverage_percentage?: number | null;
          sync_error?: string | null;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_citations: {
        Row: {
          id: string;
          task_id: string;
          knowledge_file_id: string | null;
          citation_number: number;
          source_file_name: string | null;
          source_page: number | null;
          source_paragraph: number | null;
          source_text_preview: string | null;
          context_before: string | null;
          context_after: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          knowledge_file_id?: string | null;
          citation_number: number;
          source_file_name?: string | null;
          source_page?: number | null;
          source_paragraph?: number | null;
          source_text_preview?: string | null;
          context_before?: string | null;
          context_after?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          knowledge_file_id?: string | null;
          citation_number?: number;
          source_file_name?: string | null;
          source_page?: number | null;
          source_paragraph?: number | null;
          source_text_preview?: string | null;
          context_before?: string | null;
          context_after?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_active_brand_assets: {
        Args: {
          p_user_id: string;
          p_asset_type?: "persona" | "product_selling_points" | "target_audience" | "writing_style";
        };
        Returns: {
          id: string;
          asset_type: "persona" | "product_selling_points" | "target_audience" | "writing_style";
          name: string;
          content: Json;
        }[];
      };
      check_user_credits: {
        Args: {
          p_user_id: string;
          p_required_credits: number;
        };
        Returns: boolean;
      };
      get_active_strategy_context: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          id: string;
          niche: string;
          revenue_goal: string | null;
          founder_story: string | null;
          strengths: Json;
        }[];
      };
      save_strategy_context: {
        Args: {
          p_user_id: string;
          p_niche: string;
          p_revenue_goal?: string | null;
          p_founder_story?: string | null;
          p_strengths?: Json;
        };
        Returns: string;
      };
      log_agent_call: {
        Args: {
          p_user_id: string;
          p_agent_type: string;
          p_input_prompt: string;
          p_input_params?: Json;
          p_task_id?: string | null;
        };
        Returns: string;
      };
      complete_agent_call: {
        Args: {
          p_log_id: string;
          p_output_content: string;
          p_output_summary?: string | null;
          p_duration_ms?: number | null;
          p_tokens_used?: number | null;
          p_status?: string;
          p_error_message?: string | null;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_tier: "starter" | "pro" | "enterprise";
      asset_type: "persona" | "product_selling_points" | "target_audience" | "writing_style";
      task_status: "processing" | "completed" | "failed";
      workflow_type:
        | "strategy_research"
        | "script_draft"
        | "script_critic"
        | "script_refiner"
        | "xhs_generator";
      meridian_type: "tian" | "di" | "ren" | "shen" | "cai" | "fa";
      sync_status:
        | "uploading"
        | "indexing"
        | "synced"
        | "failed"
        | "idle"
        | "syncing"
        | "completed";
    };
  };
}
