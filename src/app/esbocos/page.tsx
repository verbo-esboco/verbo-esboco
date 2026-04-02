import { BookOpen } from 'lucide-react'

export default function EsbocosPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--surface)]">
      <div className="text-center max-w-xs">
        <div className="w-14 h-14 rounded-2xl bg-[var(--brand-muted)] flex items-center justify-center mx-auto mb-5">
          <BookOpen className="w-7 h-7 text-[var(--brand)]" />
        </div>
        <h2 className="font-serif text-xl font-bold text-[var(--ink-1)] mb-2">
          Selecione um esboço
        </h2>
        <p className="text-sm text-[var(--ink-3)] leading-relaxed">
          Escolha um esboço na lista ao lado ou crie um novo para começar
        </p>
      </div>
    </div>
  )
}
