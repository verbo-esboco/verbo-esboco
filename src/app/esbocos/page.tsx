import Image from 'next/image'

export default function EsbocosPage() {
  return (
    <div
      className="flex-1 flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-center max-w-xs px-8">
        <div className="flex justify-center mb-5 opacity-30">
          <Image src="/verbo.png" alt="VERBO" width={48} height={48} className="object-contain" />
        </div>
        <h2
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-1)' }}
        >
          Selecione um esboço
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-4)' }}>
          Escolha um esboço na lista ou clique em{' '}
          <span className="font-semibold" style={{ color: 'var(--brand)' }}>Novo</span>{' '}
          para começar
        </p>
      </div>
    </div>
  )
}
