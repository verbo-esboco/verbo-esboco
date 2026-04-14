'use client'

import { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import {
  Bold, Italic, UnderlineIcon, List, ListOrdered,
  Heading1, Heading2, AlignLeft, AlignCenter, AlignRight,
  Quote, Highlighter, X
} from 'lucide-react'
import { useEffect } from 'react'
import { AutocorrectExtension, type SuggestionInfo } from './AutocorrectExtension'
import { SuggestionToast } from './SuggestionToast'

interface Props {
  content: string
  placeholder?: string
  onChange: (html: string) => void
  minHeight?: string
}

const HIGHLIGHT_COLORS = [
  { color: '#fef08a', label: 'Amarelo' },
  { color: '#bbf7d0', label: 'Verde'   },
  { color: '#bfdbfe', label: 'Azul'    },
  { color: '#fbcfe8', label: 'Rosa'    },
  { color: '#fed7aa', label: 'Laranja' },
  { color: '#e9d5ff', label: 'Lilás'   },
]

export default function TiptapEditor({ content, placeholder, onChange, minHeight = '80px' }: Props) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [suggestion, setSuggestion] = useState<SuggestionInfo | null>(null)

  const handleSuggest = useCallback((info: SuggestionInfo) => {
    setSuggestion(info)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Escreva aqui...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Highlight.configure({ multicolor: true }),
      AutocorrectExtension.configure({ onSuggest: handleSuggest }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
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

  function applySuggestion(text: string, from: number, to: number) {
    if (!editor) return
    editor.chain().focus().insertContentAt({ from, to }, text).run()
    setSuggestion(null)
  }

  if (!editor) return null

  const activeHighlightColor = HIGHLIGHT_COLORS.find(c =>
    editor.isActive('highlight', { color: c.color })
  )?.color

  function applyHighlight(color: string) {
    if (!editor) return
    setPaletteOpen(false)
    if (editor.isActive('highlight', { color })) {
      editor.chain().focus().unsetHighlight().run()
    } else {
      editor.chain().focus().setHighlight({ color }).run()
    }
  }

  function removeHighlight() {
    if (!editor) return
    setPaletteOpen(false)
    editor.chain().focus().unsetHighlight().run()
  }

  return (
    <div>
      {/* Toolbar Bootstrap btn-group */}
      <div className="btn-toolbar mb-2 gap-1 flex-wrap" role="toolbar">

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

        {/* ── Marca-texto ─────────────────────────────────── */}
        <div className="btn-group btn-group-sm position-relative" role="group">
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); setPaletteOpen(o => !o) }}
            title="Marca-texto"
            className={`btn btn-sm ${activeHighlightColor ? 'btn-dark' : 'btn-outline-secondary'}`}
            style={{ padding: '2px 7px', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Highlighter size={12} />
            {/* Bolinha indicando cor ativa */}
            <span
              style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: activeHighlightColor ?? 'transparent',
                border: activeHighlightColor ? '1px solid rgba(0,0,0,0.15)' : '1px dashed #aaa',
                display: 'inline-block',
              }}
            />
          </button>

          {/* Paleta de cores */}
          {paletteOpen && (
            <>
              {/* Overlay para fechar ao clicar fora */}
              <div
                className="position-fixed"
                style={{ inset: 0, zIndex: 40 }}
                onMouseDown={() => setPaletteOpen(false)}
              />
              <div
                className="position-absolute"
                style={{
                  top: '100%', left: 0, zIndex: 50, marginTop: 4,
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  boxShadow: 'var(--shadow-md)',
                  padding: '8px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                  minWidth: 130,
                }}
              >
                <p style={{ fontSize: '0.65rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  Marca-texto
                </p>

                {/* Swatches */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {HIGHLIGHT_COLORS.map(({ color, label }) => (
                    <button
                      key={color}
                      type="button"
                      title={label}
                      onMouseDown={e => { e.preventDefault(); applyHighlight(color) }}
                      style={{
                        width: 22, height: 22,
                        borderRadius: 4,
                        background: color,
                        border: activeHighlightColor === color
                          ? '2px solid var(--ink-1)'
                          : '1px solid rgba(0,0,0,0.12)',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>

                {/* Remover marca */}
                {activeHighlightColor && (
                  <button
                    type="button"
                    onMouseDown={e => { e.preventDefault(); removeHighlight() }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: '0.7rem', color: 'var(--ink-3)',
                      background: 'none', border: 'none', padding: '2px 0',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <X size={10} />
                    Remover cor
                  </button>
                )}
              </div>
            </>
          )}
        </div>

      </div>

      <EditorContent editor={editor} />

      <SuggestionToast
        info={suggestion}
        onAccept={applySuggestion}
        onDismiss={() => setSuggestion(null)}
      />
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
