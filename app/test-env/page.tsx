/**
 * 环境变量测试页面
 */

"use client";

import { useState, useEffect } from "react";

export default function TestEnvPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 测试环境变量是否可用
    const testEnvVars = async () => {
      try {
        // 客户端环境变量（必须以 NEXT_PUBLIC_ 开头）
        const vars: Record<string, string> = {
          "NEXT_PUBLIC_NEWS_RADAR_JSON_URL":
            process.env.NEXT_PUBLIC_NEWS_RADAR_JSON_URL || "未设置",
          "NEXT_PUBLIC_SUPABASE_URL":
            process.env.NEXT_PUBLIC_SUPABASE_URL || "未设置",
          "NEXT_PUBLIC_SUPABASE_ANON_KEY":
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
              ? "已设置（长度: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + "）"
              : "未设置",
        };

        setEnvVars(vars);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    };

    testEnvVars();
  }, []);

  // 测试 JSON URL 是否可访问
  const [jsonTest, setJsonTest] = useState<{
    loading: boolean;
    error: string | null;
    data: any;
  }>({ loading: false, error: null, data: null });

  const testJsonUrl = async () => {
    const url = process.env.NEXT_PUBLIC_NEWS_RADAR_JSON_URL;
    if (!url) {
      setJsonTest({ loading: false, error: "环境变量未设置", data: null });
      return;
    }

    setJsonTest({ loading: true, error: null, data: null });

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setJsonTest({ loading: false, error: null, data });
    } catch (err) {
      setJsonTest({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
        data: null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0D0D0D] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 dark:text-slate-100 mb-2">
            环境变量测试页面
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 dark:text-zinc-400">
            检查 .env.local 中的环境变量是否正确加载
          </p>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-zinc-950 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-zinc-600 dark:text-zinc-300 dark:text-zinc-400">加载中...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-400 font-medium">错误: {error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 环境变量列表 */}
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 dark:text-slate-100">
                  客户端环境变量
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  以 NEXT_PUBLIC_ 开头的变量可在客户端访问
                </p>
              </div>
              <div className="p-6">
                <dl className="space-y-4">
                  {Object.entries(envVars).map(([key, value]) => (
                    <div key={key} className="border-b border-zinc-200 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                      <dt className="text-sm font-medium text-zinc-700 dark:text-zinc-200 dark:text-slate-300 mb-1 font-mono">
                        {key}
                      </dt>
                      <dd
                        className={`text-sm mt-1 p-3 rounded bg-zinc-50 dark:bg-zinc-800/50 font-mono break-all ${
                          value === "未设置"
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* JSON URL 测试 */}
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 dark:text-slate-100">
                  JSON URL 连接测试
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  测试 NEWS_RADAR_JSON_URL 是否可访问
                </p>
              </div>
              <div className="p-6">
                <button
                  onClick={testJsonUrl}
                  disabled={jsonTest.loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {jsonTest.loading ? "测试中..." : "测试连接"}
                </button>

                {jsonTest.error && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                    <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
                      连接失败
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                      {jsonTest.error}
                    </p>
                  </div>
                )}

                {jsonTest.data && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">
                      ✅ 连接成功！
                    </p>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300 dark:text-zinc-400">
                      <p>数据类型: {Array.isArray(jsonTest.data) ? "数组" : typeof jsonTest.data}</p>
                      <p>
                        数据长度:{" "}
                        {Array.isArray(jsonTest.data)
                          ? `${jsonTest.data.length} 条记录`
                          : `${JSON.stringify(jsonTest.data).length} 字符`}
                      </p>
                      {Array.isArray(jsonTest.data) && jsonTest.data.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-zinc-700 dark:text-zinc-200 dark:text-slate-300 hover:text-zinc-900 dark:text-zinc-50 dark:hover:text-slate-100">
                            查看第一条数据
                          </summary>
                          <pre className="mt-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded text-xs overflow-auto max-h-64">
                            {JSON.stringify(jsonTest.data[0], null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 说明 */}
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-2">
                💡 提示
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>环境变量修改后需要重启开发服务器才能生效</li>
                <li>只有以 NEXT_PUBLIC_ 开头的变量才能在客户端访问</li>
                <li>服务器端变量（不带前缀）只能在 API Routes 中访问</li>
                <li>.env.local 文件不会被提交到 Git，适合存放敏感信息</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
