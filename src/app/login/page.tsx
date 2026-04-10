'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]           = useState('')
  const [senha, setSenha]           = useState('')
  const [mostrarSenha, setMostrar]  = useState(false)
  const [modo, setModo]             = useState<'entrar' | 'cadastrar'>('entrar')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    if (modo === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) setError('E-mail ou senha incorretos.')
      else { router.push('/esbocos'); router.refresh() }
    } else {
      const { error } = await supabase.auth.signUp({ email, password: senha })
      if (error) setError('Erro ao criar conta. Tente novamente.')
      else {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (!loginError) { router.push('/esbocos'); router.refresh() }
        else setModo('entrar')
      }
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'var(--bg)' }}
    >
      {/* Cabeçalho — estilo Radcliffe */}
      <div className="text-center mb-12">
        <Image src="/verbo.png" alt="VERBO" width={48} height={48} className="object-contain mx-auto mb-5" />
        <h1
          className="mb-1"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--ink-1)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          Verbo
        </h1>
        <p
          className="uppercase tracking-widest"
          style={{ fontSize: '0.65rem', color: 'var(--ink-4)', letterSpacing: '0.15em' }}
        >
          Esboços Bíblicos
        </p>
      </div>

      {/* Formulário */}
      <div className="w-full max-w-xs">

        {/* Divisor superior */}
        <div style={{ borderTop: '2px solid var(--ink-1)', marginBottom: '28px' }} />

        <h2
          className="mb-6 text-center uppercase tracking-widest"
          style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '0.12em' }}
        >
          {modo === 'entrar' ? 'Entrar na conta' : 'Criar conta'}
        </h2>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 text-sm font-medium transition hover:opacity-70 disabled:opacity-40 mb-5"
          style={{
            border: '1px solid var(--line)',
            color: 'var(--ink-2)',
            background: 'var(--surface)',
            letterSpacing: '0.02em',
          }}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
          <span className="uppercase tracking-widest" style={{ fontSize: '0.6rem', color: 'var(--ink-4)', letterSpacing: '0.1em' }}>ou</span>
          <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block mb-1.5 uppercase tracking-widest"
              style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '0.1em' }}
            >
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full py-2.5 px-0 text-sm focus:outline-none transition"
              style={{
                borderBottom: '1px solid var(--line)',
                background: 'transparent',
                color: 'var(--ink-1)',
              }}
              onFocus={e => (e.target.style.borderBottomColor = 'var(--ink-1)')}
              onBlur={e => (e.target.style.borderBottomColor = 'var(--line)')}
            />
          </div>

          <div>
            <label
              className="block mb-1.5 uppercase tracking-widest"
              style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '0.1em' }}
            >
              Senha
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full py-2.5 px-0 pr-8 text-sm focus:outline-none transition"
                style={{
                  borderBottom: '1px solid var(--line)',
                  background: 'transparent',
                  color: 'var(--ink-1)',
                }}
                onFocus={e => (e.target.style.borderBottomColor = 'var(--ink-1)')}
                onBlur={e => (e.target.style.borderBottomColor = 'var(--line)')}
              />
              <button
                type="button"
                onClick={() => setMostrar(!mostrarSenha)}
                className="absolute right-0 top-1/2 -translate-y-1/2 transition hover:opacity-50"
                style={{ color: 'var(--ink-4)' }}
              >
                {mostrarSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !senha}
            className="w-full py-3 mt-2 text-sm font-bold text-white transition hover:opacity-80 disabled:opacity-40 flex items-center justify-center gap-2 uppercase tracking-widest"
            style={{
              background: 'var(--ink-1)',
              letterSpacing: '0.08em',
              fontSize: '0.75rem',
            }}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: '0.75rem', color: 'var(--ink-4)' }}>
          {modo === 'entrar' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <button
            onClick={() => { setModo(modo === 'entrar' ? 'cadastrar' : 'entrar'); setError('') }}
            className="transition hover:opacity-60"
            style={{ color: 'var(--ink-2)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            {modo === 'entrar' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>

        {/* Divisor inferior */}
        <div style={{ borderTop: '1px solid var(--line)', marginTop: '28px' }} />
      </div>
    </div>
  )
}
