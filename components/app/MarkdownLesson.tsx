'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

/** Renderuje treść lekcji (Markdown + GFM + LaTeX $..$/$$..$$ + surowy HTML). */
export function MarkdownLesson({ content }: { content: string }) {
  return (
    <div className="prose-fs max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
