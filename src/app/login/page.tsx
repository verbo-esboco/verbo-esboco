'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [modo, setModo] = useState<'entrar' | 'cadastrar'>('entrar')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    if (modo === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) {
        setError('E-mail ou senha incorretos.')
      } else {
        router.push('/esbocos')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setError('Erro ao criar conta. Tente novamente.')
      } else {
        setError('')
        setModo('entrar')
        alert('Conta criada! Confirme seu e-mail e depois entre.')
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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1c1c1e]">VERBO</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Esboços Bíblicos</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e0] p-6">
          <h2 className="text-lg font-semibold text-[#1c1c1e] mb-5 text-center">
            {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </h2>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-[#e5e5e0] rounded-xl py-2.5 px-4 text-sm font-medium text-[#1c1c1e] hover:bg-[#f5f5f0] transition-colors mb-4 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#e5e5e0]" />
            <span className="text-xs text-[#6b6b6b]">ou</span>
            <div className="flex-1 h-px bg-[#e5e5e0]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[#6b6b6b] mb-1 block">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full border border-[#e5e5e0] rounded-xl px-3 py-2.5 text-sm text-[#1c1c1e] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#6b6b6b] mb-1 block">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full border border-[#e5e5e0] rounded-xl px-3 py-2.5 pr-10 text-sm text-[#1c1c1e] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b]"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email || !senha}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-xs text-[#6b6b6b] mt-4">
            {modo === 'entrar' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              onClick={() => { setModo(modo === 'entrar' ? 'cadastrar' : 'entrar'); setError('') }}
              className="text-orange-500 hover:underline font-medium"
            >
              {modo === 'entrar' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-[#6b6b6b] mt-6">
          Seus esboços ficam salvos com segurança na sua conta
        </p>
      </div>
    </div>
  )
}
