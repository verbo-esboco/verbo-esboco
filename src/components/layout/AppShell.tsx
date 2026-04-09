'use client'

import { useTransition } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Esboco, Pasta } from '@/types'
import EsbocoList from './EsbocoList'
import { Plus, LogOut, ArrowLeft } from 'lucide-react'
import { signOut, createEsboco } from '@/lib/actions'

interface Props {
  user: User | null
  esbocos: Esboco[]
  pastas: Pasta[]
  children: React.ReactNode
}

export default function AppShell({ user, esbocos, pastas, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = pathname !== '/esbocos' && pathname.startsWith('/esbocos/')

  function handleNovo() {
    startTransition(async () => {
      const novo = await createEsboco()
      router.push(`/esbocos/${novo.id}`)
    })
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Painel da Lista ──────────────────────────────────── */}
      <div
        className={`flex flex-col md:w-80 lg:w-96 ${isEditing ? 'hidden md:flex' : 'flex flex-1'}`}
        style={{ borderRight: '1px solid var(--line)', background: 'var(--surface)' }}
      >
        {/* Cabeçalho mobile */}
        <div
          className="md:hidden flex items-center justify-between px-5 pb-4 border-b"
          style={{
            borderColor: 'var(--line)',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)',
          }}
        >
          <div>
            <p
              className="font-bold text-xl tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-1)' }}
            >
              VERBO
            </p>
            <p className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: 'var(--ink-4)' }}>
              Esboços Bíblicos
            </p>
          </div>
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{ border: '1px solid var(--line)', background: 'var(--surface-2)' }}
          >
            <span className="text-xs font-bold" style={{ color: 'var(--brand)', fontFamily: 'var(--font-serif)' }}>
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
        </div>

        {/* Cabeçalho desktop */}
        <div
          className="hidden md:flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--line)' }}
        >
          <div>
            <p
              className="font-bold text-lg tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-1)' }}
            >
              VERBO
            </p>
            <p className="text-[9px] tracking-[0.2em] uppercase mt-0.5" style={{ color: 'var(--ink-4)' }}>
              Esboços Bíblicos
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNovo}
              disabled={isPending}
              className="w-7 h-7 flex items-center justify-center transition hover:opacity-70 disabled:opacity-50"
              style={{ background: 'var(--brand)', color: '#fff' }}
              title="Novo esboço"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <form action={signOut}>
              <button
                type="submit"
                className="w-7 h-7 flex items-center justify-center transition hover:opacity-60"
                style={{ color: 'var(--ink-4)' }}
                title="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-hidden">
          <EsbocoList esbocos={esbocos} pastas={pastas} />
        </div>

        {/* Bottom nav mobile */}
        <div
          className="md:hidden flex items-center justify-around border-t px-6"
          style={{
            borderColor: 'var(--line)',
            paddingTop: '0.75rem',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)',
            background: 'var(--surface)',
          }}
        >
          <Link href="/esbocos" className="flex flex-col items-center gap-1">
            {/* Ornamento livro */}
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--brand)' }}>
              <rect x="3" y="3" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="7" y1="3" x2="7" y2="17" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: 'var(--brand)' }}>Esboços</span>
          </Link>

          <button
            onClick={handleNovo}
            disabled={isPending}
            className="w-14 h-14 flex items-center justify-center text-white transition -mt-7 disabled:opacity-60 hover:opacity-80"
            style={{ background: 'var(--brand)', boxShadow: 'var(--shadow-fab)' }}
          >
            <Plus className="w-6 h-6" />
          </button>

          <form action={signOut}>
            <button type="submit" className="flex flex-col items-center gap-1">
              <div
                className="w-5 h-5 flex items-center justify-center"
                style={{ border: '1px solid var(--line)' }}
              >
                <span className="text-[10px] font-bold" style={{ color: 'var(--brand)', fontFamily: 'var(--font-serif)' }}>
                  {user?.email?.[0]?.toUpperCase() ?? 'U'}
                </span>
              </div>
              <span className="text-[9px] font-medium tracking-wider uppercase" style={{ color: 'var(--ink-4)' }}>Conta</span>
            </button>
          </form>
        </div>
      </div>

      {/* ── Painel do Editor ─────────────────────────────────── */}
      <div className={`flex flex-col flex-1 overflow-hidden ${!isEditing ? 'hidden md:flex' : 'flex'}`}>

        {/* Barra superior mobile no editor */}
        {isEditing && (
          <div
            className="md:hidden flex items-center gap-3 px-4 pb-3 border-b"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--line)',
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
            }}
          >
            <Link
              href="/esbocos"
              className="flex items-center gap-1.5 text-xs font-semibold transition hover:opacity-70"
              style={{ color: 'var(--brand)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </Link>
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>

    </div>
  )
}
