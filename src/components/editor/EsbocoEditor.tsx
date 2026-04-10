'use client'

import { useState, useCallback, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Esboco, Pasta, EsbocStatus } from '@/types'
import {
  Star, MoreVertical, Trash2, CheckCircle2,
  Mic2, FolderOpen, Tag, Loader2, X, MonitorPlay,
  ChevronDown, ChevronRight, Pencil, BookOpen
} from 'lucide-react'
import { updateEsboco, deleteEsboco, toggleFixado } from '@/lib/actions'
import TiptapEditor from './TiptapEditor'
import ModoPulpito from './ModoPulpito'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props { esboco: Esboco; pastas: Pasta[] }

type SecaoKey = 'texto_biblico' | 'introducao' | 'desenvolvimento' | 'aplicacao' | 'conclusao'

const SECOES: { key: SecaoKey; label: string; num: string; placeholder: string }[] = [
  { key: 'texto_biblico',   label: 'Texto Bíblico',  num: 'I',   placeholder: 'Cole ou escreva o texto bíblico principal…' },
  { key: 'introducao',      label: 'Introdução',      num: 'II',  placeholder: 'Como você vai introduzir o tema?' },
  { key: 'desenvolvimento', label: 'Desenvolvimento', num: 'III', placeholder: 'Desenvolva os pontos principais da mensagem…' },
  { key: 'aplicacao',       label: 'Aplicação',       num: 'IV',  placeholder: 'Como esta mensagem se aplica à vida prática?' },
  { key: 'conclusao',       label: 'Conclusão',       num: 'V',   placeholder: 'Como fechar a mensagem? Qual o chamado à ação?' },
]

const STATUS_CONFIG: Record<EsbocStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  rascunho: { label: 'Em edição', icon: Pencil,       color: '#92400E', bg: '#FEF3C7' },
  pronto:   { label: 'Pronto',    icon: CheckCircle2, color: '#166534', bg: '#DCFCE7' },
  pregado:  { label: 'Pregado',   icon: Mic2,         color: '#1E40AF', bg: '#DBEAFE' },
}

