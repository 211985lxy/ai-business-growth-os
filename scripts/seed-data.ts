/**
 * Database Seeding Script
 * Inserts demo data for immediate testing
 *
 * Usage: npm run seed
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Check both NEXT_PUBLIC_SUPABASE_URL and SUPABASE_URL to avoid naming conflicts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate Supabase URL
if (!supabaseUrl) {
  console.error("❌ Missing SUPABASE_URL in .env.local");
  console.error(
    "   Please set either NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL in your .env.local file."
  );
  process.exit(1);
}

// Validate Supabase Key
if (!supabaseKey) {
  console.error("❌ Missing Supabase key in .env.local");
  console.error(
    "   Please set either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
  process.exit(1);
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  console.error("❌ Invalid SUPABASE_URL format in .env.local");
  console.error(`   Current value: ${supabaseUrl}`);
  console.error(
    "   Please ensure the URL is a valid format (e.g., https://your-project.supabase.co)"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Demo data
const demoBrandAssets = [
  {
    asset_type: "persona",
    name: "Elon Musk Style Tech Influencer",
    content: {
      tone: "bold, visionary, slightly irreverent, first-principles thinking",
      values: [
        "innovation at all costs",
        "challenge the status quo",
        "rapid iteration",
        "ambitious goals",
        "meritocracy",
      ],
      voice: "tech visionary who speaks directly to the people",
      expertise: [
        "AI/ML",
        "space technology",
        "electric vehicles",
        "renewable energy",
        "neural interfaces",
      ],
      personality:
        'Confident, memes and pop culture references, focuses on "what could be" rather than "what is", occasionally uses Twitter-style communication',
    },
    is_active: true,
    sort_order: 1,
  },
  {
    asset_type: "product_selling_points",
    name: "AI Automatic Coffee Machine",
    content: {
      products: [
        {
          name: "BrewMaster AI 3000",
          tagline: "The Last Coffee Machine You Will Ever Need",
          features: [
            "AI-powered taste learning - remembers your perfect brew",
            'Voice command activation - "Make my morning coffee"',
            "App integration - schedule and customize from anywhere",
            "Self-cleaning system with UV sterilization",
            "Precision temperature control (±0.5°C)",
            "Built-in grinder with burr precision",
            "Milk frothing with micro-foam technology",
          ],
          benefits: [
            "Save 15 minutes every morning",
            "Coffee shop quality at home",
            "Never wait for coffee again",
            "Personalized to your exact taste",
            "Cost-effective vs daily coffee shop visits",
          ],
          differentiators: [
            "Only AI-powered learning in the market",
            "Voice-first interface (no buttons needed)",
            "Professional-grade components for home use",
            "Sustainable packaging subscription model",
          ],
          price_range: "$899 - $1,299",
          target_market: "Tech-savvy professionals (25-45), high-income urban dwellers",
        },
      ],
    },
    is_active: true,
    sort_order: 2,
  },
  {
    asset_type: "target_audience",
    name: "Young Tech Professionals",
    content: {
      demographics: {
        age_range: "25-40 years old",
        gender: "All genders, slight skew to male",
        location: "Tier 1 cities (San Francisco, New York, London, Shanghai, Singapore)",
        income_level: "$80,000 - $250,000+ annually",
        education: "Bachelor's degree or higher",
        occupation: [
          "Software Engineer",
          "Product Manager",
          "Startup Founder",
          "Consultant",
          "Finance Professional",
        ],
      },
      psychographics: {
        interests: [
          "AI and emerging technology",
          "productivity optimization",
          "premium experiences",
          "health and wellness",
          "minimalist aesthetics",
          "smart home automation",
        ],
        values: [
          "efficiency and time-saving",
          "quality over quantity",
          "early adoption of technology",
          "sustainability",
          "self-improvement",
        ],
        pain_points: [
          "Morning routine inefficiency",
          "Coffee shop queues and costs",
          "Inconsistent coffee quality at home",
          "Too many decisions before coffee",
          "Desire for premium home experience",
        ],
        goals: [
          "Optimize daily routines",
          "Invest in quality of life",
          "Impress guests with home setup",
          "Reduce decision fatigue",
          "Support innovative brands",
        ],
        fears: [
          "Buying overhyped products",
          "Complicated maintenance",
          "Products becoming obsolete quickly",
          "Wasted money on gimmicks",
        ],
      },
      behaviors: {
        preferred_platforms: ["X (Twitter)", "LinkedIn", "YouTube", "Product Hunt", "Reddit"],
        content_consumption: [
          "short video",
          "long-form podcasts",
          "tech reviews",
          "unboxing videos",
        ],
        purchase_factors: [
          "product reviews",
          "brand reputation",
          "design aesthetics",
          "feature set",
          "price sensitivity: low",
        ],
      },
    },
    is_active: true,
    sort_order: 3,
  },
  {
    asset_type: "writing_style",
    name: "Tech Optimist Style",
    content: {
      style: "conversational tech influencer",
      tone: "enthusiastic, knowledgeable, slightly informal",
      structure: "hook - problem - solution - proof - CTA",
      language: {
        formality: "casual",
        use_emoji: true,
        use_hashtags: true,
        preferred_phrases: [
          "game-changer",
          "honestly",
          "here is the thing",
          "let me be clear",
          "this is not sponsored",
          "zero to one",
          "first principles",
        ],
        avoided_phrases: [
          "synergy",
          "leverage",
          "circle back",
          "corporate speak",
          "overly technical jargon",
        ],
      },
      formatting: {
        use_bullets: true,
        paragraph_length: "short",
        cta_style: 'casual and personal (e.g., "Would love to hear your thoughts")',
      },
    },
    is_active: true,
    sort_order: 4,
  },
];

async function seedDatabase() {
  console.log("🌱 Seeding database with demo data...\n");

  try {
    // Get the first user profile (assuming you have at least one user)
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (profileError) {
      throw profileError;
    }

    if (!profiles || profiles.length === 0) {
      console.error("❌ No profiles found. Please create a user first via auth.");
      process.exit(1);
    }

    const userId = profiles[0].id;

    // Clear existing brand_assets
    console.log("🗑️  Clearing existing brand_assets...");
    const { error: deleteError } = await supabase
      .from("brand_assets")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error clearing data:", deleteError);
    } else {
      console.log("✅ Cleared existing data\n");
    }

    // Insert demo data
    console.log("📦 Inserting demo brand_assets...\n");

    for (const asset of demoBrandAssets) {
      const { data, error } = await supabase
        .from("brand_assets")
        .insert({
          user_id: userId,
          ...asset,
        })
        .select("name, asset_type")
        .single();

      if (error) {
        console.error(`❌ Error inserting ${asset.name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${data.name} (${data.asset_type})`);
      }
    }

    console.log("\n✨ Seeding complete!");
    console.log("\n📊 Summary:");
    console.log(`   - ${demoBrandAssets.length} brand_assets created`);
    console.log(`   - User ID: ${userId}`);
    console.log("\n🚀 You can now start the app and test immediately!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
