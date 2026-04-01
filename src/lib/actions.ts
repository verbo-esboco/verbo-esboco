'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Esboco, Pasta } from '@/types'

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
  })
  if (error) throw error
  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ── Esboços ───────────────────────────────────────────────────────────────────

export async function getEsbocos() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('esbocos')
    .select('*, pasta:pastas(id, nome, cor)')
    .eq('user_id', user.id)
    .order('fixado', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as Esboco[]
}

export async function getEsboco(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('esbocos')
    .select('*, pasta:pastas(id, nome, cor)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Esboco
}

export async function createEsboco(pastaId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('esbocos')
    .insert({
      user_id: user.id,
      pasta_id: pastaId || null,
      titulo: 'Novo Esboço',
      referencia_biblica: '',
      texto_biblico: '',
      introducao: '',
      desenvolvimento: '',
      aplicacao: '',
      conclusao: '',
      status: 'rascunho',
      fixado: false,
      tags: [],
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/esbocos')
  return data as Esboco
}

export async function updateEsboco(id: string, updates: Partial<Esboco>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('esbocos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/esbocos')
  return data as Esboco
}

export async function deleteEsboco(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('esbocos').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/esbocos')
}

export async function toggleFixado(id: string, fixado: boolean) {
  return updateEsboco(id, { fixado: !fixado })
}

// ── Pastas ────────────────────────────────────────────────────────────────────

export async function getPastas() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('pastas')
    .select('*')
    .eq('user_id', user.id)
    .order('nome')

  if (error) throw error
  return data as Pasta[]
}

export async function createPasta(nome: string, cor: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('pastas')
    .insert({ user_id: user.id, nome, cor })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/esbocos')
  return data as Pasta
}

export async function deletePasta(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('pastas').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/esbocos')
}
