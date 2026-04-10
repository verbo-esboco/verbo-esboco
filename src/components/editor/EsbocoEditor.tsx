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

        {/* ── Header ──────────────────────────────────────── */}
        <div
          className="shrink-0 px-8 pt-7 pb-5"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}
        >
          {/* Referência */}
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--brand)' }} />
            <input
              type="text"
              value={dados.referencia_biblica}
              onChange={e => update('referencia_biblica', e.target.value)}
              placeholder="Referência bíblica — ex: João 3:16"
              className="text-sm font-medium bg-transparent focus:outline-none flex-1"
              style={{ color: 'var(--brand)' }}
            />
          </div>

          {/* Título */}
          <input
            type="text"
            value={dados.titulo}
            onChange={e => update('titulo', e.target.value)}
            placeholder="Título do esboço"
            className="w-full bg-transparent focus:outline-none mb-5"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.625rem',
              fontWeight: 700,
              color: 'var(--ink-1)',
              lineHeight: 1.25,
            }}
          />

          {/* Barra de ações */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Autosave */}
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--ink-4)' }}>
              {saving
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Salvando…</>
                : lastSaved
                  ? <>Salvo {formatDistanceToNow(lastSaved, { locale: ptBR, addSuffix: true })}</>
                  : null}
            </span>

            <div className="flex-1" />

            {/* Fixar */}
            <button
              onClick={handleToggleFixado}
              title={dados.fixado ? 'Desafixar' : 'Fixar'}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition hover:bg-[var(--hover)]"
              style={{ color: dados.fixado ? 'var(--brand)' : 'var(--ink-4)' }}
            >
              <Star className="w-4 h-4" style={{ fill: dados.fixado ? 'var(--brand)' : 'none' }} />
            </button>

            {/* Status */}
            <div className="relative">
              <button
                onClick={() => { setStatusMenu(!statusMenu); setPastaMenu(false) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                style={{ background: statusAtual.bg, color: statusAtual.color }}
              >
                <StatusIcon className="w-3 h-3" />
                {statusAtual.label}
              </button>
              {statusMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStatusMenu(false)} />
                  <div
                    className="absolute right-0 top-9 z-20 rounded-xl py-1.5 w-40 overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}
                  >
                    {(Object.entries(STATUS_CONFIG) as [EsbocStatus, typeof STATUS_CONFIG.rascunho][]).map(([key, cfg]) => {
                      const Icon = cfg.icon
                      return (
                        <button
                          key={key}
                          onClick={() => { update('status', key); setStatusMenu(false) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm transition hover:bg-[var(--bg)]"
                          style={{ color: dados.status === key ? 'var(--brand)' : 'var(--ink-2)', fontWeight: dados.status === key ? 600 : 400 }}
                        >
                          <Icon className="w-3.5 h-3.5" />
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition hover:bg-[var(--hover)]"
                style={{ color: 'var(--ink-3)', border: '1px solid var(--line)' }}
              >
                <FolderOpen className="w-3 h-3" style={{ color: pasta?.cor ?? 'var(--ink-4)' }} />
                {pasta?.nome ?? 'Pasta'}
              </button>
              {pastaMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPastaMenu(false)} />
                  <div
                    className="absolute right-0 top-9 z-20 rounded-xl py-1.5 w-48 overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}
                  >
                    <button
                      onClick={() => { update('pasta_id', null); setPastaMenu(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm transition hover:bg-[var(--bg)]"
                      style={{ color: !dados.pasta_id ? 'var(--brand)' : 'var(--ink-3)', fontWeight: !dados.pasta_id ? 600 : 400 }}
                    >
                      Sem pasta
                    </button>
                    {pastas.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { update('pasta_id', p.id); setPastaMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm transition hover:bg-[var(--bg)]"
                        style={{ color: dados.pasta_id === p.id ? 'var(--brand)' : 'var(--ink-2)', fontWeight: dados.pasta_id === p.id ? 600 : 400 }}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.cor }} />
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
              style={{ background: 'var(--dark)' }}
            >
              <MonitorPlay className="w-3 h-3" />
              Púlpito
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition hover:bg-[var(--hover)]"
                style={{ color: 'var(--ink-4)' }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuAberto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
                  <div
                    className="absolute right-0 top-9 z-20 rounded-xl py-1.5 w-44 overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}
                  >
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm transition hover:bg-[var(--danger-bg)]"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir esboço
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          {(dados.tags.length > 0 || true) && (
            <div className="flex items-center gap-1.5 mt-4 flex-wrap">
              <Tag className="w-3 h-3 shrink-0" style={{ color: 'var(--ink-4)' }} />
              {dados.tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--brand-muted)', color: 'var(--brand)' }}
                >
                  {tag}
                  <button onClick={() => update('tags', dados.tags.filter(t => t !== tag))} className="hover:opacity-60 transition">
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
                className="text-xs bg-transparent focus:outline-none w-14"
                style={{ color: 'var(--ink-4)' }}
              />
            </div>
          )}
        </div>

        {/* ── Seções ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-2.5">
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
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: 'var(--surface)',
        border: '1px solid',
        borderColor: isOpen && !isEmpty ? 'var(--brand)' : 'var(--line)',
        boxShadow: isOpen ? 'var(--shadow-xs)' : 'none',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--bg)]"
      >
        {/* Numeral */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: !isEmpty ? 'var(--brand)' : 'var(--surface-2)',
            color: !isEmpty ? '#fff' : 'var(--ink-4)',
          }}
        >
          {num}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold" style={{ color: 'var(--ink-1)' }}>{label}</span>
          {isEmpty && (
            <span className="text-xs ml-2" style={{ color: 'var(--ink-4)' }}>vazio</span>
          )}
          {!isEmpty && !isOpen && (
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--ink-3)' }}>
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
        <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--line-soft)' }}>
          <div className="pt-4 pl-10">
            <TiptapEditor
              content={content}
              placeholder={placeholder}
              onChange={onChange}
              minHeight="80px"
            />
          </div>
        </div>
      )}
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
