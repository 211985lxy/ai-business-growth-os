/**
 * OpenClaw 配置验证
 *
 * 验证必需的环境变量是否存在
 *
 * @module openclaw/config
 */

export interface OpenClawConfig {
  gatewayUrl: string;
  apiKey: string;
  timeout?: number;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 验证单个环境变量
 */
function validateEnvVar(
  name: string,
  required: boolean = true
): { exists: boolean; value?: string } {
  const value = process.env[name];

  if (!value || value.trim() === "" || value === `your_${name.toLowerCase()}`) {
    if (required) {
      return { exists: false };
    }
  }

  return { exists: true, value: value! };
}

/**
 * 验证 OpenClaw 配置
 */
export function validateOpenClawConfig(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 必需的配置
  const gatewayUrl = validateEnvVar("OPENCLAW_GATEWAY_URL");
  const apiKey = validateEnvVar("OPENCLAW_API_KEY");

  if (!gatewayUrl.exists) {
    errors.push("OPENCLAW_GATEWAY_URL 未设置");
  } else if (
    !gatewayUrl.value!.startsWith("http://") &&
    !gatewayUrl.value!.startsWith("https://")
  ) {
    errors.push("OPENCLAW_GATEWAY_URL 格式无效（应以 http:// 或 https:// 开头）");
  }

  if (!apiKey.exists) {
    errors.push("OPENCLAW_API_KEY 未设置");
  } else if (apiKey.value!.length < 10) {
    warnings.push("OPENCLAW_API_KEY 可能无效（长度太短）");
  }

  // 可选的外部 API（缺失时给出警告）
  const optionalApis = [
    "LAW_API_KEY",
    "NEWS_API_KEY",
    "AD_COST_API_KEY",
    "COMPETITOR_API_KEY",
    "MARKET_RESEARCH_API_KEY",
    "INDUSTRY_API_KEY",
    "JOBS_API_KEY",
    "SALARY_API_KEY",
  ];

  const missingApis = optionalApis.filter((api) => !validateEnvVar(api, false).exists);

  if (missingApis.length > 0) {
    warnings.push(
      `以下外部 API 密钥未配置（${missingApis.length} 个）：` +
        missingApis.slice(0, 3).join(", ") +
        (missingApis.length > 3 ? "..." : "")
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 获取 OpenClaw 配置
 *
 * 如果配置无效，抛出错误
 */
export function getOpenClawConfig(): OpenClawConfig {
  const validation = validateOpenClawConfig();

  if (!validation.valid) {
    throw new Error(
      `OpenClaw 配置无效：\n` +
        validation.errors.map((e) => `  ❌ ${e}`).join("\n") +
        `\n\n请在 .env.local 中设置这些变量`
    );
  }

  // 输出警告
  if (validation.warnings.length > 0) {
    console.warn("[OpenClaw] 配置警告：");
    validation.warnings.forEach((w) => console.warn(`  ⚠️  ${w}`));
  }

  return {
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL!,
    apiKey: process.env.OPENCLAW_API_KEY!,
    timeout: parseInt(process.env.OPENCLAW_TIMEOUT || "30000", 10),
  };
}

/**
 * 检查 Supabase 配置
 */
export function validateSupabaseConfig(): ConfigValidationResult {
  const errors: string[] = [];

  const url = validateEnvVar("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = validateEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url.exists) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL 未设置");
  }

  if (!anonKey.exists) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
  };
}

/**
 * 验证所有配置（OpenClaw + Supabase）
 */
export function validateAllConfigs(): {
  openclaw: ConfigValidationResult;
  supabase: ConfigValidationResult;
  valid: boolean;
} {
  const openclaw = validateOpenClawConfig();
  const supabase = validateSupabaseConfig();

  return {
    openclaw,
    supabase,
    valid: openclaw.valid && supabase.valid,
  };
}

/**
 * 打印配置状态（用于调试）
 */
export function printConfigStatus(): void {
  console.log("\n📋 OpenClaw 传感器系统配置状态\n");

  const configs = validateAllConfigs();

  // OpenClaw 配置
  console.log("OpenClaw 配置：");
  if (configs.openclaw.valid) {
    console.log("  ✅ 有效");
    console.log(`  📍 网关：${process.env.OPENCLAW_GATEWAY_URL}`);
    console.log(`  🔑 API Key：${process.env.OPENCLAW_API_KEY!.substring(0, 10)}...`);
  } else {
    console.log("  ❌ 无效");
    configs.openclaw.errors.forEach((e) => console.log(`     ${e}`));
  }

  if (configs.openclaw.warnings.length > 0) {
    console.log("  ⚠️  警告：");
    configs.openclaw.warnings.forEach((w) => console.log(`     ${w}`));
  }

  // Supabase 配置
  console.log("\nSupabase 配置：");
  if (configs.supabase.valid) {
    console.log("  ✅ 有效");
    console.log(`  📍 URL：${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  } else {
    console.log("  ❌ 无效");
    configs.supabase.errors.forEach((e) => console.log(`     ${e}`));
  }

  // 外部 API 统计
  const externalApis = [
    "LAW_API_KEY",
    "NEWS_API_KEY",
    "AD_COST_API_KEY",
    "COMPETITOR_API_KEY",
    "MARKET_RESEARCH_API_KEY",
    "INDUSTRY_API_KEY",
    "JOBS_API_KEY",
    "SALARY_API_KEY",
  ];

  const configuredApis = externalApis.filter((api) => validateEnvVar(api, false).exists);
  console.log(`\n外部 API：${configuredApis.length}/${externalApis.length} 已配置`);

  if (configuredApis.length > 0) {
    configuredApis.forEach((api) => {
      console.log(`  ✅ ${api.replace("_API_KEY", "")}`);
    });
  }

  console.log();
}