export default function EsbocoEditor({ esboco: inicial, pastas }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving]           = useState(false)
  const [lastSaved, setLastSaved]     = useState<Date | null>(null)
  const [menuAberto, setMenuAberto]   = useState(false)
  const [statusMenu, setStatusMenu]   = useState(false)
  const [pastaMenu, setPastaMenu]     = useState(false)
  const [tagInput, setTagInput]       = useState('')
  const [secaoAberta, setSecaoAberta] = useState<SecaoKey | null>(null)
  const [modoPulpito, setModoPulpito] = useState(false)

  const [dados, setDados] = useState({
    titulo:             inicial.titulo,
    referencia_biblica: inicial.referencia_biblica,
    texto_biblico:      inicial.texto_biblico,
    introducao:         inicial.introducao,
    desenvolvimento:    inicial.desenvolvimento,
    aplicacao:          inicial.aplicacao,
    conclusao:          inicial.conclusao,
    status:             inicial.status as EsbocStatus,
    fixado:             inicial.fixado,
    tags:               inicial.tags,
    pasta_id:           inicial.pasta_id,
  })

  const saveDebounced = useCallback(
    debounce(async (d: typeof dados) => {
      setSaving(true)
      try { await updateEsboco(inicial.id, d); setLastSaved(new Date()) }
      finally { setSaving(false) }
    }, 1500),
    [inicial.id]
  )

  useEffect(() => { saveDebounced(dados) }, [dados]) // eslint-disable-line

  function update(field: keyof typeof dados, value: unknown) {
    setDados(prev => ({ ...prev, [field]: value }))
  }

  function handleAddTag(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const nova = tagInput.trim().replace(',', '')
      if (!dados.tags.includes(nova)) update('tags', [...dados.tags, nova])
      setTagInput('')
    }
  }

  function handleDelete() {
    setMenuAberto(false)
    startTransition(async () => { await deleteEsboco(inicial.id); router.push('/esbocos') })
  }

  function handleToggleFixado() {
    update('fixado', !dados.fixado)
    startTransition(async () => { await toggleFixado(inicial.id, dados.fixado) })
  }

  const statusAtual = STATUS_CONFIG[dados.status]
  const StatusIcon  = statusAtual.icon
  const pasta       = pastas.find(p => p.id === dados.pasta_id)

  return (
    <>
      {modoPulpito && (
        <ModoPulpito
          esboco={{ ...inicial, ...dados }}
          onFechar={() => setModoPulpito(false)}
          onPregado={() => update('status', 'pregado')}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>

        {/* ── Header do editor ─────────────────────────────── */}
        <div
          className="shrink-0"
          style={{
            background: 'var(--surface)',
            borderBottom: '2px solid var(--ink-1)',
            padding: '40px 56px 28px',
          }}
        >
          {/* Referência bíblica */}
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ink-4)' }} />
            <input
              type="text"
              value={dados.referencia_biblica}
              onChange={e => update('referencia_biblica', e.target.value)}
              placeholder="Referência bíblica — ex: João 3:16"
              className="text-sm bg-transparent focus:outline-none flex-1"
              style={{ color: 'var(--brand)', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}
            />
          </div>

          {/* Título — grande, serif */}
          <input
            type="text"
            value={dados.titulo}
            onChange={e => update('titulo', e.target.value)}
            placeholder="Título do esboço"
            className="w-full bg-transparent focus:outline-none mb-6"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--ink-1)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          />

          {/* Barra de ações — discreta, tipografia pequeena */}
          <div
            className="flex items-center gap-4 flex-wrap"
            style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}
          >

            {/* Autosave */}
            <span
              className="flex items-center gap-1.5 uppercase tracking-widest"
              style={{ fontSize: '0.625rem', color: 'var(--ink-4)', letterSpacing: '0.08em' }}
            >
              {saving
                ? <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Salvando…</>
                : lastSaved
                  ? <>Salvo {formatDistanceToNow(lastSaved, { locale: ptBR, addSuffix: true })}</>
                  : null}
            </span>

            <div className="flex-1" />

            {/* Fixar */}
            <button
              onClick={handleToggleFixado}
              title={dados.fixado ? 'Desafixar' : 'Fixar'}
              className="flex items-center justify-center w-7 h-7 transition hover:opacity-50"
              style={{ color: dados.fixado ? 'var(--brand)' : 'var(--ink-4)' }}
            >
              <Star className="w-3.5 h-3.5" style={{ fill: dados.fixado ? 'var(--brand)' : 'none' }} />
            </button>

            {/* Status */}
            <div className="relative">
              <button
                onClick={() => { setStatusMenu(!statusMenu); setPastaMenu(false) }}
                className="flex items-center gap-1.5 transition hover:opacity-60"
                style={{
                  fontSize: '0.6875rem',
                  color: statusAtual.color,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                <StatusIcon className="w-3 h-3" />
                {statusAtual.label}
              </button>
              {statusMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStatusMenu(false)} />
                  <div
                    className="absolute right-0 top-7 z-20 py-1 w-36 overflow-hidden"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    {(Object.entries(STATUS_CONFIG) as [EsbocStatus, typeof STATUS_CONFIG.rascunho][]).map(([key, cfg]) => {
                      const Icon = cfg.icon
                      return (
                        <button
                          key={key}
                          onClick={() => { update('status', key); setStatusMenu(false) }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs transition hover:bg-[var(--hover)]"
                          style={{
                            color: dados.status === key ? 'var(--ink-1)' : 'var(--ink-3)',
                            fontWeight: dados.status === key ? 700 : 400,
                            letterSpacing: '0.04em',
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Pasta */}
            <div className="relative">
              <button
                onClick={() => { setPastaMenu(!pastaMenu); setStatusMenu(false) }}
                className="flex items-center gap-1.5 transition hover:opacity-60"
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--ink-4)',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                <FolderOpen className="w-3 h-3" style={{ color: pasta?.cor ?? 'var(--ink-4)' }} />
                {pasta?.nome ?? 'Pasta'}
              </button>
              {pastaMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPastaMenu(false)} />
                  <div
                    className="absolute right-0 top-7 z-20 py-1 w-44 overflow-hidden"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <button
                      onClick={() => { update('pasta_id', null); setPastaMenu(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs transition hover:bg-[var(--hover)]"
                      style={{ color: !dados.pasta_id ? 'var(--ink-1)' : 'var(--ink-3)', fontWeight: !dados.pasta_id ? 700 : 400 }}
                    >
                      Sem pasta
                    </button>
                    {pastas.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { update('pasta_id', p.id); setPastaMenu(false) }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs transition hover:bg-[var(--hover)]"
                        style={{ color: dados.pasta_id === p.id ? 'var(--ink-1)' : 'var(--ink-3)', fontWeight: dados.pasta_id === p.id ? 700 : 400 }}
                      >
                        <div className="w-2 h-2 shrink-0" style={{ background: p.cor }} />
                        {p.nome}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Púlpito */}
            <button
              onClick={() => setModoPulpito(true)}
              className="flex items-center gap-1.5 transition hover:opacity-60"
              style={{
                fontSize: '0.6875rem',
                color: 'var(--ink-1)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              <MonitorPlay className="w-3 h-3" />
              Púlpito
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="flex items-center justify-center w-7 h-7 transition hover:opacity-50"
                style={{ color: 'var(--ink-4)' }}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
              {menuAberto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
                  <div
                    className="absolute right-0 top-8 z-20 py-1 w-40 overflow-hidden"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs transition hover:bg-[var(--danger-bg)]"
                      style={{ color: 'var(--danger)', letterSpacing: '0.04em' }}
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir esboço
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Tag className="w-3 h-3 shrink-0" style={{ color: 'var(--ink-4)' }} />
            {dados.tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 uppercase tracking-widest"
                style={{ fontSize: '0.625rem', color: 'var(--ink-3)', letterSpacing: '0.1em' }}
              >
                #{tag}
                <button onClick={() => update('tags', dados.tags.filter(t => t !== tag))} className="hover:opacity-50 transition">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="+ tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="bg-transparent focus:outline-none uppercase tracking-widest"
              style={{ fontSize: '0.625rem', color: 'var(--ink-4)', width: '3rem', letterSpacing: '0.1em' }}
            />
          </div>
        </div>

        {/* ── Seções ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-14 py-8">
            {SECOES.map((secao, i) => (
              <SecaoCard
                key={secao.key}
                num={secao.num}
                label={secao.label}
                placeholder={secao.placeholder}
                content={dados[secao.key]}
                onChange={html => update(secao.key, html)}
                isOpen={secaoAberta === secao.key || secaoAberta === null}
                onToggle={() => setSecaoAberta(secaoAberta === secao.key ? null : secao.key)}
                isLast={i === SECOES.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function SecaoCard({ num, label, placeholder, content, onChange, isOpen, onToggle, isLast }: {
  num: string
  label: string
  placeholder: string
  content: string
  onChange: (html: string) => void
  isOpen: boolean
  onToggle: () => void
  isLast: boolean
}) {
  const isEmpty = !content || content === '<p></p>'

  return (
    <div
      className="transition-all"
      style={{ borderTop: '1px solid var(--line)', paddingTop: isLast ? undefined : undefined }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 py-4 text-left transition hover:opacity-70"
      >
        {/* Numeral romano — editorial */}
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: !isEmpty ? 'var(--ink-1)' : 'var(--ink-4)',
            letterSpacing: '0.05em',
            minWidth: '1.5rem',
            textAlign: 'right',
          }}
        >
          {num}
        </span>

        {/* Label + preview */}
        <div className="flex-1 min-w-0">
          <span
            className="uppercase tracking-widest"
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: !isEmpty ? 'var(--ink-1)' : 'var(--ink-4)',
              letterSpacing: '0.1em',
            }}
          >
            {label}
          </span>
          {!isEmpty && !isOpen && (
            <p
              className="truncate mt-0.5"
              style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
            >
              {content.replace(/<[^>]*>/g, '').slice(0, 100)}
            </p>
          )}
        </div>

        {isOpen
          ? <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ink-4)' }} />
          : <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ink-4)' }} />
        }
      </button>

      {isOpen && (
        <div className="pl-10 pb-6">
          <TiptapEditor
            content={content}
            placeholder={placeholder}
            onChange={onChange}
            minHeight="80px"
          />
        </div>
      )}

      {/* Linha inferior — último não tem */}
      {!isLast && !isOpen && <div style={{ borderBottom: '0px' }} />}
    </div>
  )
}

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}
