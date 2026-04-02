'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Esboco, Pasta } from '@/types'
import {
  BookOpen, Star, CheckCircle, FileText, Mic,
  Plus, LogOut, ChevronLeft, ChevronRight,
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

const CORES = ['#C8531A','#2D6A4F','#1D4E89','#7B3FA0','#92620A','#6B1A1A','#2C5F6B','#4A4A4A']

export default function Sidebar({ user, pastas, esbocos, open, onToggle }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showNovaPasta, setShowNovaPasta] = useState(false)
  const [nomePasta, setNomePasta] = useState('')
  const [corPasta, setCorPasta] = useState(CORES[0])

  const filtroAtual = searchParams.get('filtro') ?? 'todos'
  const pastaAtual  = searchParams.get('pasta')

  const counts = {
    todos:     esbocos.length,
    fixados:   esbocos.filter(e => e.fixado).length,
    rascunho:  esbocos.filter(e => e.status === 'rascunho').length,
    pronto:    esbocos.filter(e => e.status === 'pronto').length,
    pregado:   esbocos.filter(e => e.status === 'pregado').length,
  }

  function handleCriarPasta() {
    if (!nomePasta.trim()) return
    startTransition(async () => {
      await createPasta(nomePasta.trim(), corPasta)
      setNomePasta(''); setCorPasta(CORES[0]); setShowNovaPasta(false)
    })
  }

  if (!open) return (
    <div className="w-10 flex flex-col items-center pt-4 border-r border-[var(--line)] bg-[var(--sidebar)]">
      <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--ink-3)] transition">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <aside className="w-56 flex flex-col border-r border-[var(--line)] bg-[var(--sidebar)] shrink-0">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--brand)] flex items-center justify-center shadow-sm">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-bold text-base tracking-tight text-[var(--ink-1)]">VERBO</span>
        </div>
        <button onClick={onToggle} className="p-1 rounded-md hover:bg-[var(--hover)] text-[var(--ink-4)] transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">

        {/* Seção Esboços */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-4)] px-2 py-2 mt-1">Esboços</p>

        <NavItem
          href="/esbocos"
          active={pathname === '/esbocos' && !filtroAtual || filtroAtual === 'todos'}
          icon={<FileText className="w-3.5 h-3.5" />}
          label="Todos"
          count={counts.todos}
        />
        <NavItem
          href="/esbocos?filtro=fixados"
          active={filtroAtual === 'fixados'}
          icon={<Star className="w-3.5 h-3.5" />}
          label="Fixados"
          count={counts.fixados}
          iconColor="text-amber-500"
        />

        {/* Seção Status */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-4)] px-2 py-2 mt-3">Status</p>

        <NavItem
          href="/esbocos?filtro=rascunho"
          active={filtroAtual === 'rascunho'}
          icon={<FileText className="w-3.5 h-3.5" />}
          label="Rascunho"
          count={counts.rascunho}
          iconColor="text-[var(--ink-3)]"
        />
        <NavItem
          href="/esbocos?filtro=pronto"
          active={filtroAtual === 'pronto'}
          icon={<CheckCircle className="w-3.5 h-3.5" />}
          label="Pronto"
          count={counts.pronto}
          iconColor="text-[var(--success)]"
        />
        <NavItem
          href="/esbocos?filtro=pregado"
          active={filtroAtual === 'pregado'}
          icon={<Mic className="w-3.5 h-3.5" />}
          label="Pregado"
          count={counts.pregado}
          iconColor="text-[var(--info)]"
        />

        {/* Seção Pastas */}
        <div className="flex items-center justify-between px-2 py-2 mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-4)]">Pastas</p>
          <button
            onClick={() => setShowNovaPasta(true)}
            className="w-4 h-4 flex items-center justify-center rounded hover:bg-[var(--hover)] text-[var(--ink-4)] transition"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {pastas.map(pasta => (
          <div key={pasta.id} className="group flex items-center gap-1">
            <Link
              href={`/esbocos?pasta=${pasta.id}`}
              className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition ${
                pastaAtual === pasta.id
                  ? 'bg-[var(--surface)] text-[var(--ink-1)] shadow-sm'
                  : 'text-[var(--ink-2)] hover:bg-[var(--hover)]'
              }`}
            >
              <Folder className="w-3.5 h-3.5 shrink-0" style={{ color: pasta.cor }} />
              <span className="truncate">{pasta.nome}</span>
              <span className="ml-auto text-[10px] text-[var(--ink-4)]">
                {esbocos.filter(e => e.pasta_id === pasta.id).length}
              </span>
            </Link>
            <button
              onClick={() => startTransition(async () => { await deletaPasta(pasta.id) })}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-[var(--ink-4)] hover:text-red-500 transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {showNovaPasta && (
          <div className="mt-1 p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)] space-y-2.5">
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
              className="w-full text-xs px-2.5 py-1.5 border border-[var(--line)] rounded-lg bg-[var(--canvas)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)] text-[var(--ink-1)] placeholder:text-[var(--ink-4)]"
            />
            <div className="flex gap-1.5 flex-wrap">
              {CORES.map(cor => (
                <button
                  key={cor}
                  onClick={() => setCorPasta(cor)}
                  className={`w-4 h-4 rounded-full transition ${corPasta === cor ? 'ring-2 ring-offset-1 ring-[var(--ink-3)]' : ''}`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleCriarPasta}
                disabled={!nomePasta.trim() || isPending}
                className="flex-1 bg-[var(--brand)] text-white text-xs py-1.5 rounded-lg hover:bg-[var(--brand-hover)] disabled:opacity-50 transition font-medium"
              >
                Criar
              </button>
              <button
                onClick={() => setShowNovaPasta(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--ink-3)] transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Footer — usuário */}
      <div className="border-t border-[var(--line)] px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[var(--brand-muted)] flex items-center justify-center shrink-0">
            <span className="text-[var(--brand)] font-semibold text-xs">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <span className="text-xs text-[var(--ink-3)] truncate flex-1 leading-tight">{user?.email}</span>
          <form action={signOut}>
            <button type="submit" className="p-1 rounded-lg hover:bg-[var(--hover)] text-[var(--ink-4)] hover:text-[var(--ink-2)] transition" title="Sair">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}

function deletaPasta(id: string) {
  return deletePasta(id)
}

function NavItem({ href, active, icon, label, count, iconColor = 'text-[var(--brand)]' }: {
  href: string
  active: boolean
  icon: React.ReactNode
  label: string
  count: number
  iconColor?: string
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? 'bg-[var(--surface)] text-[var(--ink-1)] shadow-sm'
          : 'text-[var(--ink-2)] hover:bg-[var(--hover)] hover:text-[var(--ink-1)]'
      }`}
    >
      <span className={active ? iconColor : 'text-[var(--ink-4)]'}>{icon}</span>
      <span>{label}</span>
      {count > 0 && (
        <span className="ml-auto text-[10px] text-[var(--ink-4)] tabular-nums">{count}</span>
      )}
    </Link>
  )
}
