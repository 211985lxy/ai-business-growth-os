"use client";

import { useState } from "react";

export default function DesignPreviewPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="lobe-preview min-h-screen bg-page text-primary font-sans antialiased p-8 md:p-12 transition-colors duration-300">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .lobe-preview {
          /* Brand */
          --color-brand-500: #f59e0b;
          --color-brand-600: #d97706;
          --color-brand-700: #b45309;

          /* Semantic (Dark Mode Defaults) */
          --color-success-subtle:   rgba(34,197,94,0.1);
          --color-success-text:     #22c55e;
          --color-success-border:   rgba(34,197,94,0.2);

          --color-warning-subtle:   rgba(249,115,22,0.1);
          --color-warning-text:     #f97316;
          --color-warning-border:   rgba(249,115,22,0.2);

          --color-error-subtle:     rgba(239,68,68,0.1);
          --color-error-text:       #ef4444;
          --color-error-border:     rgba(239,68,68,0.2);

          --color-info-subtle:      rgba(59,130,246,0.1);
          --color-info-text:        #3b82f6;
          --color-info-border:      rgba(59,130,246,0.2);

          /* Neutral Dark */
          --bg-page:        #09090b; /* zinc-950 */
          --bg-surface:     #18181b; /* zinc-900 */
          --border-default: rgba(255,255,255,0.08);

          --text-primary:   #fafafa; /* zinc-50 */
          --text-secondary: #a1a1aa; /* zinc-400 */

          /* Shadows */
          --shadow-xs:    0 1px 2px rgba(0,0,0,0.5);
          --shadow-md:    0 4px 16px rgba(0,0,0,0.4);
          --shadow-lg:    0 8px 32px rgba(0,0,0,0.5);
          --shadow-brand: 0 4px 20px rgba(245,158,11,0.25);
          --shadow-brand-lg: 0 8px 40px rgba(245,158,11,0.35);

          /* Easing & Durations*/
          --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
          --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
          --duration-normal: 200ms;
        }

        .lobe-preview.bg-page { background-color: var(--bg-page); }
        .lobe-preview .bg-surface { background-color: var(--bg-surface); }
        .lobe-preview .border-default { border-color: var(--border-default); }
        .lobe-preview .text-primary { color: var(--text-primary); }
        .lobe-preview .text-secondary { color: var(--text-secondary); }

        @keyframes shimmer-custom {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .lobe-preview .animate-shimmer-custom {
          animation: shimmer-custom 1.5s infinite linear;
          background: linear-gradient(90deg, #27272a 25%, #3f3f46 50%, #27272a 75%);
          background-size: 200% 100%;
        }

        @keyframes fade-up-custom {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .lobe-preview .animate-fade-up-custom { animation: fade-up-custom 0.5s var(--ease-out-expo) forwards; }

        @keyframes fade-in-custom {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .lobe-preview .animate-fade-in-custom { animation: fade-in-custom 0.3s var(--ease-out-expo) forwards; }

        @keyframes scale-in-custom {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .lobe-preview .animate-scale-in-custom { animation: scale-in-custom 0.4s var(--ease-spring) forwards; }
      `,
        }}
      />

      <div className="max-w-5xl mx-auto space-y-16">
        <header className="space-y-3 animate-fade-up-custom" style={{ animationDelay: "0ms" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold tracking-normal uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Isolated Sandbox
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-sans">
            Lobe Hub Design System{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Preview
            </span>
          </h1>
          <p className="text-secondary text-lg max-w-2xl leading-relaxed">
            这是一个完全隔离的安全沙盒。我们抽取了核心的 CSS
            变量、光影层级、和物理回弹曲线，供您预览接下来整个系统即将拥有的“顶级质感”。
          </p>
        </header>

        {/* 1. 语义色彩 Toast */}
        <section className="space-y-6 animate-fade-up-custom" style={{ animationDelay: "100ms" }}>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-primary font-sans">
              1. 语义色彩体系 (Semantic Colors)
            </h2>
            <p className="text-secondary text-sm">
              严格的三层级色彩构建，背景低饱和度 + 边框中饱和度 + 高亮文本色，绝不含糊。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["success", "warning", "error", "info"].map((type, i) => (
              <div
                key={type}
                className="animate-fade-up-custom flex items-center gap-4"
                style={{
                  animationDelay: `${200 + i * 50}ms`,
                  backgroundColor: `var(--color-${type}-subtle)`,
                  border: `1px solid var(--color-${type}-border)`,
                  borderRadius: "12px",
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{ color: `var(--color-${type}-text)` }}
                  className="p-2 rounded-full bg-white/5"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {type === "success" && <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />}
                    {type === "success" && <polyline points="22 4 12 14.01 9 11.01" />}
                    {type === "warning" && (
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    )}
                    {type === "warning" && <line x1="12" y1="9" x2="12" y2="13" />}
                    {type === "warning" && <line x1="12" y1="17" x2="12.01" y2="17" />}
                    {type === "error" && <circle cx="12" cy="12" r="10" />}
                    {type === "error" && <line x1="15" y1="9" x2="9" y2="15" />}
                    {type === "error" && <line x1="9" y1="9" x2="15" y2="15" />}
                    {type === "info" && <circle cx="12" cy="12" r="10" />}
                    {type === "info" && <line x1="12" y1="16" x2="12" y2="12" />}
                    {type === "info" && <line x1="12" y1="8" x2="12.01" y2="8" />}
                  </svg>
                </div>
                <div>
                  <div
                    className="font-semibold capitalize text-base"
                    style={{ color: `var(--color-${type}-text)` }}
                  >
                    {type} Operation
                  </div>
                  <div
                    className="text-sm opacity-90 mt-0.5"
                    style={{ color: `var(--color-${type}-text)` }}
                  >
                    This action completed with {type} status.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 光影交互与按钮 */}
        <section className="space-y-6 animate-fade-up-custom" style={{ animationDelay: "200ms" }}>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-primary font-sans">
              2. 光影交互与按钮 (Shadows & Ease-Spring)
            </h2>
            <p className="text-secondary text-sm">
              彻底告别单调的 <code>ease-in-out</code>，采用顶级弹性曲线 `ease-spring` 与动态光晕。
            </p>
          </div>
          <div className="flex flex-wrap gap-8 items-center bg-surface border border-default p-8 rounded-2xl">
            {/* 品牌按钮 */}
            <button className="relative px-8 py-3.5 bg-[var(--color-brand-500)] text-white font-semibold text-base rounded-xl shadow-[var(--shadow-brand)] transition-all duration-[var(--duration-normal)] ease-[var(--ease-spring)] hover:bg-[var(--color-brand-600)] hover:-translate-y-1 hover:shadow-[var(--shadow-brand-lg)] active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bg-page)] outline-none">
              Primary Brand Action
            </button>

            {/* 卡片 Hover */}
            <div className="bg-page border border-default rounded-xl p-5 w-72 text-primary cursor-pointer transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 hover:border-zinc-700">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center mb-3">
                ✨
              </div>
              <h3 className="font-semibold text-base mb-1">Hover Dynamic Card</h3>
              <p className="text-secondary text-xs leading-relaxed">
                Experience the 200ms ease-out-expo smooth elevation. The shadow becomes deeper (md).
              </p>
            </div>
          </div>
        </section>

        {/* 3. 骨架屏 */}
        <section className="space-y-6 animate-fade-up-custom" style={{ animationDelay: "300ms" }}>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-primary font-sans">
              3. 沉浸式占位加载 (Skeleton Shimmer)
            </h2>
            <p className="text-secondary text-sm">
              AI 生成长文时的优雅等待，消除焦躁感的三色横向渐变扫光。
            </p>
          </div>
          <div className="bg-surface border border-default rounded-2xl p-8 w-full max-w-2xl space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full animate-shimmer-custom shrink-0" />
              <div className="space-y-3 w-full">
                <div className="h-4 w-1/3 rounded-md animate-shimmer-custom" />
                <div className="h-3 w-1/4 rounded-md animate-shimmer-custom" />
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="h-3 w-full rounded-md animate-shimmer-custom" />
              <div className="h-3 w-[95%] rounded-md animate-shimmer-custom" />
              <div className="h-3 w-3/4 rounded-md animate-shimmer-custom" />
            </div>
          </div>
        </section>

        {/* 4. 焦点光环与表单 */}
        <section className="space-y-6 animate-fade-up-custom" style={{ animationDelay: "400ms" }}>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-primary font-sans">
              4. 焦点光环 (Focus Rings & Accessibility)
            </h2>
            <p className="text-secondary text-sm">
              表单输入时的优雅反馈，双层立体发光边框，完美适配暗色深背景。
            </p>
          </div>
          <div className="bg-surface border border-default rounded-2xl p-8 w-full max-w-2xl">
            <label className="text-[11px] font-bold text-secondary uppercase tracking-normal font-sans mb-2 block">
              Design Title
            </label>
            <input
              type="text"
              placeholder="Click to focus me to see the brand ring overlay..."
              className="w-full px-4 py-3.5 bg-page border border-default rounded-xl text-primary placeholder:text-zinc-600 focus-visible:outline-none focus-visible:border-amber-500 focus-visible:ring-4 focus-visible:ring-amber-500/15 transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]"
            />
          </div>
        </section>

        {/* 5. Modal 入场 */}
        <section
          className="space-y-6 animate-fade-up-custom pb-24"
          style={{ animationDelay: "500ms" }}
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-primary font-sans">
              5. Z层级与模态框入场 (Layers & Modal)
            </h2>
            <p className="text-secondary text-sm">
              结合 <code>z-overlay</code> 与 <code>z-modal</code>，以及独特的缩放入场动画。
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 bg-surface border border-default text-primary rounded-xl font-medium hover:bg-[#27272a] transition-colors shadow-[var(--shadow-xs)] hover:shadow-md"
          >
            Launch Modal Overlay
          </button>
        </section>
      </div>

      {modalOpen && (
        <div className="lobe-preview">
          {/* 这里 Z-index 直接写死测试层级 */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] animate-fade-in-custom"
            onClick={() => setModalOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[400] pointer-events-none p-4 md:p-6">
            <div className="pointer-events-auto bg-surface border border-default rounded-[1.25rem] shadow-[var(--shadow-xl)] w-full max-w-lg p-6 md:p-8 animate-scale-in-custom">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-5 border border-amber-500/20 text-amber-500">
                ✨
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3 font-sans">
                Modal Depth & Scale-in
              </h3>
              <p className="text-secondary mb-8 leading-relaxed text-[15px]">
                This modal uses the{" "}
                <code className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded text-sm">
                  ease-spring
                </code>{" "}
                curve. Notice the dramatic shadow-xl and the subtle background blur overlay
                separating it completely from the z-0 page context.
              </p>
              <div className="flex justify-end gap-3 pt-2 border-t border-default/50">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-secondary hover:bg-page hover:text-primary transition-all font-medium"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] rounded-xl shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-[var(--duration-normal)] ease-[var(--ease-spring)] font-semibold"
                >
                  Confirm Beauty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
