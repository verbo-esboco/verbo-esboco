import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

export interface SuggestionInfo {
  word: string
  suggestions: string[]
  from: number
  to: number
}

// Caracteres que delimitam o fim de uma palavra
// 'Enter' é o valor de event.key para a tecla Enter (não '\n')
const TRIGGER_CHARS = new Set([' ', 'Enter', '.', ',', '!', '?', ';', ':', ')', ']', '"', "'"])

// Distância de Levenshtein (versão iterativa compacta)
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const temp = dp[j]
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1])
      prev = temp
    }
  }
  return dp[n]
}

// Extrai a última palavra antes do cursor (apenas letras, incluindo acentuadas)
function getWordBefore(view: EditorView): { word: string; from: number; to: number } | null {
  const { $from } = view.state.selection
  // $from.start() retorna o início do bloco corrente — nunca vai atrás da posição 1
  const blockStart = $from.start()
  const textBefore = view.state.doc.textBetween(
    Math.max(blockStart, $from.pos - 80),
    $from.pos,
    ' ',
    ' '
  )
  const match = textBefore.match(/([a-zA-ZÀ-ÿ]{3,})$/)
  if (!match) return null
  const word = match[1]
  return { word, from: $from.pos - word.length, to: $from.pos }
}

// Threshold de distância para auto-correção silenciosa
function maxAutoCorrectDist(wordLen: number): number {
  if (wordLen <= 4) return 1
  if (wordLen <= 7) return 2
  return 3
}

export const AutocorrectExtension = Extension.create({
  name: 'autocorrect',

  addOptions() {
    return {
      onSuggest: null as ((info: SuggestionInfo) => void) | null,
    }
  },

  addProseMirrorPlugins() {
    const getOptions = () => this.options as { onSuggest: ((info: SuggestionInfo) => void) | null }

    return [
      new Plugin({
        props: {
          handleKeyDown(view, event) {
            if (!TRIGGER_CHARS.has(event.key)) return false

            const wordInfo = getWordBefore(view)
            if (!wordInfo) return false

            const { word, from, to } = wordInfo

            // Dispara verificação assíncrona sem bloquear o input
            fetch(`/api/spellcheck?word=${encodeURIComponent(word)}`)
              .then(r => r.json())
              .then((data: { correct: boolean; suggestions: string[] }) => {
                if (data.correct || !data.suggestions.length) return

                const suggestions = data.suggestions
                const best = suggestions[0]
                const dist = levenshtein(word.toLowerCase(), best.toLowerCase())
                const maxDist = maxAutoCorrectDist(word.length)

                if (dist <= maxDist) {
                  // Corrige automaticamente se a palavra ainda está no lugar
                  const currentText = view.state.doc.textBetween(from, to, ' ', ' ')
                  if (currentText === word) {
                    // Preserva capitalização se a palavra original começa com maiúscula
                    const corrected =
                      word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()
                        ? best.charAt(0).toUpperCase() + best.slice(1)
                        : best
                    view.dispatch(view.state.tr.insertText(corrected, from, to))
                  }
                } else {
                  // Pede confirmação ao usuário
                  getOptions().onSuggest?.({ word, suggestions: suggestions.slice(0, 3), from, to })
                }
              })
              .catch(() => {
                // Falha silenciosa — não interrompe o fluxo
              })

            return false // não consome o evento
          },
        },
      }),
    ]
  },
})
