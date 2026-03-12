// pnpm add react-markdown remark-gfm rehype-raw unist-util-visit react-syntax-highlighter
// pnpm add -D @types/unist-util-visit @types/react-syntax-highlighter

"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { visit } from "unist-util-visit";
import { Info, Lightbulb, MessageSquareWarning, TriangleAlert, OctagonAlert, Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const CALLOUT_TYPES = {
  NOTE: { label: "Note", Icon: Info, className: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 [&_svg]:text-blue-500" },
  TIP: { label: "Tip", Icon: Lightbulb, className: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300 [&_svg]:text-green-500" },
  IMPORTANT: { label: "Important", Icon: MessageSquareWarning, className: "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 [&_svg]:text-purple-500" },
  WARNING: { label: "Warning", Icon: TriangleAlert, className: "border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 [&_svg]:text-yellow-500" },
  CAUTION: { label: "Caution", Icon: OctagonAlert, className: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 [&_svg]:text-red-500" },
} as const;

type CalloutType = keyof typeof CALLOUT_TYPES;

function remarkGithubAlerts() {
  return (tree: any) => {
    visit(tree, "blockquote", (node: any) => {
      const firstParagraph = node.children?.[0];
      if (firstParagraph?.type !== "paragraph") return;
      const firstChild = firstParagraph.children?.[0];
      if (firstChild?.type !== "text") return;
      const match = firstChild.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*/i);
      if (!match) return;
      const type = match[1].toUpperCase() as CalloutType;
      firstChild.value = firstChild.value.slice(match[0].length);
      if (!firstChild.value.trim() && firstParagraph.children.length === 1) {
        node.children.shift();
      }
      node.data = node.data ?? {};
      node.data.hProperties = { ...(node.data.hProperties ?? {}), dataCallout: type };
    });
  };
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border border-border overflow-hidden mb-3 last:mb-0">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground">{language || "plaintext"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || "plaintext"}
        PreTag="pre"
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.8125rem",
          lineHeight: "1.6",
          border: "none",
          overflowX: "auto",
          whiteSpace: "pre",
        }}
        codeTagProps={{ style: { background: "transparent", border: "none", padding: 0, whiteSpace: "pre" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none wrap-break-word", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkGithubAlerts]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0 wrap-break-word">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mb-3 mt-5 first:mt-0 wrap-break-word">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-4 first:mt-0 wrap-break-word">{children}</h3>,
          p: ({ children }) => <p className="mb-3 last:mb-0 leading-normal wrap-break-word">{children}</p>,
          ul: ({ children }) => <ul className="list-disc ml-4 mb-3 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-4 mb-3 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="mb-1 last:mb-0 wrap-break-word">{children}</li>,
          pre: ({ children }: any) => {
            const child = Array.isArray(children) ? children[0] : children;
            const childProps = child?.props;
            const language = /language-(\w+)/.exec(childProps?.className || "")?.[1] ?? "";
            const code = String(childProps?.children ?? "").replace(/\n$/, "");
            return <CodeBlock language={language} code={code} />;
          },
          blockquote: ({ children, node, ...props }: any) => {
            const calloutType = node?.properties?.dataCallout as CalloutType | undefined;
            if (calloutType && CALLOUT_TYPES[calloutType]) {
              const { label, Icon, className: calloutClass } = CALLOUT_TYPES[calloutType];
              return (
                <div className={cn("border-l-4 rounded-r-md px-4 py-3 mb-3 last:mb-0 not-italic", calloutClass)}>
                  <div className="flex items-center gap-1.5 font-semibold text-sm mb-1">
                    <Icon className="size-4 shrink-0" />
                    <span>{label}</span>
                  </div>
                  <div className="text-sm [&>p:last-child]:mb-0">{children}</div>
                </div>
              );
            }
            return (
              <blockquote className="border-l-2 border-muted-foreground/20 pl-4 italic mb-3 last:mb-0 wrap-break-word">
                {children}
              </blockquote>
            );
          },
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:text-primary/80 break-all">
              {children}
            </a>
          ),
          img: ({ src, alt }) => <img src={src} alt={alt} className="rounded-lg max-w-full h-auto my-2" />,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3 last:mb-0 max-w-full">
              <table className="min-w-full divide-y divide-border">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="px-3 py-2 text-left text-sm font-medium bg-muted wrap-break-word">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-sm wrap-break-word">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;