'use client';

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import FloatingMenuExtension from '@tiptap/extension-floating-menu';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Strikethrough, LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  icon: LucideIcon;
  title: string;
}

const MenuButton = ({ onClick, isActive = false, icon: Icon, title }: MenuButtonProps) => (
  <button
    onClick={onClick}
    className={`p-1.5 rounded-lg transition-colors ${
      isActive 
        ? 'bg-indigo-500 text-white' 
        : 'text-zinc-400 hover:text-white hover:bg-white/10'
    }`}
    title={title}
  >
    <Icon className="w-4 h-4" />
  </button>
);

export default function RichEditor({ content, onChange, placeholder }: RichEditorProps) {
  const { t } = useLanguage();
  const editorPlaceholder = placeholder || t('startWriting');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: editorPlaceholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      BubbleMenuExtension,
      FloatingMenuExtension,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[50vh] font-serif leading-loose text-zinc-300 selection:bg-indigo-500/30',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Update editor content when content prop changes externally (e.g. page switch)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Bubble Menu - Appears on Selection */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 p-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl backdrop-blur-lg">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={Bold}
            title={t('bold')}
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={Italic}
            title={t('italic')}
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            icon={Strikethrough}
            title={t('strikethrough')}
          />
        </BubbleMenu>
      )}

      {/* Floating Menu - Appears on Empty Line */}
      {editor && (
        <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 p-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl backdrop-blur-lg ml-[-30px]">
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            title={t('heading1')}
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            title={t('heading2')}
          />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={List}
            title={t('bulletList')}
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={ListOrdered}
            title={t('orderedList')}
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={Quote}
            title={t('quote')}
          />
        </FloatingMenu>
      )}

      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .is-editor-empty:first-child::before {
          color: #52525b;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #52525b;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
