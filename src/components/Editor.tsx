'use client';

import { useState, useEffect } from 'react';
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
  Strikethrough, Quote, Code, FileCode2, Heading1, Heading2, 
  Heading3, Minus 
} from 'lucide-react';


interface EditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
  const [, setUpdateTrigger] = useState(0);

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
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[60vh] w-full p-4 border border-[var(--border)] rounded-b-md bg-[var(--card)] focus:outline-none',
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
      editor.commands.setContent(content, false);
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

  const getBtnClass = (isActive: boolean) => {
    return `p-2 rounded transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border border-blue-500 scale-95' 
        : 'text-gray-400 hover:bg-[#333] hover:text-white border border-transparent'
    }`;
  };

  return (
    <div className="w-full flex flex-col mt-4">
      <div className="flex flex-wrap gap-2 p-2 border border-b-0 border-[var(--border)] rounded-t-md bg-[#222]">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={getBtnClass(editor.isActive('heading', { level: 1 }))}
          title="Heading 1"
          type="button"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={getBtnClass(editor.isActive('heading', { level: 2 }))}
          title="Heading 2"
          type="button"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={getBtnClass(editor.isActive('heading', { level: 3 }))}
          title="Heading 3"
          type="button"
        >
          <Heading3 size={18} />
        </button>
        <div className="w-px h-6 bg-[#444] self-center mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={getBtnClass(editor.isActive('bold'))}
          title="Bold"
          type="button"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={getBtnClass(editor.isActive('italic'))}
          title="Italic"
          type="button"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={getBtnClass(editor.isActive('underline'))}
          title="Underline"
          type="button"
        >
          <UnderlineIcon size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={getBtnClass(editor.isActive('strike'))}
          title="Strikethrough"
          type="button"
        >
          <Strikethrough size={18} />
        </button>
        
        <div className="w-px h-6 bg-[#444] self-center mx-1" />
        
        <button
          onClick={addLink}
          className={getBtnClass(editor.isActive('link'))}
          title="Link"
          type="button"
        >
          <LinkIcon size={18} />
        </button>
        <button
          onClick={addImage}
          className={getBtnClass(false)}
          title="Image"
          type="button"
        >
          <ImageIcon size={18} />
        </button>
        <div className="w-px h-6 bg-[#444] self-center mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={getBtnClass(editor.isActive('blockquote'))}
          title="Blockquote"
          type="button"
        >
          <Quote size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={getBtnClass(editor.isActive('code'))}
          title="Inline Code"
          type="button"
        >
          <Code size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={getBtnClass(editor.isActive('codeBlock'))}
          title="Code Block"
          type="button"
        >
          <FileCode2 size={18} />
        </button>
        <div className="w-px h-6 bg-[#444] self-center mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={getBtnClass(editor.isActive('bulletList'))}
          title="Bullet List"
          type="button"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={getBtnClass(editor.isActive('orderedList'))}
          title="Ordered List"
          type="button"
        >
          <ListOrdered size={18} />
        </button>
        <div className="w-px h-6 bg-[#444] self-center mx-1" />
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-[#333] transition-colors"
          title="Horizontal Rule (Divider)"
          type="button"
        >
          <Minus size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="p-2 rounded hover:bg-[#333] transition-colors flex items-center gap-1 text-sm"
          title="Insert Table"
          type="button"
        >
          <TableIcon size={18} /> Таблица
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
