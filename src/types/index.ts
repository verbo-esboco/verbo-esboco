export type EsbocStatus = 'rascunho' | 'pronto' | 'pregado'

export interface Pasta {
  id: string
  user_id: string
  nome: string
  cor: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  user_id: string
  nome: string
  created_at: string
}

export interface Esboco {
  id: string
  user_id: string
  pasta_id: string | null
  titulo: string
  referencia_biblica: string
  texto_biblico: string
  introducao: string
  desenvolvimento: string
  aplicacao: string
  conclusao: string
  status: EsbocStatus
  fixado: boolean
  tags: string[]
  created_at: string
  updated_at: string
  pasta?: Pasta
}

export type EsbocFilter = 'todos' | 'fixados' | 'rascunho' | 'pronto' | 'pregado'
export type EsbocSort = 'updated_at' | 'created_at' | 'titulo'
