/**
 * AI Business Growth OS - Database Type Definitions
 *
 * This file contains TypeScript types matching the database schema.
 * All JSONB columns have strict type definitions for type safety.
 */

// ================================================
// ENUM TYPES
// ================================================

/**
 * User subscription tiers
 */
export type UserTier = "starter" | "pro" | "enterprise";

/**
 * Brand asset types for context injection
 */
export type AssetType = "persona" | "product_selling_points" | "target_audience" | "writing_style";

/**
 * Task processing status
 */
export type TaskStatus = "processing" | "completed" | "failed";

/**
 * Workflow types for different AI modules
 */
export type WorkflowType =
  | "strategy_research"
  | "script_draft"
  | "script_critic"
  | "script_refiner"
  | "xhs_generator";

// ================================================
// JSONB CONTENT TYPES
// ================================================

/**
 * Persona asset content structure
 * Used for: brand_assets.asset_type = 'persona'
 */
export interface PersonaData {
  tone: string; // e.g., "professional", "casual", "humorous"
  values: string[]; // e.g., ["innovation", "quality", "customer-first"]
  voice: string; // e.g., "expert advisor", "friendly guide"
  expertise?: string[]; // e.g., ["technology", "marketing", "business"]
  personality?: string; // Description of persona characteristics
}

/**
 * Product selling points content structure
 * Used for: brand_assets.asset_type = 'product_selling_points'
 */
export interface ProductSellingPointsData {
  products: Array<{
    name: string;
    tagline: string;
    features: string[];
    benefits: string[];
    differentiators: string[];
    price_range?: string;
    target_market?: string;
  }>;
}

/**
 * Target audience content structure
 * Used for: brand_assets.asset_type = 'target_audience'
 */
export interface TargetAudienceData {
  demographics: {
    age_range?: string;
    gender?: string;
    location?: string;
    income_level?: string;
    education?: string;
    occupation?: string[];
  };
  psychographics: {
    interests?: string[];
    values?: string[];
    pain_points?: string[];
    goals?: string[];
    fears?: string[];
  };
  behaviors: {
    preferred_platforms?: string[]; // e.g., ["douyin", "xiaohongshu", "weibo"]
    content_consumption?: string[]; // e.g., ["short_video", "article", "livestream"]
    purchase_factors?: string[]; // e.g., ["price", "quality", "brand"]
  };
}

/**
 * Writing style content structure
 * Used for: brand_assets.asset_type = 'writing_style'
 */
export interface WritingStyleData {
  style: string; // e.g., "storytelling", "educational", "promotional"
  tone: string; // e.g., "enthusiastic", "authoritative", "friendly"
  structure: string; // e.g., "hook-story-offer", "problem-agitate-solution"
  language: {
    formality: "formal" | "casual" | "mixed";
    use_emoji: boolean;
    use_hashtags: boolean;
    preferred_phrases?: string[];
    avoided_phrases?: string[];
  };
  formatting: {
    use_bullets: boolean;
    paragraph_length: "short" | "medium" | "long";
    cta_style?: string; // Call-to-action style
  };
}

/**
 * Discriminated union for brand asset content
 */
export type AssetContent =
  | { type: "persona"; data: PersonaData }
  | { type: "product_selling_points"; data: ProductSellingPointsData }
  | { type: "target_audience"; data: TargetAudienceData }
  | { type: "writing_style"; data: WritingStyleData };

// ================================================
// DATABASE TABLE TYPES
// ================================================

/**
 * Profile table structure
 * Extended user profile linked to Supabase Auth
 */
export interface Profile {
  id: string;
  auth_id: string; // References auth.users

  // Subscription & Credits
  tier: UserTier;
  credits: number;

  // User info
  full_name: string | null;
  avatar_url: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Profile type for updates (partial fields)
 */
export type ProfileUpdate = Partial<Pick<Profile, "full_name" | "avatar_url" | "tier">>;

/**
 * Brand Asset table structure
 * Context assets for AI prompt injection
 */
export interface BrandAsset {
  id: string;
  user_id: string; // References profiles

  // Asset categorization
  asset_type: AssetType;
  name: string;

  // Structured content using discriminated union
  content: AssetContent;

