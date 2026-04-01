'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Esboco, Pasta } from '@/types'
import {
  Plus, Search, Star, MoreVertical, Trash2,
  Pin, CheckCircle, FileText, Mic, X
} from 'lucide-react'
import { createEsboco, deleteEsboco, toggleFixado, updateEsboco } from '@/lib/actions'

interface Props {
  esbocos: Esboco[]
  pastas: Pasta[]
}

const STATUS_LABELS = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-600' },
  pronto: { label: 'Pronto', color: 'bg-green-100 text-green-700' },
  pregado: { label: 'Pregado', color: 'bg-blue-100 text-blue-700' },
}

export default function EsbocoList({ esbocos, pastas }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [menuAberto, setMenuAberto] = useState<string | null>(null)

  const filtro = searchParams.get('filtro') ?? 'todos'
  const pastaId = searchParams.get('pasta')

  const filtrados = useMemo(() => {
    let lista = esbocos

    if (pastaId) {
      lista = lista.filter(e => e.pasta_id === pastaId)
    } else if (filtro === 'fixados') {
      lista = lista.filter(e => e.fixado)
    } else if (filtro === 'rascunho' || filtro === 'pronto' || filtro === 'pregado') {
      lista = lista.filter(e => e.status === filtro)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      lista = lista.filter(e =>
        e.titulo.toLowerCase().includes(q) ||
        e.referencia_biblica.toLowerCase().includes(q) ||
        e.texto_biblico.toLowerCase().includes(q) ||
        e.introducao.toLowerCase().includes(q)
      )
    }

    return lista
  }, [esbocos, filtro, pastaId, search])

  const titulo = pastaId
    ? (pastas.find(p => p.id === pastaId)?.nome ?? 'Pasta')
    : { todos: 'Todos', fixados: 'Fixados', rascunho: 'Rascunho', pronto: 'Pronto', pregado: 'Pregado' }[filtro] ?? 'Todos'

  async function handleNovo() {
    startTransition(async () => {
      const novo = await createEsboco(pastaId ?? undefined)
      router.push(`/esbocos/${novo.id}`)
    })
  }

  function handleDelete(id: string) {
    setMenuAberto(null)
    startTransition(async () => {
      await deleteEsboco(id)
      if (pathname.includes(id)) router.push('/esbocos')
    })
  }

  function handleToggleFixado(id: string, fixado: boolean) {
    setMenuAberto(null)
    startTransition(async () => { await toggleFixado(id, fixado) })
  }

  function handleStatus(id: string, status: Esboco['status']) {
    setMenuAberto(null)
    startTransition(async () => { await updateEsboco(id, { status }) })
  }

  const idAtual = pathname.split('/esbocos/')[1]

  return (
    <div className="w-64 flex flex-col border-r border-[#e5e5e0] bg-[#fafaf8] shrink-0">
      {/* Header */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-[#1c1c1e]">{titulo}</h2>
          <button
            onClick={handleNovo}
            disabled={isPending}
            className="w-6 h-6 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-full transition disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b6b6b]" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-6 py-1.5 text-xs bg-[#ebebeb] rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 placeholder:text-[#9b9b9b]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b6b6b]">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {filtrados.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-xs text-[#6b6b6b]">
              {search ? 'Nenhum resultado encontrado' : 'Nenhum esboço aqui ainda'}
            </p>
            {!search && (
              <button
                onClick={handleNovo}
                className="mt-2 text-xs text-orange-500 hover:underline"
              >
                Criar primeiro esboço
              </button>
            )}
          </div>
        ) : (
          filtrados.map(esboco => (
            <div key={esboco.id} className="relative group">
              <Link
                href={`/esbocos/${esboco.id}`}
                className={`block px-3 py-3 border-b border-[#ebebeb] transition ${
                  idAtual === esboco.id
                    ? 'bg-orange-50 border-l-2 border-l-orange-500'
                    : 'hover:bg-[#f0f0ec]'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      {esboco.fixado && (
                        <Star className="w-3 h-3 text-orange-400 fill-orange-400 shrink-0" />
                      )}
                      <p className="text-xs font-semibold text-[#1c1c1e] truncate">
                        {esboco.titulo || 'Sem título'}
                      </p>
                    </div>
                    {esboco.referencia_biblica && (
                      <p className="text-[10px] text-orange-500 font-medium truncate mb-0.5">
                        {esboco.referencia_biblica}
                      </p>
                    )}
                    <p className="text-[10px] text-[#6b6b6b] truncate">
                      {stripHtml(esboco.introducao) || 'Sem introdução...'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_LABELS[esboco.status].color}`}>
                        {STATUS_LABELS[esboco.status].label}
                      </span>
                      <span className="text-[9px] text-[#9b9b9b]">
                        {formatDistanceToNow(new Date(esboco.updated_at), { locale: ptBR, addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Menu de contexto */}
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={e => { e.preventDefault(); setMenuAberto(menuAberto === esboco.id ? null : esboco.id) }}
                  className="p-1 rounded hover:bg-[#e5e5e0] text-[#6b6b6b]"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              {menuAberto === esboco.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(null)} />
                  <div className="absolute right-2 top-8 z-20 bg-white rounded-xl shadow-lg border border-[#e5e5e0] py-1 w-44">
                    <button
                      onClick={() => handleToggleFixado(esboco.id, esboco.fixado)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1c1c1e] hover:bg-[#f5f5f0] transition"
                    >
                      <Star className="w-3.5 h-3.5 text-orange-400" />
                      {esboco.fixado ? 'Desafixar' : 'Fixar'}
                    </button>
                    <div className="border-t border-[#e5e5e0] my-1" />
                    <p className="px-3 py-0.5 text-[9px] font-semibold text-[#6b6b6b] uppercase">Status</p>
                    {(['rascunho', 'pronto', 'pregado'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatus(esboco.id, s)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#f5f5f0] transition ${esboco.status === s ? 'text-orange-500 font-medium' : 'text-[#1c1c1e]'}`}
                      >
                        {s === 'rascunho' && <FileText className="w-3.5 h-3.5" />}
                        {s === 'pronto' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                        {s === 'pregado' && <Mic className="w-3.5 h-3.5 text-blue-500" />}
                        {STATUS_LABELS[s].label}
                      </button>
                    ))}
                    <div className="border-t border-[#e5e5e0] my-1" />
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
          ))
        )}
      </div>
    </div>
  )
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}
