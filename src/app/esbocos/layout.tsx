import { createClient } from '@/lib/supabase/server'
import { getEsbocos, getPastas } from '@/lib/actions'
import AppShell from '@/components/layout/AppShell'

export default async function EsbocosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [esbocos, pastas] = await Promise.all([getEsbocos(), getPastas()])

  return (
    <AppShell user={user} esbocos={esbocos} pastas={pastas}>
      {children}
    </AppShell>
  )
}
