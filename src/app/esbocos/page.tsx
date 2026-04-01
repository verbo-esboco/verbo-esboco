import { BookOpen } from 'lucide-react'

export default function EsbocosPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-lg font-semibold text-[#1c1c1e] mb-1">Selecione um esboço</h2>
        <p className="text-sm text-[#6b6b6b]">
          Escolha um esboço na lista ou crie um novo
        </p>
      </div>
    </div>
  )
}
