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
  BookOpen, Calendar, ChevronRight, Pencil, CheckCircle2, Mic2
} from 'lucide-react'
import { deleteEsboco, toggleFixado, updateEsboco } from '@/lib/actions'

interface Props { esbocos: Esboco[]; pastas: Pasta[]; compacto?: boolean }

const STATUS = {
  rascunho: { label: 'Em edição', icon: Pencil,       color: '#B45309', bg: '#FEF3C7' },
  pronto:   { label: 'Pronto',    icon: CheckCircle2, color: '#15803D', bg: '#DCFCE7' },
  pregado:  { label: 'Pregado',   icon: Mic2,         color: '#1D4ED8', bg: '#DBEAFE' },
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

  const px = compacto ? 'px-3' : 'px-6'
  const cardPad = compacto ? 'p-3.5' : 'p-5'
  const maxW = compacto ? '' : 'max-w-2xl mx-auto w-full'

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)' }}>

      {/* Busca */}
      <div className={`${px} pt-4 pb-3`}>
        <div className={maxW}>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ border: '1.5px solid var(--line)', background: 'var(--bg)' }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--ink-4)' }} />
            <input
              type="text"
              placeholder="Buscar por tema, livro ou palavra-chave..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none"
              style={{ color: 'var(--ink-1)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="p-0.5" style={{ color: 'var(--ink-4)' }}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={`${px} pb-4 overflow-x-auto scrollbar-hide`}>
        <div className={`flex gap-2 ${maxW}`}>
          {pills.map(p => (
            <Link
              key={p.key}
              href={p.href}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap"
              style={filtroAtivo === p.key
                ? { background: 'var(--brand)', color: '#fff', boxShadow: 'var(--shadow-brand)' }
                : { background: 'var(--bg)', color: 'var(--ink-3)', border: '1px solid var(--line)' }
              }
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className={`flex-1 overflow-y-auto ${px} pb-6`}>
        <div className={`${maxW} space-y-3`}>
          {filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'var(--bg)', border: '1px solid var(--line)' }}
              >
                <FileText className="w-7 h-7" style={{ color: 'var(--ink-4)' }} />
              </div>
              <p className="text-base font-semibold mb-2" style={{ color: 'var(--ink-2)' }}>
                {search ? 'Nenhum resultado' : 'Nenhum esboço ainda'}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-4)' }}>
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
                    className={`block rounded-2xl transition-all ${cardPad}`}
                    style={{
                      background: isActive ? 'rgba(234,88,12,0.04)' : 'var(--surface)',
                      border: isActive ? '1.5px solid var(--brand)' : '1.5px solid var(--line)',
                      boxShadow: isActive ? '0 2px 12px rgba(234,88,12,0.12)' : 'var(--shadow-xs)',
                    }}
                  >
                    {/* Título + status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p
                        className={`font-bold leading-snug uppercase tracking-wide ${compacto ? 'text-sm' : 'text-base'}`}
                        style={{ color: 'var(--ink-1)' }}
                      >
                        {esboco.titulo || 'Sem título'}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {esboco.fixado && (
                          <Star className="w-3.5 h-3.5" style={{ color: 'var(--brand)', fill: 'var(--brand)' }} />
                        )}
                        <span
                          className="flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap"
                          style={{
                            background: st.bg,
                            color: st.color,
                            fontSize: '11px',
                            padding: '4px 10px',
                          }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {st.label}
                        </span>
                      </div>
                    </div>

                    {/* Referência + data */}
                    <div className="flex items-center gap-4 flex-wrap">
                      {esboco.referencia_biblica && (
                        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--ink-2)' }}>
                          <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--brand)' }} />
                          {esboco.referencia_biblica}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-4)' }}>
                        <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--brand)' }} />
                        {format(new Date(esboco.updated_at), "d MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>

                    {/* Tags */}
                    {esboco.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {esboco.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ background: 'var(--bg)', color: 'var(--ink-3)', border: '1px solid var(--line)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>

                  {/* Chevron */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.2 }}>
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--ink-1)' }} />
                  </div>

                  {/* Menu de contexto */}
                  <button
                    onClick={e => { e.preventDefault(); setMenu(menu === esboco.id ? null : esboco.id) }}
                    className="absolute right-3 top-3 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition"
                    style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', color: 'var(--ink-3)' }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {menu === esboco.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                      <div
                        className="absolute right-3 top-12 z-20 rounded-2xl py-2 w-52 overflow-hidden"
                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}
                      >
                        <button
                          onClick={() => { startTransition(async () => { await toggleFixado(esboco.id, esboco.fixado) }); setMenu(null) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-[var(--bg)]"
                          style={{ color: 'var(--ink-2)' }}
                        >
                          <Star className="w-4 h-4" style={{ color: 'var(--brand)', fill: esboco.fixado ? 'var(--brand)' : 'none' }} />
                          {esboco.fixado ? 'Desafixar' : 'Fixar'}
                        </button>

                        <div className="h-px mx-3 my-1.5" style={{ background: 'var(--line)' }} />
                        <p className="px-4 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--ink-4)' }}>
                          Alterar status
                        </p>

                        {(['rascunho', 'pronto', 'pregado'] as const).map(s => {
                          const S = STATUS[s]
                          const Icon = S.icon
                          return (
                            <button
                              key={s}
                              onClick={() => { startTransition(async () => { await updateEsboco(esboco.id, { status: s }) }); setMenu(null) }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-[var(--bg)]"
                              style={{ color: esboco.status === s ? 'var(--brand)' : 'var(--ink-2)', fontWeight: esboco.status === s ? 600 : 400 }}
                            >
                              <span
                                className="flex items-center gap-1.5 rounded-full text-xs font-semibold px-2 py-0.5"
                                style={{ background: S.bg, color: S.color }}
                              >
                                <Icon className="w-3 h-3" />
                                {S.label}
                              </span>
                            </button>
                          )
                        })}

                        <div className="h-px mx-3 my-1.5" style={{ background: 'var(--line)' }} />
                        <button
                          onClick={() => handleDelete(esboco.id)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-[var(--danger-bg)]"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 className="w-4 h-4" />
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
