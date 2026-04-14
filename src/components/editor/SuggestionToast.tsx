'use client'

import { X, Spline } from 'lucide-react'
import type { SuggestionInfo } from './AutocorrectExtension'

interface Props {
  info: SuggestionInfo | null
  onAccept: (suggestion: string, from: number, to: number) => void
  onDismiss: () => void
}

export function SuggestionToast({ info, onAccept, onDismiss }: Props) {
  if (!info) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 8,
        boxShadow: 'var(--shadow-md)',
        padding: '12px 14px',
        minWidth: 220,
        maxWidth: 300,
        animation: 'fadeSlideUp 0.18s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>
            Palavra não reconhecida
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-1)', fontWeight: 600, margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>
            &ldquo;{info.word}&rdquo;
          </p>

          {info.suggestions.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {info.suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onAccept(s, info.from, info.to)}
                  style={{
                    fontSize: '0.8rem',
                    padding: '3px 10px',
                    borderRadius: 99,
                    border: '1px solid var(--brand)',
                    background: 'var(--brand-muted)',
                    color: 'var(--brand)',
                    cursor: 'pointer',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 500,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Spline size={11} />
              Nenhuma sugestão encontrada
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          title="Ignorar"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ink-4)',
            padding: 2,
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
