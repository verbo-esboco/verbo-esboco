'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Esboco, Pasta } from '@/types'
import {
  Search, Star, MoreVertical, Trash2, X, FileText,
  BookOpen, Pencil, CheckCircle2, Mic2
} from 'lucide-react'
import { deleteEsboco, toggleFixado, updateEsboco } from '@/lib/actions'

interface Props { esbocos: Esboco[]; pastas: Pasta[]; compacto?: boolean }

const STATUS = {
  rascunho: { label: 'Em edição', icon: Pencil,       color: '#92400E', bg: '#FEF3C7', dot: '#D97706' },
  pronto:   { label: 'Pronto',    icon: CheckCircle2, color: '#166534', bg: '#DCFCE7', dot: '#16A34A' },
  pregado:  { label: 'Pregado',   icon: Mic2,         color: '#1E40AF', bg: '#DBEAFE', dot: '#2563EB' },
}

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
    if (pastaId)                                  lista = lista.filter(e => e.pasta_id === pastaId)
    else if (filtro === 'fixados')                lista = lista.filter(e => e.fixado)
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

  const px = compacto ? 'px-4' : 'px-6'
  const maxW = compacto ? '' : 'max-w-xl mx-auto w-full'

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)' }}>

      {/* Busca */}
      <div className={`${px} pt-5 pb-3`}>
        <div className={maxW}>
          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
            style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}
          >
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ink-4)' }} />
            <input
              type="text"
              placeholder="Buscar por tema, livro ou palavra-chave…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none"
              style={{ color: 'var(--ink-1)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="p-0.5" style={{ color: 'var(--ink-4)' }}>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={`${px} pb-4 overflow-x-auto scrollbar-hide`}>
        <div className={`flex gap-1.5 ${maxW}`}>
          {pills.map(p => (
            <Link
              key={p.key}
              href={p.href}
              className="shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap"
              style={filtroAtivo === p.key
                ? { background: 'var(--brand)', color: '#fff' }
                : { background: 'transparent', color: 'var(--ink-3)' }
              }
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className={`flex-1 overflow-y-auto ${px} pb-6`}>
        <div className={`${maxW} flex flex-col gap-px`}>
          {filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'var(--bg)', border: '1px solid var(--line)' }}
              >
                <FileText className="w-6 h-6" style={{ color: 'var(--ink-4)' }} />
              </div>
              <p className="text-sm font-semibold mb-1.5" style={{ color: 'var(--ink-2)' }}>
                {search ? 'Nenhum resultado' : 'Nenhum esboço ainda'}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-4)' }}>
                {search ? 'Tente buscar por outro termo' : 'Clique em Novo para criar seu primeiro esboço'}
              </p>
            </div>
          ) : (
            filtrados.map(esboco => {
              const isActive = idAtual === esboco.id
              const st = STATUS[esboco.status]
              const StatusIcon = st.icon

              return (
                <div key={esboco.id} className="relative group">
                  <Link
                    href={`/esbocos/${esboco.id}`}
                    className="block transition-colors"
                    style={{
                      padding: compacto ? '12px 14px' : '14px 16px',
                      background: isActive ? 'var(--hover)' : 'transparent',
                      borderRadius: '10px',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg)'
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    {/* Indicador ativo */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                        style={{ background: 'var(--brand)' }}
                      />
                    )}

                    {/* Título + status */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p
                        className="font-semibold leading-snug flex-1 min-w-0"
                        style={{
                          color: isActive ? 'var(--ink-1)' : 'var(--ink-2)',
                          fontSize: compacto ? '0.8125rem' : '0.875rem',
                        }}
                      >
                        {esboco.titulo || 'Sem título'}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {esboco.fixado && (
                          <Star className="w-3 h-3" style={{ color: 'var(--brand)', fill: 'var(--brand)' }} />
                        )}
                        <span
                          className="flex items-center gap-1 rounded-md font-medium"
                          style={{
                            background: st.bg,
                            color: st.color,
                            fontSize: '10px',
                            padding: '2px 7px',
                          }}
                        >
                          <StatusIcon className="w-2.5 h-2.5" />
                          {st.label}
                        </span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {esboco.referencia_biblica && (
                        <span
                          className="flex items-center gap-1 text-xs font-medium"
                          style={{ color: 'var(--brand)' }}
                        >
                          <BookOpen className="w-3 h-3 shrink-0" />
                          {esboco.referencia_biblica}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: 'var(--ink-4)' }}>
                        {format(new Date(esboco.updated_at), "d MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>

                    {/* Tags */}
                    {esboco.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {esboco.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-xs"
                            style={{ background: 'var(--surface-2)', color: 'var(--ink-3)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>

                  {/* Menu de contexto */}
                  <button
                    onClick={e => { e.preventDefault(); setMenu(menu === esboco.id ? null : esboco.id) }}
                    className="absolute right-2 top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition"
                    style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', color: 'var(--ink-3)' }}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {menu === esboco.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                      <div
                        className="absolute right-2 top-10 z-20 rounded-xl py-1.5 w-52 overflow-hidden"
                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}
                      >
                        <button
                          onClick={() => { startTransition(async () => { await toggleFixado(esboco.id, esboco.fixado) }); setMenu(null) }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm transition hover:bg-[var(--bg)]"
                          style={{ color: 'var(--ink-2)' }}
                        >
                          <Star className="w-3.5 h-3.5" style={{ color: 'var(--brand)', fill: esboco.fixado ? 'var(--brand)' : 'none' }} />
                          {esboco.fixado ? 'Desafixar' : 'Fixar'}
                        </button>

                        <div className="h-px mx-3 my-1" style={{ background: 'var(--line)' }} />
                        <p className="px-4 pt-0.5 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-4)' }}>
                          Status
                        </p>

                        {(['rascunho', 'pronto', 'pregado'] as const).map(s => {
                          const S = STATUS[s]
                          const Icon = S.icon
                          return (
                            <button
                              key={s}
                              onClick={() => { startTransition(async () => { await updateEsboco(esboco.id, { status: s }) }); setMenu(null) }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition hover:bg-[var(--bg)]"
                              style={{ color: esboco.status === s ? 'var(--brand)' : 'var(--ink-2)', fontWeight: esboco.status === s ? 600 : 400 }}
                            >
                              <span
                                className="flex items-center gap-1.5 rounded-md text-xs font-medium px-2 py-0.5"
                                style={{ background: S.bg, color: S.color }}
                              >
                                <Icon className="w-2.5 h-2.5" />
                                {S.label}
                              </span>
                            </button>
                          )
                        })}

                        <div className="h-px mx-3 my-1" style={{ background: 'var(--line)' }} />
                        <button
                          onClick={() => handleDelete(esboco.id)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm transition hover:bg-[var(--danger-bg)]"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir esboço
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
