import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface Props {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: Props) {
  return (
    <div
      className={`prose prose-invert prose-amber max-w-none
        prose-headings:font-serif prose-headings:text-amber-100
        prose-p:text-slate-300
        prose-a:text-amber-400 prose-a:hover:text-amber-300
        prose-strong:text-amber-200
        prose-code:text-amber-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded
        prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
        prose-blockquote:border-amber-600 prose-blockquote:text-slate-400
        prose-li:text-slate-300
        prose-hr:border-slate-700
        ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
