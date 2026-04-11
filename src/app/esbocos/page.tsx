import Image from 'next/image'

export default function EsbocosPage() {
  return (
    <div className="d-flex align-items-center justify-content-center h-100 text-center">
      <div style={{ maxWidth: '280px', padding: '32px 16px' }}>
        <div className="d-flex justify-content-center mb-4">
          <div
            className="d-flex align-items-center justify-content-center rounded"
            style={{ width: 72, height: 72, background: '#f8f9fa', border: '1px solid var(--line)' }}
          >
            <Image src="/verbo.png" alt="VERBO" width={40} height={40} className="object-contain opacity-50" />
          </div>
        </div>
        <h5 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          Selecione um esboço
        </h5>
        <p className="text-muted small mb-0">
          Escolha um esboço na lista ou clique em{' '}
          <strong style={{ color: 'var(--brand)' }}>Novo</strong>{' '}
          para criar sua primeira mensagem.
        </p>
      </div>
    </div>
  )
}
