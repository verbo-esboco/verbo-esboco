'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Esboco, Pasta } from '@/types'
import Sidebar from './Sidebar'
import EsbocoList from './EsbocoList'

interface Props {
  user: User | null
  esbocos: Esboco[]
  pastas: Pasta[]
  children: React.ReactNode
}

export default function AppShell({ user, esbocos, pastas, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f0]">
      {/* Sidebar — pastas e filtros */}
      <Sidebar
        user={user}
        pastas={pastas}
        esbocos={esbocos}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Lista de esboços */}
      <EsbocoList esbocos={esbocos} pastas={pastas} />

      {/* Editor */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
