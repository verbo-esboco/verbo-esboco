import { notFound } from 'next/navigation'
import { getEsboco, getPastas } from '@/lib/actions'
import EsbocoEditor from '@/components/editor/EsbocoEditor'

export const runtime = 'edge'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EsbocoPage({ params }: Props) {
  const { id } = await params

  try {
    const [esboco, pastas] = await Promise.all([getEsboco(id), getPastas()])
    return <EsbocoEditor esboco={esboco} pastas={pastas} />
  } catch {
    notFound()
  }
}
