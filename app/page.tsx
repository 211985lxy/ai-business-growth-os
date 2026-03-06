/**
 * Dashboard Home Page
 * 六脉增长系统 - Main Dashboard with Taoist wisdom
 * 天地人神财法一体 - Eastern Philosophy Meets Modern AI
 */

"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { ArrowRight, Hexagon } from "lucide-react";
import Link from "next/link";

// 汉字图标组件
function ChineseIcon({ char, gradient }: { char: string; gradient: string }) {
  return (
    <div className="relative group/icon shrink-0">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-40 group-hover/icon:opacity-70 group-hover:blur-2xl transition-all duration-700`}
      ></div>
      <div
        className={`relative bg-gradient-to-br ${gradient} w-14 h-14 rounded-2xl shadow-lg border border-white/20 flex items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-500`}
      >
        <span className="text-2xl font-sans text-white font-bold tracking-normal">{char}</span>
      </div>
    </div>
  );
}

const modules = [
  {
    title: "天道 · 战略",
    titleEn: "Tian Dao - Strategy",
    description: "洞察天时，把握商业战略之天机",
    descriptionEn: "Divine timing, strategic business insights",
    href: "/strategy",
    iconChar: "天",
    gradient:
      "from-zinc-800 via-zinc-900 to-black dark:from-zinc-200 dark:via-zinc-300 dark:to-white text-zinc-100 dark:text-zinc-900",
    iconGradient: "from-amber-600 to-yellow-600 dark:from-amber-500 dark:to-yellow-500",
    glowColor: "amber-500",
    taoistConcept: "天 - 天时地利，顺应天道",
  },
  {
    title: "地利 · 产品",
    titleEn: "Di Li - Products",
    description: "占据地利，构建核心产品资产",
    descriptionEn: "Geographic advantage, core product assets",
    href: "/product",
    iconChar: "地",
    gradient:
      "from-zinc-800 via-zinc-900 to-black dark:from-zinc-200 dark:via-zinc-300 dark:to-white text-zinc-100 dark:text-zinc-900",
    iconGradient: "from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500",
    glowColor: "emerald-500",
    taoistConcept: "地 - 厚土万里，厚德载物",
  },
  {
    title: "人和 · 模式",
    titleEn: "Ren He - Community",
    description: "凝聚人和，汇聚万千人才之心力",
    descriptionEn: "Human harmony, unite 10,000 creators",
    href: "/user",
    iconChar: "人",
    gradient:
      "from-zinc-800 via-zinc-900 to-black dark:from-zinc-200 dark:via-zinc-300 dark:to-white text-zinc-100 dark:text-zinc-900",
    iconGradient: "from-rose-600 to-pink-600 dark:from-rose-500 dark:to-pink-500",
    glowColor: "rose-500",
    taoistConcept: "人 - 和而不同，成人达己",
  },
  {
    title: "神韵 · 内容",
    titleEn: "Shen Yun - Content",
    description: "铸造 IP 灵魂，创作直抵人心之作",
    descriptionEn: "Divine charm, content that touches hearts",
    href: "/content-factory",
    iconChar: "神",
    gradient:
      "from-zinc-800 via-zinc-900 to-black dark:from-zinc-200 dark:via-zinc-300 dark:to-white text-zinc-100 dark:text-zinc-900",
    iconGradient: "from-purple-600 to-fuchsia-600 dark:from-purple-500 dark:to-fuchsia-500",
    glowColor: "purple-500",
    taoistConcept: "神 - 出神入化，炉火纯青",
  },
  {
    title: "财库 · 成交",
    titleEn: "Cai Ku - Conversion",
    description: "通达财库，实现商业价值变现",
    descriptionEn: "Financial flow, convert value to revenue",
    href: "/finance",
    iconChar: "财",
    gradient:
      "from-zinc-800 via-zinc-900 to-black dark:from-zinc-200 dark:via-zinc-300 dark:to-white text-zinc-100 dark:text-zinc-900",
    iconGradient: "from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500",
    glowColor: "amber-500",
    badge: "核心枢纽",
    taoistConcept: "财 - 君子爱财，取之有道",
  },
  {
    title: "法度 · 管理",
    titleEn: "Fa Du - Management",
    description: "建立法度，构建可持续系统架构",
    descriptionEn: "System rules, sustainable business architecture",
    href: "/rule",
    iconChar: "法",
    gradient:
      "from-zinc-800 via-zinc-900 to-black dark:from-zinc-200 dark:via-zinc-300 dark:to-white text-zinc-100 dark:text-zinc-900",
    iconGradient: "from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500",
    glowColor: "indigo-500",
    taoistConcept: "法 - 道法自然，无为而治",
  },
];

export default function HomePage() {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <FadeIn>
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0a0a0a] relative overflow-hidden transition-colors duration-500 selection:bg-indigo-500/30">
        {/* 背景光晕装饰 */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 dark:bg-amber-600/5 blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-500/10 dark:bg-zinc-600/5 blur-[120px] pointer-events-none mix-blend-screen" />

        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] dark:opacity-[0.03] pointer-events-none mix-blend-overlay" />

        {/* 顶部控制栏 */}
        <div className="absolute top-0 right-0 p-6 z-50">
          <button
            onClick={() => setTheme(actualTheme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-full bg-white/50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 dark:border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white dark:hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-sm"
            title="切换主题"
          >
            <span className="material-symbols-outlined text-zinc-500 dark:text-zinc-400 text-xl">
              {actualTheme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10 max-w-7xl">
          {/* Header */}
          <div className="mb-24 space-y-10 flex flex-col items-center justify-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100/80 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 dark:border-white/10 backdrop-blur-md mb-4 shadow-sm">
              <Hexagon className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300 tracking-wider uppercase font-sans">
                SPS OS 1.0
              </span>
            </div>

            <div className="space-y-6 relative">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-sans">
                <span className="text-zinc-900 dark:text-zinc-50 dark:text-white drop-shadow-sm">
                  六脉
                </span>
                <span className="bg-linear-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent drop-shadow-sm ml-1">
                  增长系统
                </span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 dark:text-zinc-400 font-medium tracking-wide max-w-2xl mx-auto leading-relaxed">
                天地人神财法 · 东方智慧驱动的 AI原生商业协同网络
              </p>
            </div>

            <div className="max-w-2xl mx-auto py-5 px-8 bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-slate-200/20 dark:shadow-black/40 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <p className="text-zinc-700 dark:text-zinc-300 italic leading-relaxed text-lg mb-2 relative z-10">
                “人法地，地法天，天法道，道法自然”
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans tracking-wide relative z-10">
                — 《道德经》
              </p>
            </div>
          </div>

          {/* Module Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {modules.map((module) => (
              <Link key={module.href} href={module.href} className="group outline-none">
                <div
                  className={`relative h-full bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm hover:shadow-xl hover:border-${module.glowColor}/30 dark:hover:border-${module.glowColor}/40 transition-all duration-500 hover:-translate-y-1 overflow-hidden flex flex-col`}
                >
                  {/* Hover Background Glow */}
                  <div
                    className={`absolute top-0 right-0 w-48 h-48 bg-${module.glowColor}/10 dark:bg-${module.glowColor}/20 rounded-full blur-[60px] translate-x-10 -translate-y-10 group-hover:blur-[80px] group-hover:bg-${module.glowColor}/20 transition-all duration-700 pointer-events-none`}
                  ></div>

                  <div className="flex items-start gap-5 relative z-10 mb-6">
                    <ChineseIcon char={module.iconChar} gradient={module.iconGradient} />
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="text-xl font-bold font-sans tracking-wide text-zinc-800 dark:text-zinc-100 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                          {module.title}
                        </h2>
                        {module.badge && (
                          <span className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md border border-amber-200 dark:border-amber-500/20">
                            {module.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-sans text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 uppercase tracking-normal">
                        {module.titleEn}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-300 dark:text-zinc-400 leading-relaxed mb-8 flex-1 relative z-10 group-hover:text-zinc-700 dark:text-zinc-200 dark:group-hover:text-zinc-300 transition-colors">
                    {module.description}
                  </p>

                  <div className="flex items-center justify-between pt-5 border-t border-zinc-200 dark:border-zinc-800 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100/50 dark:bg-white/5 rounded-lg border border-transparent group-hover:border-zinc-200 dark:group-hover:border-white/10 transition-colors">
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-linear-to-br ${module.iconGradient}`}
                      ></div>
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                        {module.taoistConcept}
                      </span>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-white/5 group-hover:bg-linear-to-br ${module.iconGradient} transition-all duration-300 shadow-sm`}
                    >
                      <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Call to action or philosophy */}
          <div className="mt-24 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 dark:text-zinc-600 font-sans tracking-normal uppercase mb-2">
              Powered by Advanced Agentic Matrix
            </p>
            <div className="inline-block w-12 h-1 rounded-full bg-linear-to-r from-transparent via-slate-300 dark:via-zinc-700 to-transparent"></div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
