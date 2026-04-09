'use client'

import { useState, useCallback, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Esboco, Pasta, EsbocStatus } from '@/types'
import {
  Star, MoreVertical, Trash2, CheckCircle, FileText,
  Mic, FolderOpen, Tag, Loader2, X, MonitorPlay, ChevronDown, ChevronRight
} from 'lucide-react'
import { updateEsboco, deleteEsboco, toggleFixado } from '@/lib/actions'
import TiptapEditor from './TiptapEditor'
import ModoPulpito from './ModoPulpito'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props { esboco: Esboco; pastas: Pasta[] }

type SecaoKey = 'texto_biblico' | 'introducao' | 'desenvolvimento' | 'aplicacao' | 'conclusao'

const SECOES: { key: SecaoKey; label: string; num: string; placeholder: string }[] = [
  { key: 'texto_biblico',   label: 'Texto Bíblico',  num: 'I',   placeholder: 'Cole ou escreva o texto bíblico principal...' },
  { key: 'introducao',      label: 'Introdução',      num: 'II',  placeholder: 'Como você vai introduzir o tema?' },
  { key: 'desenvolvimento', label: 'Desenvolvimento', num: 'III', placeholder: 'Desenvolva os pontos principais da mensagem...' },
  { key: 'aplicacao',       label: 'Aplicação',       num: 'IV',  placeholder: 'Como esta mensagem se aplica à vida prática?' },
  { key: 'conclusao',       label: 'Conclusão',       num: 'V',   placeholder: 'Como fechar a mensagem? Qual o chamado à ação?' },
]

const STATUS_CONFIG: Record<EsbocStatus, { label: string; icon: React.ElementType; bg: string; color: string }> = {
  rascunho: { label: 'Rascunho', icon: FileText,    bg: 'var(--bg)',         color: 'var(--ink-3)'  },
  pronto:   { label: 'Pronto',   icon: CheckCircle, bg: 'var(--success-bg)', color: 'var(--success)' },
  pregado:  { label: 'Pregado',  icon: Mic,         bg: 'var(--info-bg)',    color: 'var(--info)'    },
}

