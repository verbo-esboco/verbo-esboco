'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Esboco, Pasta } from '@/types'
import { Plus, Search, Star, MoreVertical, Trash2, CheckCircle, FileText, Mic, X } from 'lucide-react'
import { createEsboco, deleteEsboco, toggleFixado, updateEsboco } from '@/lib/actions'

interface Props { esbocos: Esboco[]; pastas: Pasta[] }

const STATUS = {
  rascunho: { label: 'Rascunho', dot: 'bg-[var(--ink-4)]' },
  pronto:   { label: 'Pronto',   dot: 'bg-[var(--success)]' },
  pregado:  { label: 'Pregado',  dot: 'bg-[var(--info)]' },
}

export default function EsbocoList({ esbocos, pastas }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch]     = useState('')
  const [menu, setMenu]         = useState<string | null>(null)

  const filtro  = searchParams.get('filtro') ?? 'todos'
  const pastaId = searchParams.get('pasta')

  const filtrados = useMemo(() => {
    let lista = esbocos
    if (pastaId)                                lista = lista.filter(e => e.pasta_id === pastaId)
    else if (filtro === 'fixados')              lista = lista.filter(e => e.fixado)
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

  const titulo = pastaId
    ? (pastas.find(p => p.id === pastaId)?.nome ?? 'Pasta')
    : ({ todos: 'Todos', fixados: 'Fixados', rascunho: 'Rascunho', pronto: 'Pronto', pregado: 'Pregado' } as Record<string,string>)[filtro] ?? 'Todos'

  function handleNovo() {
    startTransition(async () => {
      const novo = await createEsboco(pastaId ?? undefined)
      router.push(`/esbocos/${novo.id}`)
    })
  }

  function handleDelete(id: string) {
    setMenu(null)
    startTransition(async () => {
      await deleteEsboco(id)
      if (pathname.includes(id)) router.push('/esbocos')
    })
  }

  const idAtual = pathname.split('/esbocos/')[1]

  return (
    <div className="w-64 flex flex-col border-r border-[var(--line)] bg-[var(--canvas)] shrink-0">

      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-[var(--ink-1)] tracking-tight">{titulo}</h2>
          <button
            onClick={handleNovo}
            disabled={isPending}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white transition shadow-sm disabled:opacity-50"
            title="Novo esboço"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--ink-4)]" />
          <input
            type="text"
            placeholder="Buscar esboços..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-6 py-1.5 text-xs bg-[var(--hover)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--ink-4)] text-[var(--ink-1)] transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-4)]">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {filtrados.length === 0 ? (
          <div className="text-center py-10 px-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--hover)] flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-[var(--ink-4)]" />
            </div>
            <p className="text-xs text-[var(--ink-3)]">
              {search ? 'Nenhum resultado' : 'Nenhum esboço ainda'}
            </p>
            {!search && (
              <button onClick={handleNovo} className="mt-2 text-xs text-[var(--brand)] hover:underline font-medium">
                Criar primeiro esboço
              </button>
            )}
          </div>
        ) : (
          filtrados.map(esboco => {
            const isActive = idAtual === esboco.id
            return (
              <div key={esboco.id} className="relative group">
                <Link
                  href={`/esbocos/${esboco.id}`}
                  className={`block px-4 py-3.5 border-b border-[var(--line-soft)] transition-colors ${
                    isActive
                      ? 'bg-[var(--surface)] border-l-2 border-l-[var(--brand)]'
                      : 'hover:bg-[var(--hover)]'
                  }`}
                >
                  {/* Título + fixado */}
                  <div className="flex items-start gap-1.5 mb-1">
                    {esboco.fixado && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />}
                    <p className={`text-xs font-semibold leading-tight truncate ${isActive ? 'text-[var(--ink-1)]' : 'text-[var(--ink-2)]'}`}>
                      {esboco.titulo || 'Sem título'}
                    </p>
                  </div>

                  {/* Referência */}
                  {esboco.referencia_biblica && (
                    <p className="text-[10px] text-[var(--brand)] font-medium truncate mb-1">
                      {esboco.referencia_biblica}
                    </p>
                  )}

                  {/* Preview */}
                  <p className="text-[10px] text-[var(--ink-3)] truncate mb-2 leading-relaxed">
                    {stripHtml(esboco.introducao) || 'Sem introdução...'}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS[esboco.status].dot}`} />
                    <span className="text-[9px] text-[var(--ink-4)] font-medium">{STATUS[esboco.status].label}</span>
                    <span className="text-[9px] text-[var(--ink-4)] ml-auto">
                      {formatDistanceToNow(new Date(esboco.updated_at), { locale: ptBR, addSuffix: true })}
                    </span>
                  </div>
                </Link>

                {/* Menu */}
                <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={e => { e.preventDefault(); setMenu(menu === esboco.id ? null : esboco.id) }}
                    className="p-1 rounded-md hover:bg-[var(--hover)] text-[var(--ink-4)]"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                </div>

                {menu === esboco.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                    <div className="absolute right-2 top-8 z-20 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--line)] py-1 w-44 overflow-hidden">
                      <button
                        onClick={() => { startTransition(async () => { await toggleFixado(esboco.id, esboco.fixado) }); setMenu(null) }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--ink-2)] hover:bg-[var(--hover)] transition"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        {esboco.fixado ? 'Desafixar' : 'Fixar'}
                      </button>
                      <div className="border-t border-[var(--line-soft)] my-1" />
                      <p className="px-3 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-[var(--ink-4)]">Status</p>
                      {(['rascunho', 'pronto', 'pregado'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => { startTransition(async () => { await updateEsboco(esboco.id, { status: s }) }); setMenu(null) }}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--hover)] transition ${esboco.status === s ? 'text-[var(--brand)] font-medium' : 'text-[var(--ink-2)]'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS[s].dot}`} />
                          {STATUS[s].label}
                        </button>
                      ))}
                      <div className="border-t border-[var(--line-soft)] my-1" />
                      <button
                        onClick={() => handleDelete(esboco.id)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition"
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
