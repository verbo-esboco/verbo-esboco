'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Esboco, Pasta } from '@/types'
import { Search, Star, MoreVertical, Trash2, X, FileText } from 'lucide-react'
import { deleteEsboco, toggleFixado, updateEsboco } from '@/lib/actions'

interface Props { esbocos: Esboco[]; pastas: Pasta[] }

const STATUS = {
  rascunho: { label: 'Rascunho', color: '#A1A1AA',  bg: '#F4F4F5' },
  pronto:   { label: 'Pronto',   color: '#16A34A',  bg: '#F0FDF4' },
  pregado:  { label: 'Pregado',  color: '#2563EB',  bg: '#EFF6FF' },
}

export default function EsbocoList({ esbocos, pastas }: Props) {
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
    { key: 'rascunho', label: 'Rascunho',  href: '/esbocos?filtro=rascunho' },
    { key: 'pronto',   label: 'Pronto',    href: '/esbocos?filtro=pronto' },
    { key: 'pregado',  label: 'Pregado',   href: '/esbocos?filtro=pregado' },
    ...pastas.map(p => ({ key: `pasta:${p.id}`, label: p.nome, href: `/esbocos?pasta=${p.id}` })),
  ]

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)' }}>

      {/* Busca */}
      <div className="px-3 pt-3 pb-2">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ border: '1.5px solid var(--line)', background: 'var(--bg)' }}
        >
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ink-4)' }} />
          <input
            type="text"
            placeholder="Buscar esboços..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent focus:outline-none"
            style={{ color: 'var(--ink-1)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--ink-4)' }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-hide">
        {pills.map(p => (
          <Link
            key={p.key}
            href={p.href}
            className="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition whitespace-nowrap"
            style={filtroAtivo === p.key
              ? { background: 'var(--brand)', color: '#fff' }
              : { background: 'var(--bg)', color: 'var(--ink-3)' }
            }
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Contagem */}
      <div className="px-3 pb-2">
        <span className="text-[11px]" style={{ color: 'var(--ink-4)' }}>
          {filtrados.length} esboço{filtrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-20 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'var(--bg)' }}
            >
              <FileText className="w-6 h-6" style={{ color: 'var(--ink-4)' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-2)' }}>
              {search ? 'Nenhum resultado' : 'Nenhum esboço ainda'}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-4)' }}>
              {search ? 'Tente buscar por outro termo' : 'Toque em Novo para criar seu primeiro esboço'}
            </p>
          </div>
        ) : (
          filtrados.map(esboco => {
            const isActive = idAtual === esboco.id
            const st = STATUS[esboco.status]
            return (
              <div key={esboco.id} className="relative group">
                <Link
                  href={`/esbocos/${esboco.id}`}
                  className="block rounded-xl p-3 transition-all"
                  style={isActive ? {
                    background: 'rgba(234,88,12,0.06)',
                    border: '1.5px solid rgba(234,88,12,0.25)',
                  } : {
                    background: 'transparent',
                    border: '1.5px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg)' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {/* Título + estrela */}
                  <div className="flex items-start gap-2 mb-0.5">
                    <p className="text-sm font-semibold leading-snug flex-1 pr-5" style={{ color: 'var(--ink-1)' }}>
                      {esboco.titulo || 'Sem título'}
                    </p>
                    {esboco.fixado && (
                      <Star className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--brand)', fill: 'var(--brand)' }} />
                    )}
                  </div>

                  {/* Referência */}
                  {esboco.referencia_biblica && (
                    <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--brand)' }}>
                      {esboco.referencia_biblica}
                    </p>
                  )}

                  {/* Preview */}
                  <p className="text-xs mb-2.5 leading-relaxed line-clamp-2" style={{ color: 'var(--ink-3)' }}>
                    {stripHtml(esboco.introducao) || 'Sem introdução...'}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {st.label}
                    </span>
                    <span className="text-[10px] ml-auto" style={{ color: 'var(--ink-4)' }}>
                      {formatDistanceToNow(new Date(esboco.updated_at), { locale: ptBR, addSuffix: true })}
                    </span>
                  </div>
                </Link>

                {/* Menu */}
                <button
                  onClick={e => { e.preventDefault(); setMenu(menu === esboco.id ? null : esboco.id) }}
                  className="absolute right-2 top-2.5 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition"
                  style={{ background: 'var(--surface)', color: 'var(--ink-4)' }}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {menu === esboco.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                    <div
                      className="absolute right-2 top-9 z-20 rounded-xl py-1.5 w-48 overflow-hidden"
                      style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}
                    >
                      <button
                        onClick={() => { startTransition(async () => { await toggleFixado(esboco.id, esboco.fixado) }); setMenu(null) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition hover:bg-[var(--bg)]"
                        style={{ color: 'var(--ink-2)' }}
                      >
                        <Star className="w-3.5 h-3.5" style={{ color: 'var(--brand)', fill: esboco.fixado ? 'var(--brand)' : 'none' }} />
                        {esboco.fixado ? 'Desafixar' : 'Fixar'}
                      </button>

                      <div className="h-px mx-3 my-1" style={{ background: 'var(--line)' }} />
                      <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--ink-4)' }}>Status</p>

                      {(['rascunho', 'pronto', 'pregado'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => { startTransition(async () => { await updateEsboco(esboco.id, { status: s }) }); setMenu(null) }}
                          className="w-full flex items-center gap-2.5 px-4 py-1.5 text-sm transition hover:bg-[var(--bg)]"
                          style={{ color: esboco.status === s ? 'var(--brand)' : 'var(--ink-2)', fontWeight: esboco.status === s ? 600 : 400 }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ background: STATUS[s].color }} />
                          {STATUS[s].label}
                        </button>
                      ))}

                      <div className="h-px mx-3 my-1" style={{ background: 'var(--line)' }} />
                      <button
                        onClick={() => handleDelete(esboco.id)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition hover:bg-[var(--danger-bg)]"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
  )
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').trim()
}
