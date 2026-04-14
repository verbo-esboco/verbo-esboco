import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Obrigatório para Cloudflare Workers — não suporta Node.js runtime em middleware
export const runtime = 'edge'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
