'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import {
  Bold, Italic, UnderlineIcon, List, ListOrdered,
  Heading1, Heading2, AlignLeft, AlignCenter, AlignRight,
  Quote
} from 'lucide-react'
import { useEffect } from 'react'

interface Props {
  content: string
  placeholder?: string
  onChange: (html: string) => void
  minHeight?: string
}

export default function TiptapEditor({ content, placeholder, onChange, minHeight = '80px' }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Escreva aqui...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none',
        style: `min-height: ${minHeight}`,
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content]) // eslint-disable-line

  if (!editor) return null

  return (
    <div>
      {/* Toolbar Bootstrap btn-group */}
      <div className="btn-toolbar mb-2 gap-1" role="toolbar">
        <div className="btn-group btn-group-sm" role="group">
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Negrito"
          >
            <Bold size={12} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Itálico"
          >
            <Italic size={12} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Sublinhado"
          >
            <UnderlineIcon size={12} />
          </ToolBtn>
        </div>

        <div className="btn-group btn-group-sm" role="group">
          <ToolBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Título 1"
          >
            <Heading1 size={12} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Título 2"
          >
            <Heading2 size={12} />
          </ToolBtn>
        </div>

        <div className="btn-group btn-group-sm" role="group">
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Lista"
          >
            <List size={12} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Lista numerada"
          >
            <ListOrdered size={12} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Citação"
          >
            <Quote size={12} />
          </ToolBtn>
        </div>

        <div className="btn-group btn-group-sm" role="group">
          <ToolBtn
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Alinhar esquerda"
          >
            <AlignLeft size={12} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Centralizar"
          >
            <AlignCenter size={12} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Alinhar direita"
          >
            <AlignRight size={12} />
          </ToolBtn>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

function ToolBtn({
  children, onClick, active, title
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`btn btn-sm ${active ? 'btn-dark' : 'btn-outline-secondary'}`}
      style={{ padding: '2px 6px', lineHeight: 1 }}
    >
      {children}
    </button>
  )
}
