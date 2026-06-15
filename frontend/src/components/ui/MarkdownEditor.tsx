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

    const applyFormat = (format: string) => {
      const textarea = innerRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const sel = textarea.value.slice(start, end);
      const before = textarea.value.slice(0, start);
      const after = textarea.value.slice(end);

      const needsNewline = before.length > 0 && !before.endsWith('\n');

      let insert = '';
      let cursorOffset = 0;
      let selLength = 0;

      switch (format) {
        case 'h1': {
          const prefix = needsNewline ? '\n# ' : '# ';
          insert = prefix + (sel || 'Encabezado 1');
          cursorOffset = prefix.length;
          selLength = sel ? sel.length : 'Encabezado 1'.length;
          break;
        }
        case 'h2': {
          const prefix = needsNewline ? '\n## ' : '## ';
          insert = prefix + (sel || 'Encabezado 2');
          cursorOffset = prefix.length;
          selLength = sel ? sel.length : 'Encabezado 2'.length;
          break;
        }
        case 'h3': {
          const prefix = needsNewline ? '\n### ' : '### ';
          insert = prefix + (sel || 'Encabezado 3');
          cursorOffset = prefix.length;
          selLength = sel ? sel.length : 'Encabezado 3'.length;
          break;
        }
        case 'bold':
          insert = `**${sel || 'negrita'}**`;
          cursorOffset = 2;
          selLength = sel ? sel.length : 'negrita'.length;
          break;
        case 'italic':
          insert = `*${sel || 'cursiva'}*`;
          cursorOffset = 1;
          selLength = sel ? sel.length : 'cursiva'.length;
          break;
        case 'code':
          insert = `\`${sel || 'código'}\``;
          cursorOffset = 1;
          selLength = sel ? sel.length : 'código'.length;
          break;
        case 'quote': {
          const prefix = needsNewline ? '\n> ' : '> ';
          insert = prefix + (sel || 'cita');
          cursorOffset = prefix.length;
          selLength = sel ? sel.length : 'cita'.length;
          break;
        }
        case 'ul': {
          const prefix = needsNewline ? '\n' : '';
          insert = prefix + (sel
            ? sel.split('\n').map((l) => `- ${l}`).join('\n')
            : '- Elemento');
          cursorOffset = prefix.length + 2;
          selLength = sel ? insert.length - prefix.length : 'Elemento'.length;
          break;
        }
        default:
          return;
      }

      const newValue = before + insert + after;

      const nativeSet = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      nativeSet?.call(textarea, newValue);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      const newStart = start + cursorOffset;
      const newEnd = newStart + selLength;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(newStart, newEnd);
      });
    };

    const btnClass = 'px-1.5 py-0.5 text-xs text-slate-400 hover:text-amber-300 hover:bg-slate-700 rounded transition-colors';

    return (
      <div className={`border border-slate-700 rounded-md overflow-hidden ${className}`}>
        {/* Pestañas */}
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

        {/* Barra de herramientas — solo en modo edición */}
        {!preview && (
          <div className="flex items-center gap-0.5 px-2 py-1 bg-slate-900 border-b border-slate-700 flex-wrap">
            {(['h1', 'h2', 'h3'] as const).map((h) => (
              <button
                key={h}
                type="button"
                title={tc(`markdown_editor.toolbar.${h}`)}
                onClick={() => applyFormat(h)}
                className={`${btnClass} font-mono`}
              >
                {h.toUpperCase()}
              </button>
            ))}
            <span className="w-px h-4 bg-slate-700 mx-1" />
            <button
              type="button"
              title={tc('markdown_editor.toolbar.bold')}
              onClick={() => applyFormat('bold')}
              className={`${btnClass} font-bold`}
            >
              B
            </button>
            <button
              type="button"
              title={tc('markdown_editor.toolbar.italic')}
              onClick={() => applyFormat('italic')}
              className={`${btnClass} italic`}
            >
              I
            </button>
            <span className="w-px h-4 bg-slate-700 mx-1" />
            <button
              type="button"
              title={tc('markdown_editor.toolbar.code')}
              onClick={() => applyFormat('code')}
              className={`${btnClass} font-mono`}
            >
              {'</>'}
            </button>
            <button
              type="button"
              title={tc('markdown_editor.toolbar.quote')}
              onClick={() => applyFormat('quote')}
              className={btnClass}
            >
              ❝
            </button>
            <button
              type="button"
              title={tc('markdown_editor.toolbar.ul')}
              onClick={() => applyFormat('ul')}
              className={btnClass}
            >
              ☰
            </button>
          </div>
        )}

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
