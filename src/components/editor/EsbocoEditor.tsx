'use client'

import { useState, useCallback, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Esboco, Pasta, EsbocStatus } from '@/types'
import {
  Star, MoreVertical, Trash2, CheckCircle, FileText,
  Mic, FolderOpen, Tag, Save, Loader2, BookOpen, X, Plus
} from 'lucide-react'
import { updateEsboco, deleteEsboco, toggleFixado } from '@/lib/actions'
import TiptapEditor from './TiptapEditor'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  esboco: Esboco
  pastas: Pasta[]
}

type SecaoKey = 'texto_biblico' | 'introducao' | 'desenvolvimento' | 'aplicacao' | 'conclusao'

const SECOES: { key: SecaoKey; label: string; emoji: string; placeholder: string }[] = [
  { key: 'texto_biblico', label: 'Texto Bíblico', emoji: '📖', placeholder: 'Cole ou escreva o texto bíblico principal...' },
  { key: 'introducao', label: 'Introdução', emoji: '🎯', placeholder: 'Como você vai introduzir o tema? O que vai despertar interesse?' },
  { key: 'desenvolvimento', label: 'Desenvolvimento', emoji: '📝', placeholder: 'Desenvolva os pontos principais da mensagem...' },
  { key: 'aplicacao', label: 'Aplicação', emoji: '✋', placeholder: 'Como esta mensagem se aplica à vida prática?' },
  { key: 'conclusao', label: 'Conclusão', emoji: '🏁', placeholder: 'Como fechar a mensagem? Qual o chamado à ação?' },
]

