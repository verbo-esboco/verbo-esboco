import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'VERBO – Esboços Bíblicos',
  description: 'Crie e organize seus esboços de pregações',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-100">
      <body className={`${inter.variable} ${playfair.variable} h-100`} style={{ fontFamily: 'var(--font-sans)' }}>
        {children}
      </body>
    </html>
  )
}
