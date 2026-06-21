'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { 
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, 
  Image as ImageIcon, Table as TableIcon, List, ListOrdered, 
  Strikethrough, Quote, Code, FileCode2, ChevronDown, Upload, 
  Globe, Link2Off, Minus
} from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
  const [, setUpdateTrigger] = useState(0);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showImageDropdown, setShowImageDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: () => {
      setUpdateTrigger(v => v + 1);
    },
    onTransaction: () => {
      setUpdateTrigger(v => v + 1);
    },
    onFocus: () => {
      setUpdateTrigger(v => v + 1);
    },
    onBlur: () => {
      setUpdateTrigger(v => v + 1);
    },
    editorProps: {
      attributes: {
        class: 'tiptap w-full p-4 min-h-[350px] focus:outline-none max-w-none',
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              const formData = new FormData();
              formData.append('file', file);
              fetch('/api/upload', { method: 'POST', body: formData })
                .then((res) => res.json())
                .then((data) => {
                  if (data.url) {
                    const node = view.state.schema.nodes.image.create({ src: data.url });
                    const transaction = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  }
                })
                .catch(console.error);
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.indexOf('image') === 0) {
            event.preventDefault();
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const formData = new FormData();
            formData.append('file', file);
            fetch('/api/upload', { method: 'POST', body: formData })
              .then((res) => res.json())
              .then((data) => {
                if (data.url) {
                  const node = view.state.schema.nodes.image.create({ src: data.url });
                  const transaction = view.state.tr.insert(coordinates?.pos || view.state.selection.to, node);
                  view.dispatch(transaction);
                }
              })
              .catch(console.error);
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false as any);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL картинки:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('URL ссылки:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        }
      } catch (err) {
        console.error('Ошибка загрузки:', err);
      }
    }
    if (e.target) e.target.value = '';
  };

  const getBtnClass = (isActive: boolean) => {
    return `p-1.5 rounded transition-all duration-150 flex items-center justify-center ${
      isActive 
        ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-medium scale-95' 
        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-transparent'
    }`;
  };

  const getActiveHeadingLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Заголовок 1';
    if (editor.isActive('heading', { level: 2 })) return 'Заголовок 2';
    if (editor.isActive('heading', { level: 3 })) return 'Заголовок 3';
    return 'Текст';
  };

  // Text Stats
  const editorText = editor.getText();
  const charCount = editorText.length;
  const charCountNoSpaces = editorText.replace(/\s/g, '').length;
  const wordCount = editorText.trim() === '' ? 0 : editorText.trim().split(/\s+/).length;

  return (
    <div 
      className={`w-full flex flex-col border rounded-lg transition-all duration-200 bg-[var(--bg-primary)] ${
        editor.isFocused 
          ? 'border-[var(--accent)] ring-2 ring-[rgba(35,131,226,0.14)]' 
          : 'border-[var(--border-default)] shadow-sm'
      }`}
    >
      {/* Hidden file input for image uploading */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Sticky Header Wrapper */}
      <div className="sticky top-0 z-10 flex flex-col border-b border-[var(--border-default)] bg-[var(--bg-secondary)] select-none rounded-t-[7px]">
        
        {/* Main Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[var(--bg-secondary)]">
          
          {/* Block Type Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHeadingMenu(!showHeadingMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors border border-[var(--border-default)] bg-[var(--bg-primary)]"
            >
              <span>{getActiveHeadingLabel()}</span>
              <ChevronDown size={12} className="text-[var(--text-secondary)]" />
            </button>
            {showHeadingMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowHeadingMenu(false)} />
                <div className="absolute left-0 mt-1 w-40 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded shadow-md z-20 py-1">
                  <button
                    type="button"
                    onClick={() => { editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)] ${editor.isActive('paragraph') && !editor.isActive('heading') ? 'text-[var(--accent)] font-semibold bg-[var(--accent-bg)]' : 'text-[var(--text-primary)]'}`}
                  >
                    Обычный текст
                  </button>
                  <button
                    type="button"
                    onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowHeadingMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)] ${editor.isActive('heading', { level: 1 }) ? 'text-[var(--accent)] font-semibold bg-[var(--accent-bg)]' : 'text-[var(--text-primary)]'}`}
                  >
                    Заголовок 1
                  </button>
                  <button
                    type="button"
                    onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowHeadingMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)] ${editor.isActive('heading', { level: 2 }) ? 'text-[var(--accent)] font-semibold bg-[var(--accent-bg)]' : 'text-[var(--text-primary)]'}`}
                  >
                    Заголовок 2
                  </button>
                  <button
                    type="button"
                    onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowHeadingMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-hover)] ${editor.isActive('heading', { level: 3 }) ? 'text-[var(--accent)] font-semibold bg-[var(--accent-bg)]' : 'text-[var(--text-primary)]'}`}
                  >
                    Заголовок 3
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-5 bg-[var(--border-default)] mx-1 self-center" />

          {/* Text Formatting Segment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={getBtnClass(editor.isActive('bold'))}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={getBtnClass(editor.isActive('italic'))}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={getBtnClass(editor.isActive('underline'))}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={getBtnClass(editor.isActive('strike'))}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>

          <div className="w-px h-5 bg-[var(--border-default)] mx-1 self-center" />

          {/* Links & Media Segment */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={addLink}
              className={getBtnClass(editor.isActive('link'))}
              title={editor.isActive('link') ? "Редактировать ссылку" : "Вставить ссылку"}
            >
              <LinkIcon size={16} />
            </button>
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                className="p-1.5 rounded hover:bg-[var(--danger-bg)] text-[var(--danger)] transition-colors flex items-center justify-center border border-transparent"
                title="Удалить ссылку"
              >
                <Link2Off size={16} />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowImageDropdown(!showImageDropdown)}
              className={getBtnClass(editor.isActive('image'))}
              title="Изображение"
            >
              <ImageIcon size={16} />
            </button>
            {showImageDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowImageDropdown(false)} />
                <div className="absolute left-0 mt-1 w-48 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded shadow-md z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-100">
                  <button
                    type="button"
                    onClick={() => { fileInputRef.current?.click(); setShowImageDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex items-center gap-2"
                  >
                    <Upload size={13} className="text-[var(--text-secondary)]" />
                    Загрузить с устройства
                  </button>
                  <button
                    type="button"
                    onClick={() => { addImage(); setShowImageDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex items-center gap-2"
                  >
                    <Globe size={13} className="text-[var(--text-secondary)]" />
                    Вставить по ссылке
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-5 bg-[var(--border-default)] mx-1 self-center" />

          {/* Blocks & Lists Segment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={getBtnClass(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={getBtnClass(editor.isActive('orderedList'))}
            title="Ordered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={getBtnClass(editor.isActive('blockquote'))}
            title="Blockquote"
          >
            <Quote size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={getBtnClass(editor.isActive('code'))}
            title="Inline Code"
          >
            <Code size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={getBtnClass(editor.isActive('codeBlock'))}
            title="Code Block"
          >
            <FileCode2 size={16} />
          </button>
          
          <div className="w-px h-5 bg-[var(--border-default)] mx-1 self-center" />

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={getBtnClass(false)}
            title="Horizontal Rule"
          >
            <Minus size={16} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className={getBtnClass(editor.isActive('table'))}
            title="Insert Table"
          >
            <TableIcon size={16} />
          </button>
        </div>

        {/* Secondary Table Toolbar */}
        {editor.isActive('table') && (
          <div className="flex flex-wrap items-center gap-1 px-3 py-1.5 bg-[var(--bg-secondary)] border-t border-[var(--border-default)] text-xs text-[var(--text-secondary)] animate-in slide-in-from-top-1 duration-150 select-none">
            <span className="font-semibold px-1.5 py-0.5 text-[9px] uppercase tracking-wider bg-[var(--bg-active)] rounded text-[var(--text-tertiary)] mr-1.5">Таблица</span>
            <button 
              type="button"
              onClick={() => editor.chain().focus().addRowBefore().run()} 
              className="px-2 py-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-black transition-colors"
            >
              Строка ↑
            </button>
            <button 
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()} 
              className="px-2 py-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-black transition-colors"
            >
              Строка ↓
            </button>
            <button 
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()} 
              className="px-2 py-1 rounded hover:bg-[var(--danger-bg)] text-[var(--danger)] transition-colors"
            >
              Удалить строку
            </button>
            <div className="w-px h-4 bg-[var(--border-default)] mx-1.5" />
            <button 
              type="button"
              onClick={() => editor.chain().focus().addColumnBefore().run()} 
              className="px-2 py-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-black transition-colors"
            >
              Колонка ←
            </button>
            <button 
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()} 
              className="px-2 py-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-black transition-colors"
            >
              Колонка →
            </button>
            <button 
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()} 
              className="px-2 py-1 rounded hover:bg-[var(--danger-bg)] text-[var(--danger)] transition-colors"
            >
              Удалить колонку
            </button>
            <div className="w-px h-4 bg-[var(--border-default)] mx-1.5" />
            <button 
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()} 
              className="px-2 py-1 rounded hover:bg-[var(--danger-bg)] text-[var(--danger)] font-medium transition-colors"
            >
              Удалить таблицу
            </button>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 border-t border-[var(--border-default)] bg-[var(--bg-secondary)] text-[11px] text-[var(--text-tertiary)] select-none rounded-b-[7px]">
        <div className="flex gap-4">
          <span>Слов: <strong className="text-[var(--text-secondary)]">{wordCount}</strong></span>
          <span>Символов: <strong className="text-[var(--text-secondary)]">{charCount}</strong> <span className="opacity-70">(без пробелов: {charCountNoSpaces})</span></span>
        </div>
        <div className="hidden sm:block">
          <span className="opacity-70">Форматирование Tiptap / Markdown</span>
        </div>
      </div>
    </div>
  );
}

