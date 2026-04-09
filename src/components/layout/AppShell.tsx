'use client'

import { useTransition } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Esboco, Pasta } from '@/types'
import EsbocoList from './EsbocoList'
import { Plus, LogOut, ArrowLeft, Home, History } from 'lucide-react'
import { signOut, createEsboco } from '@/lib/actions'
import Image from 'next/image'

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

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <div
        className={`flex flex-col md:w-[340px] lg:w-[380px] shrink-0 ${isEditing ? 'hidden md:flex' : 'flex flex-1'}`}
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--line)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-2.5">
            <Image src="/verbo.png" alt="VERBO" width={32} height={32} className="object-contain" />
            <div>
              <p className="font-bold text-sm leading-tight tracking-tight" style={{ color: 'var(--ink-1)' }}>VERBO</p>
              <p className="text-[10px] leading-tight" style={{ color: 'var(--ink-4)' }}>Esboços Bíblicos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNovo}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--brand)', boxShadow: 'var(--shadow-brand)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Novo
            </button>
            <form action={signOut}>
              <button
                type="submit"
                className="w-8 h-8 flex items-center justify-center rounded-full transition hover:bg-[var(--bg)]"
                style={{ color: 'var(--ink-4)' }}
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
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
          className="md:hidden flex items-center justify-around border-t shrink-0 relative"
          style={{
            borderColor: 'var(--line)',
            paddingTop: '0.875rem',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.875rem)',
            background: 'var(--surface)',
          }}
        >
          <Link href="/esbocos" className="flex flex-col items-center gap-1 px-6">
            <Home className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--brand)' }}>Início</span>
          </Link>

          <button
            onClick={handleNovo}
            disabled={isPending}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white transition -mt-8 disabled:opacity-60 active:scale-95 hover:opacity-90"
            style={{ background: 'var(--brand)', boxShadow: 'var(--shadow-fab)' }}
          >
            <Plus className="w-6 h-6" />
          </button>

          <button className="flex flex-col items-center gap-1 px-6" style={{ color: 'var(--ink-4)' }}>
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium">Histórico</span>
          </button>
        </div>
      </div>

      {/* ── Editor ──────────────────────────────────────────── */}
      <div className={`flex flex-col flex-1 overflow-hidden ${!isEditing ? 'hidden md:flex' : 'flex'}`}>

        {isEditing && (
          <div
            className="md:hidden flex items-center gap-3 px-4 py-3 border-b shrink-0"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
          >
            <Link
              href="/esbocos"
              className="flex items-center gap-2 text-sm font-semibold transition hover:opacity-70"
              style={{ color: 'var(--brand)' }}
            >
              <ArrowLeft className="w-4 h-4" />
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
