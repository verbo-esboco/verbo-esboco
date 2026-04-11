'use client'

import { useState, useCallback, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Esboco, Pasta, EsbocStatus } from '@/types'
import {
  Star, Trash2, CheckCircle2, Mic2, FolderOpen, Tag,
  MonitorPlay, ChevronDown, ChevronRight, Pencil, BookOpen
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

const STATUS_CONFIG: Record<EsbocStatus, { label: string; icon: React.ElementType; bsColor: string; textDark?: boolean }> = {
  rascunho: { label: 'Em edição', icon: Pencil,       bsColor: 'warning', textDark: true },
  pronto:   { label: 'Pronto',    icon: CheckCircle2, bsColor: 'success' },
  pregado:  { label: 'Pregado',   icon: Mic2,         bsColor: 'primary' },
}

export default function EsbocoEditor({ esboco: inicial, pastas }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving]           = useState(false)
  const [lastSaved, setLastSaved]     = useState<Date | null>(null)
  const [statusMenu, setStatusMenu]   = useState(false)
  const [pastaMenu, setPastaMenu]     = useState(false)
  const [tagInput, setTagInput]       = useState('')
  const [secaoAberta, setSecaoAberta] = useState<SecaoKey | null>(null)
  const [modoPulpito, setModoPulpito] = useState(false)
  const [menuAberto, setMenuAberto]   = useState(false)

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

      <div className="d-flex flex-column h-100" style={{ background: '#fff' }}>

        {/* ── Header do editor ──────────────────────────── */}
        <div className="flex-shrink-0 border-bottom px-4 pt-4 pb-3" style={{ background: '#fff' }}>

          {/* Referência bíblica */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <BookOpen size={13} className="text-muted flex-shrink-0" />
            <input
              type="text"
              className="form-control form-control-sm border-0 p-0 fst-italic"
              value={dados.referencia_biblica}
              onChange={e => update('referencia_biblica', e.target.value)}
              placeholder="Referência bíblica — ex: João 3:16"
              style={{
                color: 'var(--brand)',
                fontFamily: 'Georgia, serif',
                background: 'transparent',
                boxShadow: 'none',
              }}
            />
          </div>

          {/* Título — grande, serif */}
          <input
            type="text"
            className="form-control border-0 p-0 mb-3 fw-bold"
            value={dados.titulo}
            onChange={e => update('titulo', e.target.value)}
            placeholder="Título do esboço"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              color: 'var(--ink-1)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              background: 'transparent',
              boxShadow: 'none',
            }}
          />

          {/* Barra de ações */}
          <div className="d-flex align-items-center gap-3 flex-wrap border-top pt-2">

            {/* Autosave */}
            <small className="text-muted">
              {saving
                ? <><span className="spinner-border spinner-border-sm me-1" style={{ width: '0.6rem', height: '0.6rem' }} />Salvando…</>
                : lastSaved
                  ? <>Salvo {formatDistanceToNow(lastSaved, { locale: ptBR, addSuffix: true })}</>
                  : null
              }
            </small>

            <div className="flex-grow-1" />

            {/* Fixar */}
            <button
              type="button"
              onClick={handleToggleFixado}
              className="btn btn-sm p-1 border-0"
              title={dados.fixado ? 'Desafixar' : 'Fixar'}
              style={{ color: dados.fixado ? 'var(--brand)' : 'var(--ink-4)', background: 'none' }}
            >
              <Star size={14} style={{ fill: dados.fixado ? 'var(--brand)' : 'none' }} />
            </button>

            {/* Status dropdown */}
            <div className="position-relative">
              <button
                type="button"
                className={`btn btn-sm badge bg-${statusAtual.bsColor}${statusAtual.textDark ? ' text-dark' : ''} border-0`}
                onClick={() => { setStatusMenu(!statusMenu); setPastaMenu(false) }}
                style={{ fontSize: '0.7rem' }}
              >
                <StatusIcon size={11} className="me-1" />
                {statusAtual.label}
              </button>
              {statusMenu && (
                <>
                  <div className="position-fixed" style={{ inset: 0, zIndex: 10 }} onClick={() => setStatusMenu(false)} />
                  <div className="dropdown-menu show" style={{ zIndex: 20, minWidth: '150px', fontSize: '0.8125rem', top: '100%', right: 0 }}>
                    {(Object.entries(STATUS_CONFIG) as [EsbocStatus, typeof STATUS_CONFIG.rascunho][]).map(([key, cfg]) => {
                      const Icon = cfg.icon
                      return (
                        <button
                          key={key}
                          className="dropdown-item d-flex align-items-center gap-2"
                          style={{ fontWeight: dados.status === key ? 700 : 400 }}
                          onClick={() => { update('status', key); setStatusMenu(false) }}
                        >
                          <Icon size={12} />
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Pasta dropdown */}
            <div className="position-relative">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary border-0 d-flex align-items-center gap-1"
                onClick={() => { setPastaMenu(!pastaMenu); setStatusMenu(false) }}
                style={{ fontSize: '0.75rem' }}
              >
                <FolderOpen size={12} style={{ color: pasta?.cor ?? 'var(--ink-4)' }} />
                {pasta?.nome ?? 'Pasta'}
              </button>
              {pastaMenu && (
                <>
                  <div className="position-fixed" style={{ inset: 0, zIndex: 10 }} onClick={() => setPastaMenu(false)} />
                  <div className="dropdown-menu show" style={{ zIndex: 20, minWidth: '170px', fontSize: '0.8125rem', top: '100%', right: 0 }}>
                    <button
                      className="dropdown-item"
                      style={{ fontWeight: !dados.pasta_id ? 700 : 400 }}
                      onClick={() => { update('pasta_id', null); setPastaMenu(false) }}
                    >
                      Sem pasta
                    </button>
                    {pastas.map(p => (
                      <button
                        key={p.id}
                        className="dropdown-item d-flex align-items-center gap-2"
                        style={{ fontWeight: dados.pasta_id === p.id ? 700 : 400 }}
                        onClick={() => { update('pasta_id', p.id); setPastaMenu(false) }}
                      >
                        <span className="rounded-circle" style={{ width: 8, height: 8, background: p.cor, display: 'inline-block', flexShrink: 0 }} />
                        {p.nome}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Modo Púlpito */}
            <button
              type="button"
              onClick={() => setModoPulpito(true)}
              className="btn btn-sm btn-dark d-flex align-items-center gap-1"
              style={{ fontSize: '0.75rem' }}
            >
              <MonitorPlay size={12} />
              Púlpito
            </button>

            {/* Menu (excluir) */}
            <div className="position-relative">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary border-0"
                onClick={() => setMenuAberto(!menuAberto)}
              >
                ···
              </button>
              {menuAberto && (
                <>
                  <div className="position-fixed" style={{ inset: 0, zIndex: 10 }} onClick={() => setMenuAberto(false)} />
                  <div className="dropdown-menu show" style={{ zIndex: 20, fontSize: '0.8125rem', top: '100%', right: 0 }}>
                    <button
                      className="dropdown-item text-danger d-flex align-items-center gap-2"
                      onClick={handleDelete}
                    >
                      <Trash2 size={12} />
                      Excluir esboço
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
            <Tag size={11} className="text-muted" />
            {dados.tags.map(tag => (
              <span
                key={tag}
                className="badge bg-light text-muted d-flex align-items-center gap-1"
                style={{ fontSize: '0.65rem', fontWeight: 400 }}
              >
                #{tag}
                <button
                  type="button"
                  className="btn-close btn-close-sm ms-1"
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => update('tags', dados.tags.filter(t => t !== tag))}
                  aria-label="Remover tag"
                />
              </span>
            ))}
            <input
              type="text"
              className="border-0 p-0 bg-transparent"
              placeholder="+ tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              style={{ fontSize: '0.7rem', color: 'var(--ink-4)', width: '3.5rem', outline: 'none' }}
            />
          </div>
        </div>

        {/* ── Seções ─────────────────────────────────────── */}
        <div className="flex-grow-1 overflow-auto">
          <div className="mx-auto p-4" style={{ maxWidth: '760px' }}>
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
    <div className="card mb-2">
      {/* Card header — clicável para expandir/colapsar */}
      <div
        className="card-header d-flex align-items-center gap-3 cursor-pointer"
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: !isEmpty ? 'var(--ink-1)' : 'var(--ink-4)',
            minWidth: '1.5rem',
            textAlign: 'right',
          }}
        >
          {num}
        </span>

        <div className="flex-grow-1">
          <span
            className="text-uppercase fw-bold"
            style={{
              fontSize: '0.6875rem',
              color: !isEmpty ? 'var(--ink-1)' : 'var(--ink-4)',
              letterSpacing: '0.08em',
            }}
          >
            {label}
          </span>
          {!isEmpty && !isOpen && (
            <p
              className="mb-0 text-truncate fst-italic text-muted"
              style={{ fontSize: '0.8125rem', fontFamily: 'Georgia, serif' }}
            >
              {content.replace(/<[^>]*>/g, '').slice(0, 100)}
            </p>
          )}
        </div>

        {isOpen
          ? <ChevronDown size={14} className="text-muted flex-shrink-0" />
          : <ChevronRight size={14} className="text-muted flex-shrink-0" />
        }
      </div>

      {/* Card body — editor Tiptap */}
      {isOpen && (
        <div className="card-body">
          <TiptapEditor
            content={content}
            placeholder={placeholder}
            onChange={onChange}
            minHeight="80px"
          />
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
