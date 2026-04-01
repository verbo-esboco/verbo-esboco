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

  // Bloqueia scroll do body e ativa tela cheia
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
    <div className="fixed inset-0 z-50 bg-[#0d0d0d] flex flex-col">
      {/* Barra superior */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Modo Púlpito</p>
          <p className="text-white font-bold text-base mt-0.5">{esboco.titulo}</p>
        </div>
        <div className="flex items-center gap-3">
          {esboco.status !== 'pregado' && (
            <button
              onClick={() => setMostrarPregado(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
            >
              <Mic className="w-4 h-4" />
              Marcar como Pregado
            </button>
          )}
          <button
            onClick={onFechar}
            className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Conteúdo com scroll */}
      <div ref={contentRef} className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-12">

          {/* Referência bíblica */}
          {esboco.referencia_biblica && (
            <p className="text-orange-400 text-xl font-semibold text-center tracking-wide">
              {esboco.referencia_biblica}
            </p>
          )}

          {/* Seções */}
          {secoesComConteudo.map((secao, i) => (
            <section key={secao.key}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{secao.emoji}</span>
                <h2 className="text-white/50 text-sm font-semibold uppercase tracking-widest">
                  {secao.label}
                </h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div
                className="pulpito-content text-white/90 text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: esboco[secao.key] as string }}
              />
            </section>
          ))}

          {/* Fim */}
          <div className="text-center py-10 border-t border-white/10">
            <p className="text-white/30 text-sm">— Fim do esboço —</p>
            {esboco.status !== 'pregado' && (
              <button
                onClick={() => setMostrarPregado(true)}
                className="mt-6 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-xl transition mx-auto"
              >
                <Mic className="w-5 h-5" />
                Marcar como Pregado
              </button>
            )}
            {esboco.status === 'pregado' && (
              <p className="text-green-400/70 text-sm mt-4">✓ Este esboço já foi pregado</p>
            )}
          </div>
        </div>
      </div>

      {/* Botão rolar para baixo */}
      <button
        onClick={scrollParaBaixo}
        className="fixed bottom-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition"
        title="Rolar para baixo"
      >
        <ChevronDown className="w-5 h-5" />
      </button>

      {/* Modal Pregado */}
      {mostrarPregado && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold text-lg mb-1">Registrar pregação</h3>
            <p className="text-white/50 text-sm mb-5">Quando e onde esta mensagem foi pregada?</p>

            <div className="space-y-3">
              <div>
                <label className="text-white/50 text-xs font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Data
                </label>
                <input
                  type="date"
                  value={dataPregacao}
                  onChange={e => setDataPregacao(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Local (opcional)
                </label>
                <input
                  type="text"
                  value={localPregacao}
                  onChange={e => setLocalPregacao(e.target.value)}
                  placeholder="Ex: Igreja Central, Culto Domingo"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setMostrarPregado(false)}
                className="flex-1 border border-white/10 text-white/60 rounded-xl py-2.5 text-sm hover:bg-white/5 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarPregado}
                disabled={salvando}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-50"
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