export default function EsbocoEditor({ esboco: inicial, pastas }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving]         = useState(false)
  const [lastSaved, setLastSaved]   = useState<Date | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const [statusMenu, setStatusMenu] = useState(false)
  const [pastaMenu, setPastaMenu]   = useState(false)
  const [tagInput, setTagInput]     = useState('')
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

      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--surface)' }}>

        {/* ── Cabeçalho ────────────────────────────────────── */}
        <div
          className="px-8 pt-8 pb-5"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          {/* Referência acima do título — como numa Bíblia */}
          <input
            type="text"
            value={dados.referencia_biblica}
            onChange={e => update('referencia_biblica', e.target.value)}
            placeholder="Referência bíblica — ex: João 3:16"
            className="text-xs font-medium bg-transparent focus:outline-none w-full mb-2"
            style={{
              color: 'var(--gold)',
              letterSpacing: '0.05em',
              fontStyle: 'italic',
            }}
          />

          {/* Título */}
          <input
            type="text"
            value={dados.titulo}
            onChange={e => update('titulo', e.target.value)}
            placeholder="Título do esboço"
            className="w-full bg-transparent focus:outline-none mb-5"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--ink-1)',
              lineHeight: 1.2,
            }}
          />

          {/* Linha ornamental */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
            <div className="w-1 h-1 rotate-45" style={{ background: 'var(--gold)', opacity: 0.6 }} />
            <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
          </div>

          {/* Barra de ações */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Autosave */}
            <span className="text-[10px] flex items-center gap-1 mr-1" style={{ color: 'var(--ink-4)' }}>
              {saving
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</>
                : lastSaved
                  ? <>Salvo {formatDistanceToNow(lastSaved, { locale: ptBR, addSuffix: true })}</>
                  : null}
            </span>

            <div className="flex-1" />

            {/* Fixar */}
            <button
              onClick={handleToggleFixado}
              title={dados.fixado ? 'Desafixar' : 'Fixar'}
              className="p-1.5 transition hover:opacity-60"
              style={{ color: dados.fixado ? 'var(--gold)' : 'var(--ink-4)' }}
            >
              <Star className="w-3.5 h-3.5" style={{ fill: dados.fixado ? 'var(--gold)' : 'none' }} />
            </button>

            {/* Status */}
            <div className="relative">
              <button
                onClick={() => { setStatusMenu(!statusMenu); setPastaMenu(false) }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition hover:opacity-70"
                style={{
                  background: statusAtual.bg,
                  color: statusAtual.color,
                  border: '1px solid var(--line)',
                }}
              >
                <StatusIcon className="w-3 h-3" />
                {statusAtual.label}
              </button>
              {statusMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStatusMenu(false)} />
                  <div
                    className="absolute right-0 top-8 z-20 py-1.5 w-36 overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)' }}
                  >
                    {(Object.entries(STATUS_CONFIG) as [EsbocStatus, typeof STATUS_CONFIG.rascunho][]).map(([key, cfg]) => {
                      const Icon = cfg.icon
                      return (
                        <button
                          key={key}
                          onClick={() => { update('status', key); setStatusMenu(false) }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs transition hover:bg-[var(--hover)]"
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
                className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition hover:opacity-70"
                style={{ color: 'var(--ink-3)', border: '1px solid var(--line)' }}
              >
                <FolderOpen className="w-3 h-3" style={{ color: pasta?.cor ?? 'var(--ink-4)' }} />
                {pasta?.nome ?? 'Pasta'}
              </button>
              {pastaMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPastaMenu(false)} />
                  <div
                    className="absolute right-0 top-8 z-20 py-1.5 w-44 overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)' }}
                  >
                    <button
                      onClick={() => { update('pasta_id', null); setPastaMenu(false) }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs transition hover:bg-[var(--hover)]"
                      style={{ color: !dados.pasta_id ? 'var(--brand)' : 'var(--ink-3)', fontWeight: !dados.pasta_id ? 600 : 400 }}
                    >
                      Sem pasta
                    </button>
                    {pastas.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { update('pasta_id', p.id); setPastaMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs transition hover:bg-[var(--hover)]"
                        style={{ color: dados.pasta_id === p.id ? 'var(--brand)' : 'var(--ink-2)', fontWeight: dados.pasta_id === p.id ? 600 : 400 }}
                      >
                        <div className="w-1.5 h-1.5 shrink-0" style={{ background: p.cor }} />
                        {p.nome}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Modo Púlpito */}
            <button
              onClick={() => setModoPulpito(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-white transition hover:opacity-80"
              style={{ background: 'var(--ink-1)' }}
            >
              <MonitorPlay className="w-3 h-3" />
              Púlpito
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="p-1.5 transition hover:opacity-60"
                style={{ color: 'var(--ink-4)' }}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
              {menuAberto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
                  <div
                    className="absolute right-0 top-8 z-20 py-1.5 w-40 overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)' }}
                  >
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs transition hover:bg-[var(--danger-bg)]"
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
          <div className="flex items-center gap-1.5 mt-4 flex-wrap">
            <Tag className="w-3 h-3 shrink-0" style={{ color: 'var(--ink-4)' }} />
            {dados.tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5"
                style={{ border: '1px solid var(--line)', color: 'var(--ink-3)', background: 'var(--bg)' }}
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
              className="text-[10px] bg-transparent focus:outline-none w-12"
              style={{ color: 'var(--ink-4)' }}
            />
          </div>
        </div>

        {/* ── Seções ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-8 py-8">
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
    <div className={!isLast ? 'mb-0' : ''}>
      <div
        className="transition-all"
        style={{
          borderTop: '1px solid var(--line)',
          borderLeft: isOpen && !isEmpty ? '2px solid var(--brand)' : '2px solid transparent',
        }}
      >
        {/* Cabeçalho da seção */}
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-[var(--hover)] transition-colors"
        >
          {/* Numeral romano — ornamento do manuscrito */}
          <span
            className="shrink-0 text-sm font-bold"
            style={{
              fontFamily: 'var(--font-serif)',
              color: !isEmpty ? 'var(--brand)' : 'var(--ink-4)',
              width: '1.5rem',
              textAlign: 'right',
            }}
          >
            {num}
          </span>

          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold" style={{ color: 'var(--ink-1)' }}>{label}</span>
            {isEmpty && !isOpen && (
              <span className="text-[10px] ml-2 tracking-wider uppercase" style={{ color: 'var(--ink-4)' }}>vazio</span>
            )}
            {!isEmpty && !isOpen && (
              <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--ink-3)' }}>
                {content.replace(/<[^>]*>/g, '').slice(0, 90)}
              </p>
            )}
          </div>

          {isOpen
            ? <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ink-4)' }} />
            : <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ink-4)' }} />
          }
        </button>

        {/* Conteúdo */}
        {isOpen && (
          <div
            className="px-5 pb-5"
            style={{ borderTop: '1px solid var(--line-soft)' }}
          >
            <div className="pt-4 pl-10">
              <TiptapEditor
                content={content}
                placeholder={placeholder}
                onChange={onChange}
                minHeight="90px"
              />
            </div>
          </div>
        )}
      </div>

      {/* Última linha de fechamento */}
      {isLast && (
        <div style={{ borderBottom: '1px solid var(--line)' }} />
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