const STATUS_CONFIG = {
  rascunho: { label: 'Rascunho', icon: FileText, color: 'text-gray-500', bg: 'bg-gray-100' },
  pronto: { label: 'Pronto', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  pregado: { label: 'Pregado', icon: Mic, color: 'text-blue-600', bg: 'bg-blue-100' },
}

export default function EsbocoEditor({ esboco: inicial, pastas }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const [statusMenu, setStatusMenu] = useState(false)
  const [pastaMenu, setPastaMenu] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [secaoAberta, setSecaoAberta] = useState<SecaoKey | null>(null)

  const [dados, setDados] = useState({
    titulo: inicial.titulo,
    referencia_biblica: inicial.referencia_biblica,
    texto_biblico: inicial.texto_biblico,
    introducao: inicial.introducao,
    desenvolvimento: inicial.desenvolvimento,
    aplicacao: inicial.aplicacao,
    conclusao: inicial.conclusao,
    status: inicial.status as EsbocStatus,
    fixado: inicial.fixado,
    tags: inicial.tags,
    pasta_id: inicial.pasta_id,
  })

  // Auto-save com debounce de 1.5s
  const saveDebounced = useCallback(
    debounce(async (d: typeof dados) => {
      setSaving(true)
      try {
        await updateEsboco(inicial.id, d)
        setLastSaved(new Date())
      } finally {
        setSaving(false)
      }
    }, 1500),
    [inicial.id]
  )

  useEffect(() => {
    saveDebounced(dados)
  }, [dados]) // eslint-disable-line

  function update(field: keyof typeof dados, value: unknown) {
    setDados(prev => ({ ...prev, [field]: value }))
  }

  function handleAddTag(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const nova = tagInput.trim().replace(',', '')
      if (!dados.tags.includes(nova)) {
        update('tags', [...dados.tags, nova])
      }
      setTagInput('')
    }
  }

  function handleRemoveTag(tag: string) {
    update('tags', dados.tags.filter(t => t !== tag))
  }

  function handleDelete() {
    setMenuAberto(false)
    startTransition(async () => {
      await deleteEsboco(inicial.id)
      router.push('/esbocos')
    })
  }

  function handleToggleFixado() {
    update('fixado', !dados.fixado)
    startTransition(async () => { await toggleFixado(inicial.id, dados.fixado) })
  }

  const statusAtual = STATUS_CONFIG[dados.status]
  const StatusIcon = statusAtual.icon
  const pasta = pastas.find(p => p.id === dados.pasta_id)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header do editor */}
      <div className="border-b border-[#e5e5e0] px-6 py-3">
        {/* Linha 1: título */}
        <input
          type="text"
          value={dados.titulo}
          onChange={e => update('titulo', e.target.value)}
          placeholder="Título do esboço"
          className="w-full text-xl font-bold text-[#1c1c1e] bg-transparent focus:outline-none placeholder:text-[#c0c0c0]"
        />

        {/* Linha 2: referência + ações */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <input
            type="text"
            value={dados.referencia_biblica}
            onChange={e => update('referencia_biblica', e.target.value)}
            placeholder="Referência bíblica (ex: João 3:16)"
            className="text-sm text-orange-500 font-medium bg-transparent focus:outline-none placeholder:text-orange-200 placeholder:font-normal"
          />

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Salvar indicador */}
            <div className="flex items-center gap-1 text-[10px] text-[#9b9b9b]">
              {saving ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</>
              ) : lastSaved ? (
                <><Save className="w-3 h-3" /> Salvo {formatDistanceToNow(lastSaved, { locale: ptBR, addSuffix: true })}</>
              ) : null}
            </div>

            {/* Fixar */}
            <button
              onClick={handleToggleFixado}
              className={`p-1.5 rounded-lg transition ${dados.fixado ? 'text-orange-400' : 'text-[#6b6b6b] hover:bg-[#f5f5f0]'}`}
              title={dados.fixado ? 'Desafixar' : 'Fixar'}
            >
              <Star className={`w-4 h-4 ${dados.fixado ? 'fill-orange-400' : ''}`} />
            </button>

            {/* Status */}
            <div className="relative">
              <button
                onClick={() => { setStatusMenu(!statusMenu); setPastaMenu(false) }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition ${statusAtual.bg} ${statusAtual.color}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {statusAtual.label}
              </button>
              {statusMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStatusMenu(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-[#e5e5e0] py-1 w-36">
                    {(Object.entries(STATUS_CONFIG) as [EsbocStatus, typeof STATUS_CONFIG.rascunho][]).map(([key, cfg]) => {
                      const Icon = cfg.icon
                      return (
                        <button
                          key={key}
                          onClick={() => { update('status', key); setStatusMenu(false) }}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#f5f5f0] transition ${dados.status === key ? 'font-medium text-orange-500' : 'text-[#1c1c1e]'}`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Pasta */}
            <div className="relative">
              <button
                onClick={() => { setPastaMenu(!pastaMenu); setStatusMenu(false) }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[#6b6b6b] hover:bg-[#f5f5f0] transition"
              >
                <FolderOpen className="w-3.5 h-3.5" style={{ color: pasta?.cor ?? '#6b6b6b' }} />
                {pasta?.nome ?? 'Pasta'}
              </button>
              {pastaMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPastaMenu(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-[#e5e5e0] py-1 w-44">
                    <button
                      onClick={() => { update('pasta_id', null); setPastaMenu(false) }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#f5f5f0] transition ${!dados.pasta_id ? 'font-medium text-orange-500' : 'text-[#6b6b6b]'}`}
                    >
                      Sem pasta
                    </button>
                    {pastas.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { update('pasta_id', p.id); setPastaMenu(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#f5f5f0] transition ${dados.pasta_id === p.id ? 'font-medium text-orange-500' : 'text-[#1c1c1e]'}`}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.cor }} />
                        {p.nome}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="p-1.5 rounded-lg hover:bg-[#f5f5f0] text-[#6b6b6b] transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuAberto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-[#e5e5e0] py-1 w-40">
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir esboço
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <Tag className="w-3.5 h-3.5 text-[#6b6b6b] shrink-0" />
          {dados.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded-full">
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="+ tag"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="text-[10px] text-[#6b6b6b] bg-transparent focus:outline-none placeholder:text-[#c0c0c0] w-16"
          />
        </div>
      </div>

      {/* Seções */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          {SECOES.map(secao => (
            <SecaoCard
              key={secao.key}
              label={secao.label}
              emoji={secao.emoji}
              placeholder={secao.placeholder}
              content={dados[secao.key]}
              onChange={html => update(secao.key, html)}
              isOpen={secaoAberta === secao.key || secaoAberta === null}
              onToggle={() => setSecaoAberta(secaoAberta === secao.key ? null : secao.key)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SecaoCard({
  label, emoji, placeholder, content, onChange, isOpen, onToggle
}: {
  label: string
  emoji: string
  placeholder: string
  content: string
  onChange: (html: string) => void
  isOpen: boolean
  onToggle: () => void
}) {
  const isEmpty = !content || content === '<p></p>'

  return (
    <div className={`rounded-2xl border transition ${isOpen ? 'border-[#e5e5e0]' : 'border-transparent hover:border-[#e5e5e0]'} bg-white`}>
      {/* Header da seção */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="font-semibold text-sm text-[#1c1c1e]">{label}</span>
          {isEmpty && (
            <span className="text-[10px] text-[#9b9b9b] font-normal">vazio</span>
          )}
        </div>
        <div className={`w-1.5 h-1.5 rounded-full ${isEmpty ? 'bg-[#e5e5e0]' : 'bg-orange-400'}`} />
      </button>

      {/* Conteúdo */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-[#f0f0ec]">
          <div className="pt-3">
            <TiptapEditor
              content={content}
              placeholder={placeholder}
              onChange={onChange}
              minHeight="100px"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Debounce utility
function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}
