import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { getEsbocos, getPastas } from '@/lib/actions'
import AppShell from '@/components/layout/AppShell'

export default async function EsbocosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Protege a rota — redireciona para login se não autenticado
  if (!user) redirect('/login')

  const [esbocos, pastas] = await Promise.all([getEsbocos(), getPastas()])

  return (
    <AppShell user={user} esbocos={esbocos} pastas={pastas}>
      {children}
    </AppShell>
  )
}
