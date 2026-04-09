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
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Painel Lista — full-width quando não editando ─── */}
      <div
        className={`flex flex-col shrink-0 transition-all ${
          isEditing
            ? 'hidden md:flex md:w-[320px] lg:w-[360px]'
            : 'flex w-full md:w-full'
        }`}
        style={{ background: 'var(--surface)', borderRight: isEditing ? '1px solid var(--line)' : 'none' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            borderBottom: '1px solid var(--line)',
            padding: isEditing ? '12px 16px' : '16px 24px',
          }}
        >
          <div className="flex items-center gap-3">
            <Image src="/verbo.png" alt="VERBO" width={isEditing ? 28 : 36} height={isEditing ? 28 : 36} className="object-contain" />
            <div>
              <p className="font-bold leading-tight tracking-tight" style={{ fontSize: isEditing ? '0.875rem' : '1rem', color: 'var(--ink-1)' }}>VERBO</p>
              {!isEditing && <p className="text-xs leading-tight" style={{ color: 'var(--ink-4)' }}>Esboços Bíblicos</p>}
            </div>
            {!isEditing && (
              <span className="text-sm ml-1" style={{ color: 'var(--ink-4)' }}>
                · {esbocos.length} esboço{esbocos.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNovo}
              disabled={isPending}
              className="flex items-center gap-2 rounded-full font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{
                background: 'var(--brand)',
                boxShadow: 'var(--shadow-brand)',
                padding: isEditing ? '7px 14px' : '10px 20px',
                fontSize: isEditing ? '0.75rem' : '0.875rem',
              }}
            >
              <Plus className={isEditing ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
              Novo
            </button>
            <form action={signOut}>
              <button
                type="submit"
                className="w-9 h-9 flex items-center justify-center rounded-full transition hover:bg-[var(--bg)]"
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
          <EsbocoList esbocos={esbocos} pastas={pastas} compacto={isEditing} />
        </div>

        {/* Bottom nav mobile */}
        <div
          className="md:hidden flex items-center justify-around border-t shrink-0"
          style={{
            borderColor: 'var(--line)',
            paddingTop: '0.875rem',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.875rem)',
            background: 'var(--surface)',
          }}
        >
          <Link href="/esbocos" className="flex flex-col items-center gap-1 px-6">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--brand)' }}>
              <rect x="3" y="3" width="14" height="14" rx="2"/>
              <line x1="3" y1="8" x2="17" y2="8"/>
              <line x1="7" y1="8" x2="7" y2="17"/>
            </svg>
            <span className="text-[10px] font-medium" style={{ color: 'var(--brand)' }}>Esboços</span>
          </Link>

          <button
            onClick={handleNovo}
            disabled={isPending}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white -mt-8 disabled:opacity-60 active:scale-95 hover:opacity-90"
            style={{ background: 'var(--brand)', boxShadow: 'var(--shadow-fab)' }}
          >
            <Plus className="w-6 h-6" />
          </button>

          <button className="flex flex-col items-center gap-1 px-6" style={{ color: 'var(--ink-4)' }}>
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* ── Editor ──────────────────────────────────────────── */}
      <div className={`flex flex-col flex-1 overflow-hidden ${!isEditing ? 'hidden' : 'flex'}`}>
        {isEditing && (
          <div
            className="md:hidden flex items-center gap-3 px-4 py-3 border-b shrink-0"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
          >
            <Link
              href="/esbocos"
              className="flex items-center gap-2 text-sm font-semibold"
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
