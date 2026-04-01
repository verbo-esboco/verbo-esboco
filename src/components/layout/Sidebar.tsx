'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Esboco, Pasta } from '@/types'
import {
  BookOpen, FolderOpen, Star, CheckCircle, FileText,
  Mic, Plus, LogOut, ChevronLeft, ChevronRight,
  Folder, Trash2, X
} from 'lucide-react'
import { signOut, createPasta, deletePasta } from '@/lib/actions'

interface Props {
  user: User | null
  pastas: Pasta[]
  esbocos: Esboco[]
  open: boolean
  onToggle: () => void
}

const CORES = [
  '#f97316', '#3b82f6', '#10b981', '#8b5cf6',
  '#ec4899', '#f59e0b', '#ef4444', '#6b7280'
]

export default function Sidebar({ user, pastas, esbocos, open, onToggle }: Props) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [showNovaPasta, setShowNovaPasta] = useState(false)
  const [nomePasta, setNomePasta] = useState('')
  const [corPasta, setCorPasta] = useState(CORES[0])

  const counts = {
    todos: esbocos.length,
    fixados: esbocos.filter(e => e.fixado).length,
    rascunho: esbocos.filter(e => e.status === 'rascunho').length,
    pronto: esbocos.filter(e => e.status === 'pronto').length,
    pregado: esbocos.filter(e => e.status === 'pregado').length,
  }

  function handleCriarPasta() {
    if (!nomePasta.trim()) return
    startTransition(async () => {
      await createPasta(nomePasta.trim(), corPasta)
      setNomePasta('')
      setCorPasta(CORES[0])
      setShowNovaPasta(false)
    })
  }

  function handleDeletarPasta(id: string) {
    startTransition(() => deletePasta(id))
  }

  if (!open) {
    return (
      <div className="w-10 flex flex-col items-center pt-4 border-r border-[#e5e5e0] bg-[#f5f5f0]">
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-[#e5e5e0] text-[#6b6b6b] transition">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-52 flex flex-col border-r border-[#e5e5e0] bg-[#f5f5f0] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-[#1c1c1e]">VERBO</span>
        </div>
        <button onClick={onToggle} className="p-1 rounded-lg hover:bg-[#e5e5e0] text-[#6b6b6b] transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {/* Filtros */}
        <p className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider px-2 py-1">Esboços</p>

        <NavItem href="/esbocos" icon={<FileText className="w-4 h-4" />} label="Todos" count={counts.todos} />
        <NavItem href="/esbocos?filtro=fixados" icon={<Star className="w-4 h-4" />} label="Fixados" count={counts.fixados} />

        <p className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider px-2 py-1 mt-2">Status</p>

        <NavItem href="/esbocos?filtro=rascunho" icon={<FileText className="w-4 h-4" />} label="Rascunho" count={counts.rascunho} color="text-gray-500" />
        <NavItem href="/esbocos?filtro=pronto" icon={<CheckCircle className="w-4 h-4" />} label="Pronto" count={counts.pronto} color="text-green-600" />
        <NavItem href="/esbocos?filtro=pregado" icon={<Mic className="w-4 h-4" />} label="Pregado" count={counts.pregado} color="text-blue-600" />

        {/* Pastas */}
        <div className="flex items-center justify-between px-2 py-1 mt-2">
          <p className="text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Pastas</p>
          <button
            onClick={() => setShowNovaPasta(true)}
            className="p-0.5 rounded hover:bg-[#e5e5e0] text-[#6b6b6b] transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {pastas.map(pasta => (
          <div key={pasta.id} className="group flex items-center gap-1">
            <Link
              href={`/esbocos?pasta=${pasta.id}`}
              className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-[#1c1c1e] hover:bg-[#e5e5e0] transition"
            >
              <Folder className="w-4 h-4 shrink-0" style={{ color: pasta.cor }} />
              <span className="truncate text-xs">{pasta.nome}</span>
              <span className="ml-auto text-[10px] text-[#6b6b6b]">
                {esbocos.filter(e => e.pasta_id === pasta.id).length}
              </span>
            </Link>
            <button
              onClick={() => handleDeletarPasta(pasta.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-[#6b6b6b] hover:text-red-500 transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Nova pasta form */}
        {showNovaPasta && (
          <div className="mt-1 p-2 bg-white rounded-xl border border-[#e5e5e0] space-y-2">
            <input
              autoFocus
              type="text"
              placeholder="Nome da pasta"
              value={nomePasta}
              onChange={e => setNomePasta(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCriarPasta()
                if (e.key === 'Escape') setShowNovaPasta(false)
              }}
              className="w-full text-xs px-2 py-1.5 border border-[#e5e5e0] rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            <div className="flex gap-1 flex-wrap">
              {CORES.map(cor => (
                <button
                  key={cor}
                  onClick={() => setCorPasta(cor)}
                  className={`w-5 h-5 rounded-full transition ${corPasta === cor ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleCriarPasta}
                disabled={!nomePasta.trim() || isPending}
                className="flex-1 bg-orange-500 text-white text-xs py-1 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
              >
                Criar
              </button>
              <button
                onClick={() => setShowNovaPasta(false)}
                className="p-1 rounded-lg hover:bg-[#e5e5e0] text-[#6b6b6b] transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-[#e5e5e0] px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-semibold text-xs shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="text-xs text-[#6b6b6b] truncate flex-1">{user?.email}</span>
          <form action={signOut}>
            <button type="submit" className="p-1 rounded-lg hover:bg-[#e5e5e0] text-[#6b6b6b] transition">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function NavItem({
  href, icon, label, count, color = 'text-orange-500'
}: {
  href: string
  icon: React.ReactNode
  label: string
  count: number
  color?: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/esbocos' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition ${
        isActive
          ? 'bg-white shadow-sm text-[#1c1c1e]'
          : 'text-[#4a4a4a] hover:bg-[#e5e5e0]'
      }`}
    >
      <span className={isActive ? color : 'text-[#6b6b6b]'}>{icon}</span>
      <span>{label}</span>
      {count > 0 && (
        <span className="ml-auto text-[10px] text-[#6b6b6b] font-normal">{count}</span>
      )}
    </Link>
  )
}
