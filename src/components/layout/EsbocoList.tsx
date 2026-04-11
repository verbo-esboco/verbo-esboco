'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Esboco, Pasta } from '@/types'
import { Search, Star, BookOpen, Pencil, CheckCircle2, Mic2, X, FileText } from 'lucide-react'
import { deleteEsboco, toggleFixado, updateEsboco } from '@/lib/actions'

interface Props { esbocos: Esboco[]; pastas: Pasta[]; compacto?: boolean }

const STATUS = {
  rascunho: { label: 'Em edição', icon: Pencil,       bsColor: 'warning', textDark: true },
  pronto:   { label: 'Pronto',    icon: CheckCircle2, bsColor: 'success', textDark: false },
  pregado:  { label: 'Pregado',   icon: Mic2,         bsColor: 'primary', textDark: false },
} as const

export default function EsbocoList({ esbocos, pastas, compacto = false }: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [menu, setMenu]     = useState<string | null>(null)

  const filtro  = searchParams.get('filtro') ?? 'todos'
  const pastaId = searchParams.get('pasta')

  const filtrados = useMemo(() => {
    let lista = esbocos
    if (pastaId)                                   lista = lista.filter(e => e.pasta_id === pastaId)
    else if (filtro === 'fixados')                 lista = lista.filter(e => e.fixado)
    else if (['rascunho','pronto','pregado'].includes(filtro))
                                                   lista = lista.filter(e => e.status === filtro)
    if (search.trim()) {
      const q = search.toLowerCase()
      lista = lista.filter(e =>
        e.titulo.toLowerCase().includes(q) ||
        e.referencia_biblica.toLowerCase().includes(q) ||
        e.introducao.toLowerCase().includes(q)
      )
    }
    return lista
  }, [esbocos, filtro, pastaId, search])

  function handleDelete(id: string) {
    setMenu(null)
    startTransition(async () => {
      await deleteEsboco(id)
      if (pathname.includes(id)) router.push('/esbocos')
    })
  }

  const idAtual = pathname.split('/esbocos/')[1]
  const filtroAtivo = pastaId ? `pasta:${pastaId}` : filtro

  const pills = [
    { key: 'todos',    label: 'Todos',     href: '/esbocos' },
    { key: 'fixados',  label: 'Fixados',   href: '/esbocos?filtro=fixados' },
    { key: 'rascunho', label: 'Em edição', href: '/esbocos?filtro=rascunho' },
    { key: 'pronto',   label: 'Pronto',    href: '/esbocos?filtro=pronto' },
    { key: 'pregado',  label: 'Pregado',   href: '/esbocos?filtro=pregado' },
    ...pastas.map(p => ({ key: `pasta:${p.id}`, label: p.nome, href: `/esbocos?pasta=${p.id}` })),
  ]

  return (
    <div className="d-flex flex-column h-100" style={{ background: '#fff' }}>

      {/* ── Busca ─────────────────────────────────────────── */}
      <div className={`p-3 ${compacto ? 'pb-2' : 'pb-2'} border-bottom`}>
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-white border-end-0">
            <Search size={13} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Buscar esboço…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ boxShadow: 'none' }}
          />
          {search && (
            <button
              className="btn btn-outline-secondary border-start-0"
              type="button"
              onClick={() => setSearch('')}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Filtros (pills) ───────────────────────────────── */}
      {!compacto && (
        <div className="px-3 py-2 border-bottom overflow-auto scrollbar-hide">
          <div className="d-flex gap-2 flex-nowrap">
            {pills.map(p => (
              <Link
                key={p.key}
                href={p.href}
                className={`badge text-decoration-none flex-shrink-0 ${
                  filtroAtivo === p.key
                    ? 'bg-dark text-white'
                    : 'bg-light text-secondary'
                }`}
                style={{ fontSize: '0.7rem', padding: '5px 10px' }}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Lista de cards ────────────────────────────────── */}
      <div className="flex-grow-1 overflow-auto p-3">
        {filtrados.length === 0 ? (
          <div className="text-center py-5">
            <FileText size={32} className="text-muted mb-3" />
            <p className="fw-semibold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              {search ? 'Nenhum resultado' : 'Nenhum esboço ainda'}
            </p>
            <p className="text-muted small">
              {search ? 'Tente outro termo' : 'Clique em Novo para criar'}
            </p>
          </div>
        ) : (
          filtrados.map(esboco => {
            const isActive = idAtual === esboco.id
            const st = STATUS[esboco.status]

            return (
              <div key={esboco.id} className="card mb-2 position-relative">
                <div
                  className={`card-body ${compacto ? 'p-2' : 'p-3'}`}
                  style={{
                    borderLeft: isActive ? `3px solid var(--brand)` : '3px solid transparent',
                    background: isActive ? 'rgba(200,71,10,0.03)' : '#fff',
                  }}
                >
                  {/* Meta: data + status + fixado */}
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className={`badge bg-${st.bsColor}${st.textDark ? ' text-dark' : ''}`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {st.label}
                      </span>
                      {esboco.fixado && (
                        <Star size={11} style={{ color: 'var(--brand)', fill: 'var(--brand)' }} />
                      )}
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      {format(new Date(esboco.updated_at), "d MMM", { locale: ptBR })}
                    </span>
                  </div>

                  {/* Título */}
                  <Link
                    href={`/esbocos/${esboco.id}`}
                    className="text-decoration-none d-block stretched-link"
                  >
                    <h6
                      className={`mb-1 ${isActive ? '' : 'text-dark'}`}
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 700,
                        fontSize: compacto ? '0.875rem' : '0.9375rem',
                        color: isActive ? 'var(--brand)' : undefined,
                        lineHeight: 1.3,
                      }}
                    >
                      {esboco.titulo || 'Sem título'}
                    </h6>
                  </Link>

                  {/* Referência */}
                  {esboco.referencia_biblica && (
                    <p className="mb-1 d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                      <BookOpen size={11} className="text-muted flex-shrink-0" />
                      <span className="text-muted fst-italic">{esboco.referencia_biblica}</span>
                    </p>
                  )}

                  {/* Tags */}
                  {esboco.tags?.length > 0 && !compacto && (
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {esboco.tags.map(tag => (
                        <span
                          key={tag}
                          className="badge bg-light text-muted"
                          style={{ fontSize: '0.65rem', fontWeight: 400 }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Menu de contexto (botão de ações — acima do stretched-link) */}
                  <div className="position-absolute top-0 end-0 p-2" style={{ zIndex: 2 }}>
                    <button
                      onClick={e => { e.preventDefault(); e.stopPropagation(); setMenu(menu === esboco.id ? null : esboco.id) }}
                      className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                      style={{ lineHeight: 1 }}
                      title="Ações"
                    >
                      ···
                    </button>

                    {menu === esboco.id && (
                      <>
                        <div className="position-fixed inset-0" style={{ zIndex: 10, top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setMenu(null)} />
                        <div
                          className="dropdown-menu show"
                          style={{ zIndex: 20, minWidth: '170px', fontSize: '0.8125rem' }}
                        >
                          <button
                            className="dropdown-item d-flex align-items-center gap-2"
                            onClick={() => { startTransition(async () => { await toggleFixado(esboco.id, esboco.fixado) }); setMenu(null) }}
                          >
                            <Star size={12} style={{ color: 'var(--brand)', fill: esboco.fixado ? 'var(--brand)' : 'none' }} />
                            {esboco.fixado ? 'Desafixar' : 'Fixar'}
                          </button>

                          <div className="dropdown-divider" />
                          <h6 className="dropdown-header" style={{ fontSize: '0.65rem' }}>Status</h6>

                          {(['rascunho', 'pronto', 'pregado'] as const).map(s => {
                            const S = STATUS[s]
                            const Icon = S.icon
                            return (
                              <button
                                key={s}
                                className="dropdown-item d-flex align-items-center gap-2"
                                style={{ fontWeight: esboco.status === s ? 700 : 400 }}
                                onClick={() => { startTransition(async () => { await updateEsboco(esboco.id, { status: s }) }); setMenu(null) }}
                              >
                                <Icon size={12} />
                                {S.label}
                              </button>
                            )
                          })}

                          <div className="dropdown-divider" />
                          <button
                            className="dropdown-item text-danger d-flex align-items-center gap-2"
                            onClick={() => handleDelete(esboco.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
