import { forwardRef, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MarkdownEditorProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  rows?: number;
  className?: string;
}

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  function MarkdownEditor({ rows = 4, className = '', ...textareaProps }, forwardedRef) {
    const { t: tc } = useTranslation('common');
    const [preview, setPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const innerRef = useRef<HTMLTextAreaElement>(null);

    const combinedRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (innerRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [forwardedRef],
    );

    const showPreview = () => {
      setPreviewContent(innerRef.current?.value ?? '');
      setPreview(true);
    };

    return (
      <div className={`border border-slate-700 rounded-md overflow-hidden ${className}`}>
        <div className="flex border-b border-slate-700 bg-slate-900">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`px-3 py-1.5 text-xs transition-colors ${
              !preview ? 'text-amber-300 bg-slate-800' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            {tc('markdown_editor.write')}
          </button>
          <button
            type="button"
            onClick={showPreview}
            className={`px-3 py-1.5 text-xs transition-colors ${
              preview ? 'text-amber-300 bg-slate-800' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            {tc('markdown_editor.preview')}
          </button>
        </div>

        <textarea
          ref={combinedRef}
          rows={rows}
          {...textareaProps}
          className={`w-full bg-slate-800 px-3 py-2 text-slate-200 text-sm font-mono focus:outline-none focus:ring-inset focus:ring-2 focus:ring-amber-500 resize-y${preview ? ' hidden' : ''}`}
        />

        {preview && (
          <div className="bg-slate-800 min-h-[6rem] px-3 py-2">
            {previewContent ? (
              <MarkdownRenderer content={previewContent} />
            ) : (
              <p className="text-slate-600 text-sm italic">{tc('markdown_editor.empty')}</p>
            )}
          </div>
        )}
      </div>
    );
  },
);
