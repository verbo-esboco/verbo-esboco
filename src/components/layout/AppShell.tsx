'use client'

import { useTransition } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Esboco, Pasta } from '@/types'
import EsbocoList from './EsbocoList'
import { Plus, LogOut } from 'lucide-react'
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Navbar (dark, idêntica ao template) ─────────── */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark flex-shrink-0">
        <div className="container-fluid px-3">
          <Link className="navbar-brand d-flex align-items-center gap-2 py-1" href="/esbocos">
            <Image src="/verbo.png" alt="VERBO" width={26} height={26} className="object-contain" />
            Verbo
          </Link>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handleNovo}
              disabled={isPending}
              className="btn btn-sm btn-primary d-flex align-items-center gap-1"
            >
              {isPending
                ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                : <Plus size={14} />
              }
              <span>Novo</span>
            </button>

            <form action={signOut}>
              <button
                type="submit"
                className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
                title="Sair"
              >
                <LogOut size={14} />
                <span className="d-none d-sm-inline">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* ── Corpo principal ──────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <div className="container-fluid h-100 p-0">
          <div className="row h-100 g-0">

            {/* ── Painel lista ─── */}
            <div
              className={
                isEditing
                  ? 'd-none d-lg-flex flex-column col-lg-3 border-end h-100 overflow-auto'
                  : 'd-flex flex-column col-12 col-lg-8 h-100 overflow-auto border-end'
              }
              style={{ background: '#fff' }}
            >
              <EsbocoList esbocos={esbocos} pastas={pastas} compacto={isEditing} />
            </div>

            {/* ── Editor ou Sidebar ─── */}
            {isEditing ? (
              <div
                className="col-12 col-lg-9 h-100 d-flex flex-column overflow-hidden"
                style={{ background: '#fff' }}
              >
                {/* Botão voltar só no mobile */}
                <div className="d-lg-none border-bottom px-3 py-2 flex-shrink-0">
                  <Link href="/esbocos" className="btn btn-sm btn-outline-secondary">
                    ← Voltar
                  </Link>
                </div>
                <main className="flex-grow-1 d-flex flex-column overflow-hidden">
                  {children}
                </main>
              </div>
            ) : (
              /* Sidebar widgets (visível só em desktop na view de lista) */
              <div
                className="col-lg-4 h-100 overflow-auto d-none d-lg-block p-3"
                style={{ background: '#f8f9fa' }}
              >
                {/* Widget: Resumo */}
                <div className="card mb-3">
                  <div className="card-header fw-semibold">Seus esboços</div>
                  <div className="card-body">
                    <p className="text-muted small mb-2">
                      {esbocos.length} {esbocos.length === 1 ? 'esboço' : 'esboços'} no total
                    </p>
                    <div className="d-flex flex-wrap gap-1">
                      <span className="badge bg-warning text-dark">
                        {esbocos.filter(e => e.status === 'rascunho').length} em edição
                      </span>
                      <span className="badge bg-success">
                        {esbocos.filter(e => e.status === 'pronto').length} pronto{esbocos.filter(e => e.status === 'pronto').length !== 1 ? 's' : ''}
                      </span>
                      <span className="badge bg-primary">
                        {esbocos.filter(e => e.status === 'pregado').length} pregado{esbocos.filter(e => e.status === 'pregado').length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Widget: Pastas */}
                {pastas.length > 0 && (
                  <div className="card mb-3">
                    <div className="card-header fw-semibold">Pastas</div>
                    <div className="card-body p-0">
                      <ul className="list-group list-group-flush">
                        {pastas.map(p => (
                          <li key={p.id} className="list-group-item list-group-item-action px-3 py-2">
                            <Link
                              href={`/esbocos?pasta=${p.id}`}
                              className="d-flex align-items-center gap-2 text-decoration-none text-dark small"
                            >
                              <span
                                className="rounded-circle flex-shrink-0"
                                style={{ width: 10, height: 10, background: p.cor, display: 'inline-block' }}
                              />
                              {p.nome}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Widget: Filtrar por status */}
                <div className="card mb-3">
                  <div className="card-header fw-semibold">Filtrar</div>
                  <div className="card-body p-0">
                    <ul className="list-group list-group-flush">
                      {[
                        { href: '/esbocos',                    label: 'Todos os esboços' },
                        { href: '/esbocos?filtro=fixados',     label: 'Fixados' },
                        { href: '/esbocos?filtro=rascunho',    label: 'Em edição' },
                        { href: '/esbocos?filtro=pronto',      label: 'Prontos' },
                        { href: '/esbocos?filtro=pregado',     label: 'Pregados' },
                      ].map(item => (
                        <li key={item.href} className="list-group-item list-group-item-action px-3 py-2">
                          <Link href={item.href} className="text-decoration-none text-dark small">
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Widget: Info */}
                <div className="card">
                  <div className="card-header fw-semibold">Sobre o Verbo</div>
                  <div className="card-body small text-muted">
                    Organize seus esboços bíblicos, pregue com confiança e registre cada mensagem.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
