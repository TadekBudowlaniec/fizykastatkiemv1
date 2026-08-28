'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { katexSanitizeSchema } from '@/lib/katexSanitizeSchema';

/** Renderuje treść lekcji (Markdown + GFM + LaTeX $..$/$$..$$ + surowy HTML, sanityzowany). */
export function MarkdownLesson({ content }: { content?: string | null }) {
  return (
    <div className="prose-fs max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        // Kolejność: raw HTML -> KaTeX -> sanityzacja (po katex, ze schematem KaTeX-friendly)
        rehypePlugins={[rehypeRaw, rehypeKatex, [rehypeSanitize, katexSanitizeSchema]]}
      >
        {content ?? ''}
      </ReactMarkdown>
    </div>
  );
}
