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
  rascunho: { label: 'Em edição', icon: Pencil,       color: '#92400E', bg: '#FEF3C7' },
  pronto:   { label: 'Pronto',    icon: CheckCircle2, color: '#166534', bg: '#DCFCE7' },
  pregado:  { label: 'Pregado',   icon: Mic2,         color: '#1E40AF', bg: '#DBEAFE' },
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

  const px = compacto ? 'px-5' : 'px-8'
  const maxW = compacto ? '' : 'max-w-xl mx-auto w-full'

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)' }}>

      {/* Busca */}
      <div className={`${px} pt-5 pb-4`}>
        <div className={maxW}>
          <div
            className="flex items-center gap-2"
            style={{ borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}
          >
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ink-4)' }} />
            <input
              type="text"
              placeholder="Buscar…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none"
              style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-sans)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--ink-4)' }}>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={`${px} pb-5 overflow-x-auto scrollbar-hide`}>
        <div className={`flex gap-4 ${maxW}`}>
          {pills.map(p => (
            <Link
              key={p.key}
              href={p.href}
              className="shrink-0 text-xs transition whitespace-nowrap"
              style={{
                color: filtroAtivo === p.key ? 'var(--ink-1)' : 'var(--ink-4)',
                fontWeight: filtroAtivo === p.key ? 700 : 400,
                textDecoration: filtroAtivo === p.key ? 'underline' : 'none',
                textUnderlineOffset: '3px',
                letterSpacing: '0.03em',
              }}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Divisor */}
      <div className={px} style={{ marginBottom: '0' }}>
        <div className={maxW} style={{ borderTop: '1px solid var(--line)' }} />
      </div>

      {/* Lista estilo Radcliffe — entradas editoriais */}
      <div className={`flex-1 overflow-y-auto ${px} pb-8`}>
        <div className={maxW}>
          {filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <FileText className="w-6 h-6 mb-4" style={{ color: 'var(--ink-4)' }} />
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-2)', fontFamily: 'var(--font-serif)' }}>
                {search ? 'Nenhum resultado' : 'Nenhum esboço ainda'}
              </p>
              <p className="text-xs" style={{ color: 'var(--ink-4)' }}>
                {search ? 'Tente buscar por outro termo' : 'Clique em Novo para criar seu primeiro esboço'}
              </p>
            </div>
          ) : (
            filtrados.map(esboco => {
              const isActive = idAtual === esboco.id
              const st = STATUS[esboco.status]
              const StatusIcon = st.icon

              return (
                <div
                  key={esboco.id}
                  className="relative group"
                  style={{ borderBottom: '1px solid var(--line)' }}
                >
                  <Link
                    href={`/esbocos/${esboco.id}`}
                    className="block transition-colors"
                    style={{ padding: compacto ? '14px 0' : '20px 0' }}
                  >
                    {/* Meta superior — data + status */}
                    <div className="flex items-center gap-3 mb-1.5">
                      <span
                        className="uppercase tracking-widest"
                        style={{ fontSize: '0.65rem', color: 'var(--ink-4)', letterSpacing: '0.1em' }}
                      >
                        {format(new Date(esboco.updated_at), "d MMM yyyy", { locale: ptBR })}
                      </span>
                      <span
                        className="uppercase tracking-widest"
                        style={{
                          fontSize: '0.65rem',
                          color: st.color,
                          letterSpacing: '0.1em',
                          fontWeight: 600,
                        }}
                      >
                        {st.label}
                      </span>
                      {esboco.fixado && (
                        <Star className="w-2.5 h-2.5" style={{ color: 'var(--brand)', fill: 'var(--brand)' }} />
                      )}
                    </div>

                    {/* Título — protagonista */}
                    <h2
                      className="leading-snug mb-1.5"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: compacto ? '0.9375rem' : '1.0625rem',
                        fontWeight: 700,
                        color: isActive ? 'var(--brand)' : 'var(--ink-1)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {esboco.titulo || 'Sem título'}
                    </h2>

                    {/* Referência */}
                    {esboco.referencia_biblica && (
                      <p
                        className="flex items-center gap-1"
                        style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', fontStyle: 'italic' }}
                      >
                        <BookOpen className="w-3 h-3 shrink-0" style={{ color: 'var(--ink-4)' }} />
                        {esboco.referencia_biblica}
                      </p>
                    )}

                    {/* Tags */}
                    {esboco.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {esboco.tags.map(tag => (
                          <span
                            key={tag}
                            className="uppercase tracking-widest"
                            style={{ fontSize: '0.6rem', color: 'var(--ink-4)', letterSpacing: '0.1em' }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>

                  {/* Menu de contexto */}
                  <button
                    onClick={e => { e.preventDefault(); setMenu(menu === esboco.id ? null : esboco.id) }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 transition"
                    style={{ color: 'var(--ink-4)' }}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {menu === esboco.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                      <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 py-1 w-48 overflow-hidden"
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--line)',
                          boxShadow: 'var(--shadow-md)',
                        }}
                      >
                        <button
                          onClick={() => { startTransition(async () => { await toggleFixado(esboco.id, esboco.fixado) }); setMenu(null) }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs transition hover:bg-[var(--hover)]"
                          style={{ color: 'var(--ink-2)', letterSpacing: '0.02em' }}
                        >
                          <Star className="w-3 h-3" style={{ color: 'var(--brand)', fill: esboco.fixado ? 'var(--brand)' : 'none' }} />
                          {esboco.fixado ? 'Desafixar' : 'Fixar'}
                        </button>

                        <div className="h-px mx-3 my-1" style={{ background: 'var(--line)' }} />
                        <p className="px-4 pb-1 pt-0.5 uppercase tracking-widest" style={{ fontSize: '0.6rem', color: 'var(--ink-4)' }}>
                          Status
                        </p>

                        {(['rascunho', 'pronto', 'pregado'] as const).map(s => {
                          const S = STATUS[s]
                          const Icon = S.icon
                          return (
                            <button
                              key={s}
                              onClick={() => { startTransition(async () => { await updateEsboco(esboco.id, { status: s }) }); setMenu(null) }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs transition hover:bg-[var(--hover)]"
                              style={{
                                color: esboco.status === s ? 'var(--ink-1)' : 'var(--ink-3)',
                                fontWeight: esboco.status === s ? 700 : 400,
                                letterSpacing: '0.02em',
                              }}
                            >
                              <Icon className="w-3 h-3" />
                              {S.label}
                            </button>
                          )
                        })}

                        <div className="h-px mx-3 my-1" style={{ background: 'var(--line)' }} />
                        <button
                          onClick={() => handleDelete(esboco.id)}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs transition hover:bg-[var(--danger-bg)]"
                          style={{ color: 'var(--danger)', letterSpacing: '0.02em' }}
                        >
                          <Trash2 className="w-3 h-3" />
                          Excluir
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
