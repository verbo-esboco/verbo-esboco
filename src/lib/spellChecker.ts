'use client'

export type CheckFn = (word: string) => { correct: boolean; suggestions: string[] }

// Singleton — carrega uma vez e mantém em memória no browser
let checkerPromise: Promise<CheckFn> | null = null

export function getSpellChecker(): Promise<CheckFn> {
  if (!checkerPromise) {
    checkerPromise = (async (): Promise<CheckFn> => {
      // Busca os arquivos do dicionário como assets estáticos — zero CPU no servidor
      const [affRes, dicRes] = await Promise.all([
        fetch('/dict/pt.aff'),
        fetch('/dict/pt.dic'),
      ])
      const [affBuf, dicBuf] = await Promise.all([
        affRes.arrayBuffer(),
        dicRes.arrayBuffer(),
      ])

      // nspell é CJS — importa dinamicamente para não quebrar o SSR
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const NSpell = require('nspell') as (
        dict: { aff: Uint8Array; dic: Uint8Array }
      ) => { correct: (w: string) => boolean; suggest: (w: string) => string[] }

      const spell = NSpell({
        aff: new Uint8Array(affBuf),
        dic: new Uint8Array(dicBuf),
      })

      return (word: string) => {
        const correct = spell.correct(word) || spell.correct(word.toLowerCase())
        const suggestions = correct ? [] : spell.suggest(word).slice(0, 5)
        return { correct, suggestions }
      }
    })()
  }
  return checkerPromise
}
