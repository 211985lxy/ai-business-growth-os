/**
 * Markdown Renderer
 * Lobe Chat style Markdown component with syntax highlighting
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";

export interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className = "" }: MarkdownProps) {
  // Check if using light theme (markdown-content class)
  const isLightTheme = className.includes("markdown-content");

  return (
    <div
      className={`${className} select-text`}
      style={{
        WebkitUserSelect: "text",
        MozUserSelect: "text",
        msUserSelect: "text",
        userSelect: "text",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeStringify,
          [
            rehypeHighlight,
            {
              detect: true,
              subset: [
                "typescript",
                "javascript",
                "css",
                "html",
                "json",
                "bash",
                "python",
                "java",
                "cpp",
              ],
            },
          ],
        ]}
        components={{
          // Code blocks with syntax highlighting - 优化代码块样式
          pre: ({ node: _node, children, ...props }: any) => (
            <pre className="bg-zinc-900 rounded-xl p-5 my-6 overflow-x-auto border border-slate-700 shadow-lg text-sm">
              {children}
            </pre>
          ),
          // Inline code
          code: ({ node: _node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code
                className="bg-zinc-100 px-2 py-1 rounded-md text-sm font-mono text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Tables - 优化表格样式
          table: ({ node: _node, ...props }) => (
            <div className="my-8 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200" {...props} />
            </div>
          ),
          thead: ({ node: _node, ...props }) => (
            <thead className="bg-linear-to-r from-slate-50 to-slate-100" {...props} />
          ),
          tbody: ({ node: _node, ...props }) => (
            <tbody className="divide-y divide-slate-200 bg-white" {...props} />
          ),
          tr: ({ node: _node, ...props }) => (
            <tr className="hover:bg-zinc-50 transition-colors" {...props} />
          ),
          th: ({ node: _node, ...props }) => (
            <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700 dark:text-zinc-200" {...props} />
          ),
          td: ({ node: _node, ...props }) => (
            <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-200" {...props} />
          ),
          // Links
          a: ({ node: _node, href, children, ...props }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-700 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          // Blockquotes - 优化引用样式
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500 pl-6 py-4 my-6 bg-zinc-50 rounded-r-lg italic text-zinc-700 dark:text-zinc-200 shadow-sm"
              {...props}
            />
          ),
          // Lists - 优化列表排版
          ul: ({ node: _node, ...props }) => (
            <ul
              className="list-disc list-inside my-4 space-y-2 text-zinc-700 dark:text-zinc-200 marker:text-zinc-500 dark:text-zinc-400"
              {...props}
            />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol
              className="list-decimal list-inside my-4 space-y-2 text-zinc-700 dark:text-zinc-200 marker:text-zinc-500 dark:text-zinc-400"
              {...props}
            />
          ),
          li: ({ node: _node, ...props }) => <li className="text-base leading-7 pl-1" {...props} />,
          // Headings - 优化标题层次和间距
          h1: ({ node: _node, ...props }) => (
            <h1
              className="text-3xl font-bold mb-6 mt-8 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
              {...props}
            />
          ),
          h2: ({ node: _node, ...props }) => (
            <h2 className="text-2xl font-bold mb-4 mt-8 text-zinc-900 dark:text-zinc-50" {...props} />
          ),
          h3: ({ node: _node, ...props }) => (
            <h3 className="text-xl font-semibold mb-3 mt-6 text-zinc-900 dark:text-zinc-50" {...props} />
          ),
          h4: ({ node: _node, ...props }) => (
            <h4 className="text-lg font-semibold mb-2 mt-4 text-zinc-900 dark:text-zinc-50" {...props} />
          ),
          h5: ({ node: _node, ...props }) => (
            <h5 className="text-base font-semibold mb-2 mt-4 text-zinc-900 dark:text-zinc-50" {...props} />
          ),
          h6: ({ node: _node, ...props }) => (
            <h6 className="text-sm font-semibold mb-2 mt-4 text-zinc-600 dark:text-zinc-300" {...props} />
          ),
          // Paragraphs - 优化行高和阅读体验
          p: ({ node: _node, ...props }) => (
            <p className="mb-4 text-base text-zinc-700 dark:text-zinc-200 leading-7" {...props} />
          ),
          // Horizontal rule
          hr: ({ node: _node, ...props }) => <hr className="my-8 border-zinc-300 dark:border-zinc-700" {...props} />,
          // Strong/Bold
          strong: ({ node: _node, ...props }) => (
            <strong className="font-semibold text-zinc-900 dark:text-zinc-50" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
