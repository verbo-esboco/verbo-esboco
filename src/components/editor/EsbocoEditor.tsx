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
  { key: 'texto_biblico',  label: 'Texto Bíblico',   num: 'I',   placeholder: 'Cole ou escreva o texto bíblico principal...' },
  { key: 'introducao',     label: 'Introdução',       num: 'II',  placeholder: 'Como você vai introduzir o tema?' },
  { key: 'desenvolvimento',label: 'Desenvolvimento',  num: 'III', placeholder: 'Desenvolva os pontos principais da mensagem...' },
  { key: 'aplicacao',      label: 'Aplicação',        num: 'IV',  placeholder: 'Como esta mensagem se aplica à vida prática?' },
  { key: 'conclusao',      label: 'Conclusão',        num: 'V',   placeholder: 'Como fechar a mensagem? Qual o chamado à ação?' },
]

const STATUS_CONFIG: Record<EsbocStatus, { label: string; icon: React.ElementType; cls: string }> = {
  rascunho: { label: 'Rascunho', icon: FileText,     cls: 'bg-[var(--hover)] text-[var(--ink-3)]' },
  pronto:   { label: 'Pronto',   icon: CheckCircle,  cls: 'bg-[var(--success-bg)] text-[var(--success)]' },
  pregado:  { label: 'Pregado',  icon: Mic,          cls: 'bg-[var(--info-bg)] text-[var(--info)]' },
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

      <div className="flex-1 flex flex-col overflow-hidden bg-[var(--surface)]">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="border-b border-[var(--line)] px-7 pt-6 pb-4">

          {/* Título */}
          <input
            type="text"
            value={dados.titulo}
            onChange={e => update('titulo', e.target.value)}
            placeholder="Título do esboço"
            className="w-full font-serif text-2xl font-bold text-[var(--ink-1)] bg-transparent focus:outline-none placeholder:text-[var(--ink-4)] placeholder:font-normal mb-2"
          />

          {/* Referência */}
          <input
            type="text"
            value={dados.referencia_biblica}
            onChange={e => update('referencia_biblica', e.target.value)}
            placeholder="Referência bíblica — ex: João 3:16"
            className="text-sm font-medium text-[var(--brand)] bg-transparent focus:outline-none placeholder:text-[var(--brand-muted)] placeholder:font-normal w-full mb-4"
          />

          {/* Ações */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Auto-save */}
            <span className="text-[10px] text-[var(--ink-4)] flex items-center gap-1 mr-1">
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
              className={`p-1.5 rounded-lg transition ${dados.fixado ? 'text-amber-400' : 'text-[var(--ink-4)] hover:bg-[var(--hover)]'}`}
            >
              <Star className={`w-4 h-4 ${dados.fixado ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Status */}
            <div className="relative">
              <button
                onClick={() => { setStatusMenu(!statusMenu); setPastaMenu(false) }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${statusAtual.cls}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {statusAtual.label}
              </button>
              {statusMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStatusMenu(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--line)] py-1.5 w-36 overflow-hidden">
                    {(Object.entries(STATUS_CONFIG) as [EsbocStatus, typeof STATUS_CONFIG.rascunho][]).map(([key, cfg]) => {
                      const Icon = cfg.icon
                      return (
                        <button
                          key={key}
                          onClick={() => { update('status', key); setStatusMenu(false) }}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--hover)] transition ${dados.status === key ? 'font-semibold text-[var(--brand)]' : 'text-[var(--ink-2)]'}`}
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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-[var(--ink-3)] hover:bg-[var(--hover)] transition"
              >
                <FolderOpen className="w-3.5 h-3.5" style={{ color: pasta?.cor ?? 'var(--ink-4)' }} />
                {pasta?.nome ?? 'Pasta'}
              </button>
              {pastaMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPastaMenu(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--line)] py-1.5 w-44 overflow-hidden">
                    <button
                      onClick={() => { update('pasta_id', null); setPastaMenu(false) }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--hover)] transition ${!dados.pasta_id ? 'font-semibold text-[var(--brand)]' : 'text-[var(--ink-3)]'}`}
                    >
                      Sem pasta
                    </button>
                    {pastas.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { update('pasta_id', p.id); setPastaMenu(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--hover)] transition ${dados.pasta_id === p.id ? 'font-semibold text-[var(--brand)]' : 'text-[var(--ink-2)]'}`}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.cor }} />
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ink-1)] hover:bg-[var(--ink-2)] text-white rounded-lg text-xs font-medium transition"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              Púlpito
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--ink-4)] transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuAberto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--line)] py-1.5 w-40 overflow-hidden">
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition"
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
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <Tag className="w-3 h-3 text-[var(--ink-4)] shrink-0" />
            {dados.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-[var(--brand-muted)] text-[var(--brand)] text-[10px] px-2 py-0.5 rounded-full font-medium">
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
              className="text-[10px] text-[var(--ink-3)] bg-transparent focus:outline-none placeholder:text-[var(--ink-4)] w-12"
            />
          </div>
        </div>

        {/* ── Seções ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-7 py-7 space-y-2">
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
    <div className="relative">
      {/* Linha conectora entre seções */}
      {!isLast && (
        <div className="absolute left-[19px] top-full w-px h-2 bg-[var(--line)]" style={{ zIndex: 0 }} />
      )}

      <div className={`relative rounded-xl border transition-all ${
        isOpen
          ? 'border-[var(--line)] bg-[var(--surface)] shadow-sm'
          : 'border-[var(--line-soft)] bg-[var(--surface)] hover:border-[var(--line)]'
      }`}>
        {/* Header */}
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
        >
          {/* Numeração romana — a assinatura visual */}
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all font-serif text-xs font-bold ${
            !isEmpty
              ? 'bg-[var(--brand)] text-white shadow-sm'
              : 'bg-[var(--hover)] text-[var(--ink-4)]'
          }`}>
            {num}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-[var(--ink-1)]">{label}</span>
            {isEmpty && !isOpen && (
              <span className="text-[10px] text-[var(--ink-4)] ml-2">vazio</span>
            )}
            {!isEmpty && !isOpen && (
              <p className="text-[10px] text-[var(--ink-3)] truncate mt-0.5">
                {content.replace(/<[^>]*>/g, '').slice(0, 80)}
              </p>
            )}
          </div>

          {isOpen
            ? <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-4)] shrink-0" />
            : <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-4)] shrink-0" />
          }
        </button>

        {/* Conteúdo */}
        {isOpen && (
          <div className="px-4 pb-4 border-t border-[var(--line-soft)]">
            <div className="pt-3 pl-10">
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
