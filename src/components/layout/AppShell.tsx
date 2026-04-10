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

      {/* ── Painel Lista ─────────────────────────────────── */}
      <div
        className={`flex flex-col shrink-0 transition-all ${
          isEditing
            ? 'hidden md:flex md:w-[280px] lg:w-[320px]'
            : 'flex w-full md:w-full'
        }`}
        style={{
          background: 'var(--surface)',
          borderRight: isEditing ? '1px solid var(--line)' : 'none',
        }}
      >
        {/* Header estilo Radcliffe */}
        <div
          className="shrink-0"
          style={{ borderBottom: '2px solid var(--ink-1)', padding: isEditing ? '20px 20px 16px' : '32px 32px 20px' }}
        >
          {/* Wordmark */}
          <div className="flex items-center justify-between mb-0">
            <div className="flex items-center gap-3">
              <Image
                src="/verbo.png"
                alt="VERBO"
                width={isEditing ? 24 : 30}
                height={isEditing ? 24 : 30}
                className="object-contain shrink-0"
              />
              <div>
                <span
                  className="font-bold tracking-tight leading-none"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: isEditing ? '1rem' : '1.25rem',
                    color: 'var(--ink-1)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Verbo
                </span>
                {!isEditing && (
                  <p
                    className="mt-0.5 uppercase tracking-widest"
                    style={{ fontSize: '0.6rem', color: 'var(--ink-3)', letterSpacing: '0.12em' }}
                  >
                    Esboços Bíblicos
                  </p>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleNovo}
                disabled={isPending}
                className="flex items-center gap-1.5 font-semibold text-white transition hover:opacity-80 active:scale-95 disabled:opacity-50"
                style={{
                  background: 'var(--ink-1)',
                  padding: isEditing ? '5px 12px' : '7px 16px',
                  fontSize: '0.75rem',
                  letterSpacing: '0.02em',
                }}
              >
                <Plus className={isEditing ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
                Novo
              </button>
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-8 h-8 flex items-center justify-center transition hover:opacity-50"
                  style={{ color: 'var(--ink-3)' }}
                  title="Sair"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Contagem — só na tela cheia */}
          {!isEditing && (
            <p className="mt-3" style={{ fontSize: '0.75rem', color: 'var(--ink-4)' }}>
              {esbocos.length} {esbocos.length === 1 ? 'esboço' : 'esboços'}
            </p>
          )}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-hidden">
          <EsbocoList esbocos={esbocos} pastas={pastas} compacto={isEditing} />
        </div>

        {/* Bottom nav mobile */}
        <div
          className="md:hidden flex items-center justify-around shrink-0"
          style={{
            borderTop: '1px solid var(--line)',
            paddingTop: '0.875rem',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.875rem)',
            background: 'var(--surface)',
          }}
        >
          <Link href="/esbocos" className="flex flex-col items-center gap-1 px-6">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--ink-1)' }}>
              <rect x="3" y="3" width="14" height="14" rx="1"/>
              <line x1="3" y1="8" x2="17" y2="8"/>
              <line x1="7" y1="8" x2="7" y2="17"/>
            </svg>
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--ink-1)' }}>Esboços</span>
          </Link>

          <button
            onClick={handleNovo}
            disabled={isPending}
            className="w-12 h-12 flex items-center justify-center text-white -mt-6 disabled:opacity-60 active:scale-95"
            style={{ background: 'var(--ink-1)' }}
          >
            <Plus className="w-5 h-5" />
          </button>

          <button className="flex flex-col items-center gap-1 px-6" style={{ color: 'var(--ink-3)' }}>
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider font-semibold">Sair</span>
          </button>
        </div>
      </div>

      {/* ── Editor ───────────────────────────────────────── */}
      <div className={`flex flex-col flex-1 overflow-hidden ${!isEditing ? 'hidden' : 'flex'}`}>
        {isEditing && (
          <div
            className="md:hidden flex items-center gap-3 px-5 py-3 shrink-0"
            style={{
              borderBottom: '1px solid var(--line)',
              background: 'var(--surface)',
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
            }}
          >
            <Link
              href="/esbocos"
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--ink-1)', fontSize: '0.7rem' }}
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
