import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { getSpellChecker } from '@/lib/spellChecker'

export interface SuggestionInfo {
  word: string
  suggestions: string[]
  from: number
  to: number
}

// Teclas que delimitam o fim de uma palavra
const TRIGGER_CHARS = new Set([' ', 'Enter', '.', ',', '!', '?', ';', ':', ')', ']', '"', "'"])

// Distância de Levenshtein (iterativa)
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

// Extrai a última palavra antes do cursor
function getWordBefore(view: EditorView): { word: string; from: number; to: number } | null {
  const { $from } = view.state.selection
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

// Máxima distância para autocorreção silenciosa
function maxAutoCorrectDist(len: number): number {
  if (len <= 4) return 1
  if (len <= 7) return 2
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

    // Pré-aquece o checker assim que o editor monta (download do dicionário em background)
    getSpellChecker().catch(() => { /* falha silenciosa */ })

    return [
      new Plugin({
        props: {
          handleKeyDown(view, event) {
            if (!TRIGGER_CHARS.has(event.key)) return false

            const wordInfo = getWordBefore(view)
            if (!wordInfo) return false

            const { word, from, to } = wordInfo

            // Tudo roda no browser — zero requisições ao servidor
            getSpellChecker()
              .then(check => {
                const { correct, suggestions } = check(word)
                if (correct || !suggestions.length) return

                const best = suggestions[0]
                const dist = levenshtein(word.toLowerCase(), best.toLowerCase())

                if (dist <= maxAutoCorrectDist(word.length)) {
                  // Verifica se a palavra ainda está no lugar antes de substituir
                  const current = view.state.doc.textBetween(from, to, ' ', ' ')
                  if (current !== word) return

                  // Preserva maiúscula inicial
                  const corrected =
                    word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()
                      ? best.charAt(0).toUpperCase() + best.slice(1)
                      : best

                  view.dispatch(view.state.tr.insertText(corrected, from, to))
                } else {
                  // Não encontrou correspondência próxima — pergunta ao usuário
                  getOptions().onSuggest?.({ word, suggestions: suggestions.slice(0, 3), from, to })
                }
              })
              .catch(() => { /* falha silenciosa */ })

            return false
          },
        },
      }),
    ]
  },
})