  // Metadata
  is_active: boolean;
  sort_order: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Brand Asset input type for creation
 */
export interface BrandAssetInput {
  asset_type: AssetType;
  name: string;
  content: PersonaData | ProductSellingPointsData | TargetAudienceData | WritingStyleData;
  is_active?: boolean;
  sort_order?: number;
}

/**
 * Task table structure
 * AI generation tasks with workflow tracking and monitoring
 */
export interface Task {
  id: string;
  user_id: string; // References profiles

  // Workflow identification
  workflow_type: WorkflowType;
  workflow_id: string; // Dify Workflow ID

  // Input/Output
  input_data: Record<string, unknown>; // Form inputs from user
  output_content: string | null; // Markdown output
  thinking_process: string | null; // Critic agent's reasoning

  // Tracking
  status: TaskStatus;
  iteration_count: number; // Writer-Critic loop counter
  quality_score: number | null; // Critic score (0-100)

  // Error handling
  error_message: string | null;

  // Credits
  credits_used: number;

  // Monitoring fields (added in migration)
  token_total_tokens?: number; // Total tokens used
  token_input_tokens?: number; // Input tokens
  token_output_tokens?: number; // Output tokens
  duration_ms?: number; // Execution time in milliseconds
  input_summary?: string; // Short summary of input
  output_summary?: string; // Short summary of output
  model_used?: string; // AI model identifier
  provider?: string; // AI provider (dify, openai, etc.)
  metadata?: Record<string, unknown>; // Additional monitoring data

  // Timestamps
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

/**
 * Task input type for creation
 */
export interface TaskInput {
  workflow_type: WorkflowType;
  workflow_id: string;
  input_data: Record<string, unknown>;
  credits_used?: number;
}

/**
 * Asset Usage junction table
 * Links tasks to brand assets used
 */
export interface AssetUsage {
  id: string;
  task_id: string; // References tasks
  asset_id: string; // References brand_assets

  created_at: string;
}

// ================================================
// API REQUEST/RESPONSE TYPES
// ================================================

/**
 * Context injection data structure
 * Passed to Dify workflows as system variables
 */
export interface ContextInjection {
  persona?: PersonaData;
  products?: ProductSellingPointsData;
  audience?: TargetAudienceData;
  style?: WritingStyleData;
}

/**
 * Strategy Research Form Input
 */
export interface StrategyResearchInput {
  niche: string;
  revenueGoal?: string;
  founderStory?: string;
  strengths?: string[];
  file_id?: string;
  selectedAssetIds?: string[];
}

/**
 * Script Draft Form Input
 */
export interface ScriptDraftInput {
  topic: string;
  duration?: number; // Target duration in seconds
  platform: "douyin" | "xiaohongshu" | "weibo" | "generic";
  content_type: "educational" | "entertainment" | "promotional" | "story";
}

/**
 * XHS (Xiaohongshu) Generator Input
 */
export interface XHSGeneratorInput {
  source_content: string; // Script or article to convert
  include_emoji?: boolean;
  hashtag_count?: number;
  target_engagement?: "high" | "medium" | "low";
}

// ================================================
// ERROR TYPES
// ================================================

/**
 * Custom error for insufficient credits
 */
export class InsufficientCreditsError extends Error {
  constructor(
    public required: number,
    public available: number
  ) {
    super(`Insufficient credits. Required: ${required}, Available: ${available}`);
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Custom error for unauthorized access
 */
export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized access");
    this.name = "UnauthorizedError";
  }
}

/**
 * Custom error for workflow failures
 */
export class WorkflowError extends Error {
  constructor(
    message: string,
    public workflowId: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "WorkflowError";
  }
}

// ================================================
// DIFY API TYPES
// ================================================

/**
 * Dify API request structure
 * Supports both Workflow and Chatflow APIs
 */
export interface DifyWorkflowRequest {
  workflow_id?: string; // Optional for Chatflow
  inputs: Record<string, unknown>;
  user: string; // User identifier
  query?: string; // Required for Chatflow API
  response_mode?: "streaming" | "blocking";
  files?: Array<{
    type: string;
    transfer_method: string;
    url?: string;
    upload_file_id?: string;
  }>;
}

/**
 * Dify streaming response chunk
 */
export interface DifyStreamChunk {
  event: "workflow_finished" | "workflow_started" | "message" | "node_started" | "node_finished";
  task_id: string;
  data?: {
    id?: string;
    status?: "succeeded" | "failed";
    outputs?: Record<string, unknown>;
    error?: string;
    node_id?: string;
    node_type?: string;
    title?: string;
    text?: string;
  };
}
