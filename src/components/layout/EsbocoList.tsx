'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Esboco, Pasta } from '@/types'
import { Search, Star, MoreVertical, Trash2, X } from 'lucide-react'
import { deleteEsboco, toggleFixado, updateEsboco } from '@/lib/actions'

interface Props { esbocos: Esboco[]; pastas: Pasta[] }

const STATUS = {
  rascunho: { label: 'Rascunho', color: 'var(--ink-4)' },
  pronto:   { label: 'Pronto',   color: 'var(--success)' },
  pregado:  { label: 'Pregado',  color: 'var(--info)' },
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
    { key: 'todos',    label: 'Todos',    href: '/esbocos' },
    { key: 'fixados',  label: '★ Fixados', href: '/esbocos?filtro=fixados' },
    { key: 'rascunho', label: 'Rascunho', href: '/esbocos?filtro=rascunho' },
    { key: 'pronto',   label: 'Pronto',   href: '/esbocos?filtro=pronto' },
    { key: 'pregado',  label: 'Pregado',  href: '/esbocos?filtro=pregado' },
    ...pastas.map(p => ({ key: `pasta:${p.id}`, label: p.nome, href: `/esbocos?pasta=${p.id}` })),
  ]

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)' }}>

      {/* Busca */}
      <div className="px-4 pt-4 pb-3">
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}
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
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {pills.map(p => (
          <Link
            key={p.key}
            href={p.href}
            className="shrink-0 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition whitespace-nowrap"
            style={filtroAtivo === p.key
              ? { background: 'var(--brand)', color: '#fff' }
              : { color: 'var(--ink-4)', background: 'transparent' }
            }
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Contagem */}
      <div
        className="px-4 pb-2 border-b"
        style={{ borderColor: 'var(--line-soft)' }}
      >
        <span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--ink-4)' }}>
          {filtrados.length} esboço{filtrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 py-20 text-center">
            {/* Ornamento vazio */}
            <div className="flex items-center gap-3 mb-4 opacity-20">
              <div className="h-px w-12" style={{ background: 'var(--ink-4)' }} />
              <div className="w-1 h-1 rotate-45" style={{ background: 'var(--gold)' }} />
              <div className="h-px w-12" style={{ background: 'var(--ink-4)' }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-serif)' }}>
              {search ? 'Nenhum resultado' : 'Nenhum esboço ainda'}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-4)' }}>
              {search ? 'Tente buscar por outro termo' : 'Toque em + para criar seu primeiro esboço'}
            </p>
          </div>
        ) : (
          filtrados.map((esboco, idx) => {
            const isActive = idAtual === esboco.id
            return (
              <div key={esboco.id} className="relative group">
                {/* Separador entre itens */}
                {idx > 0 && (
                  <div className="mx-4" style={{ height: '1px', background: 'var(--line-soft)' }} />
                )}
                <Link
                  href={`/esbocos/${esboco.id}`}
                  className="block px-4 py-4 transition-colors"
                  style={isActive ? {
                    background: 'var(--hover)',
                    borderLeft: '2px solid var(--brand)',
                    paddingLeft: '14px',
                  } : {
                    borderLeft: '2px solid transparent',
                    paddingLeft: '14px',
                  }}
                >
                  {/* Título + estrela */}
                  <div className="flex items-start gap-2 mb-1">
                    <p
                      className="text-sm font-semibold leading-snug flex-1"
                      style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-serif)' }}
                    >
                      {esboco.titulo || 'Sem título'}
                    </p>
                    {esboco.fixado && (
                      <Star className="w-3 h-3 shrink-0 mt-0.5" style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                    )}
                  </div>

                  {/* Referência */}
                  {esboco.referencia_biblica && (
                    <p className="text-xs mb-2" style={{ color: 'var(--brand-light)', fontStyle: 'italic' }}>
                      {esboco.referencia_biblica}
                    </p>
                  )}

                  {/* Preview */}
                  <p className="text-xs mb-3 leading-relaxed line-clamp-2" style={{ color: 'var(--ink-3)' }}>
                    {stripHtml(esboco.introducao) || 'Sem introdução...'}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-1 h-1"
                        style={{ background: STATUS[esboco.status].color }}
                      />
                      <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: STATUS[esboco.status].color }}>
                        {STATUS[esboco.status].label}
                      </span>
                    </div>
                    <span className="text-[10px] ml-auto" style={{ color: 'var(--ink-4)' }}>
                      {formatDistanceToNow(new Date(esboco.updated_at), { locale: ptBR, addSuffix: true })}
                    </span>
                  </div>
                </Link>

                {/* Menu de contexto */}
                <button
                  onClick={e => { e.preventDefault(); setMenu(menu === esboco.id ? null : esboco.id) }}
                  className="absolute right-3 top-3.5 p-1.5 opacity-0 group-hover:opacity-100 transition"
                  style={{ color: 'var(--ink-4)' }}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {menu === esboco.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                    <div
                      className="absolute right-3 top-9 z-20 py-1.5 w-44 overflow-hidden"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      <button
                        onClick={() => { startTransition(async () => { await toggleFixado(esboco.id, esboco.fixado) }); setMenu(null) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs transition hover:bg-[var(--hover)]"
                        style={{ color: 'var(--ink-2)' }}
                      >
                        <Star className="w-3.5 h-3.5" style={{ color: 'var(--gold)', fill: esboco.fixado ? 'var(--gold)' : 'none' }} />
                        {esboco.fixado ? 'Desafixar' : 'Fixar'}
                      </button>

                      <div className="my-1 mx-4" style={{ height: '1px', background: 'var(--line-soft)' }} />
                      <p className="px-4 pb-1 pt-0.5 text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--ink-4)' }}>Status</p>

                      {(['rascunho', 'pronto', 'pregado'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => { startTransition(async () => { await updateEsboco(esboco.id, { status: s }) }); setMenu(null) }}
                          className="w-full flex items-center gap-2.5 px-4 py-1.5 text-xs transition hover:bg-[var(--hover)]"
                          style={{
                            color: esboco.status === s ? 'var(--brand)' : 'var(--ink-2)',
                            fontWeight: esboco.status === s ? 600 : 400,
                          }}
                        >
                          <div className="w-1.5 h-1.5" style={{ background: STATUS[s].color }} />
                          {STATUS[s].label}
                        </button>
                      ))}

                      <div className="my-1 mx-4" style={{ height: '1px', background: 'var(--line-soft)' }} />
                      <button
                        onClick={() => handleDelete(esboco.id)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs transition hover:bg-[var(--danger-bg)]"
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
