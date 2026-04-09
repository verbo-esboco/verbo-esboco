export default function EsbocosPage() {
  return (
    <div
      className="flex-1 flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-center max-w-xs px-8">
        {/* Ornamento central */}
        <div className="flex items-center justify-center gap-4 mb-7">
          <div className="h-px w-14" style={{ background: 'var(--line)' }} />
          <div className="flex flex-col items-center gap-1">
            <div className="w-1 h-1 rotate-45" style={{ background: 'var(--gold)' }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: 'var(--gold)', opacity: 0.6 }} />
            <div className="w-1 h-1 rotate-45" style={{ background: 'var(--gold)' }} />
          </div>
          <div className="h-px w-14" style={{ background: 'var(--line)' }} />
        </div>

        <h2
          className="text-xl font-bold mb-3 tracking-tight"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-1)' }}
        >
          Selecione um esboço
        </h2>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-3)' }}>
          Escolha um esboço na lista ou pressione{' '}
          <span
            className="font-bold"
            style={{ color: 'var(--brand)', fontFamily: 'var(--font-serif)' }}
          >
            +
          </span>{' '}
          para criar um novo
        </p>

        {/* Rodapé ornamental */}
        <div className="flex items-center justify-center gap-3 mt-7 opacity-40">
          <div className="h-px w-8" style={{ background: 'var(--line)' }} />
          <div className="w-1 h-1 rotate-45" style={{ background: 'var(--ink-4)' }} />
          <div className="h-px w-8" style={{ background: 'var(--line)' }} />
        </div>
      </div>
    </div>
  )
}
