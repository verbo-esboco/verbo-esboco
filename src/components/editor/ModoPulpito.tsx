'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, Mic, MapPin, Calendar } from 'lucide-react'
import type { Esboco } from '@/types'
import { updateEsboco } from '@/lib/actions'

interface Props {
  esboco: Esboco
  onFechar: () => void
  onPregado: (data: string, local: string) => void
}

const SECOES = [
  { key: 'texto_biblico' as keyof Esboco, label: 'Texto Bíblico', emoji: '📖' },
  { key: 'introducao' as keyof Esboco, label: 'Introdução', emoji: '🎯' },
  { key: 'desenvolvimento' as keyof Esboco, label: 'Desenvolvimento', emoji: '📝' },
  { key: 'aplicacao' as keyof Esboco, label: 'Aplicação', emoji: '✋' },
  { key: 'conclusao' as keyof Esboco, label: 'Conclusão', emoji: '🏁' },
]

export default function ModoPulpito({ esboco, onFechar, onPregado }: Props) {
  const [mostrarPregado, setMostrarPregado] = useState(false)
  const [dataPregacao, setDataPregacao] = useState(new Date().toISOString().split('T')[0])
  const [localPregacao, setLocalPregacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.requestFullscreen?.().catch(() => {})

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      document.exitFullscreen?.().catch(() => {})
      window.removeEventListener('keydown', handleKey)
    }
  }, [onFechar])

  function scrollParaBaixo() {
    contentRef.current?.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })
  }

  async function handleConfirmarPregado() {
    setSalvando(true)
    try {
      await updateEsboco(esboco.id, { status: 'pregado' })
      onPregado(dataPregacao, localPregacao)
      onFechar()
    } finally {
      setSalvando(false)
    }
  }

  const secoesComConteudo = SECOES.filter(s => {
    const val = esboco[s.key] as string
    return val && val.replace(/<[^>]*>/g, '').trim().length > 0
  })

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1050,
        background: '#0d0d0d',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Barra superior */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      >
        <div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, fontWeight: 500 }}>
            Modo Púlpito
          </p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
            {esboco.titulo}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {esboco.status !== 'pregado' && (
            <button
              onClick={() => setMostrarPregado(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--brand)', border: 'none',
                color: '#fff', fontSize: '0.875rem', fontWeight: 500,
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              }}
            >
              <Mic size={16} />
              Marcar como Pregado
            </button>
          )}
          <button
            onClick={onFechar}
            style={{
              padding: '8px', borderRadius: '8px', border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)',
            }}
            title="Fechar (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Conteúdo com scroll */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

          {/* Referência bíblica */}
          {esboco.referencia_biblica && (
            <p style={{ color: 'var(--brand-bright)', fontSize: '1.25rem', fontWeight: 600, textAlign: 'center', letterSpacing: '0.03em', margin: 0 }}>
              {esboco.referencia_biblica}
            </p>
          )}

          {/* Seções */}
          {secoesComConteudo.map(secao => (
            <section key={secao.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.5rem' }}>{secao.emoji}</span>
                <h2 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  {secao.label}
                </h2>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div
                className="pulpito-content"
                style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem', lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: esboco[secao.key] as string }}
              />
            </section>
          ))}

          {/* Fim */}
          <div style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '40px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', margin: 0 }}>— Fim do esboço —</p>
            {esboco.status !== 'pregado' && (
              <button
                onClick={() => setMostrarPregado(true)}
                style={{
                  marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'var(--brand)', border: 'none',
                  color: '#fff', fontWeight: 500, padding: '12px 24px',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '0.9375rem',
                }}
              >
                <Mic size={18} />
                Marcar como Pregado
              </button>
            )}
            {esboco.status === 'pregado' && (
              <p style={{ color: 'rgba(74,222,128,0.7)', fontSize: '0.875rem', marginTop: '16px' }}>
                ✓ Este esboço já foi pregado
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botão scroll para baixo */}
      <button
        onClick={scrollParaBaixo}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '40px', height: '40px',
          background: 'rgba(255,255,255,0.1)', border: 'none',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: 'pointer', zIndex: 1055,
        }}
        title="Rolar para baixo"
      >
        <ChevronDown size={20} />
      </button>

      {/* Modal: Registrar pregação */}
      {mostrarPregado && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1060,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)', padding: '16px',
          }}
        >
          <div
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%', maxWidth: '360px',
            }}
          >
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.125rem', margin: '0 0 4px' }}>
              Registrar pregação
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: '0 0 20px' }}>
              Quando e onde esta mensagem foi pregada?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <Calendar size={12} /> Data
                </label>
                <input
                  type="date"
                  value={dataPregacao}
                  onChange={e => setDataPregacao(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '10px 12px',
                    color: '#fff', fontSize: '0.875rem', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <MapPin size={12} /> Local (opcional)
                </label>
                <input
                  type="text"
                  value={localPregacao}
                  onChange={e => setLocalPregacao(e.target.value)}
                  placeholder="Ex: Igreja Central, Culto Domingo"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '10px 12px',
                    color: '#fff', fontSize: '0.875rem', outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={() => setMostrarPregado(false)}
                style={{
                  flex: 1, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: 'rgba(255,255,255,0.6)',
                  borderRadius: '10px', padding: '10px', fontSize: '0.875rem', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarPregado}
                disabled={salvando}
                style={{
                  flex: 1, background: 'var(--brand)', border: 'none',
                  color: '#fff', borderRadius: '10px',
                  padding: '10px', fontSize: '0.875rem', fontWeight: 500,
                  cursor: salvando ? 'not-allowed' : 'pointer',
                  opacity: salvando ? 0.5 : 1,
                }}
              >
                {salvando ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
