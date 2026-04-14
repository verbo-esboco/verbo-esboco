import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const nspell = require('nspell') as (dict: { aff: Buffer; dic: Buffer }) => {
  correct: (word: string) => boolean
  suggest: (word: string) => string[]
}

// Carrega o dicionário uma única vez
let checkerPromise: Promise<ReturnType<typeof nspell>> | null = null

function getChecker() {
  if (!checkerPromise) {
    checkerPromise = (async () => {
      const { default: dict } = await import('dictionary-pt')
      return nspell({
        aff: Buffer.from(dict.aff),
        dic: Buffer.from(dict.dic),
      })
    })()
  }
  return checkerPromise
}

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get('word')?.trim()
  if (!word || word.length < 2) {
    return NextResponse.json({ correct: true, suggestions: [] })
  }

  try {
    const spell = await getChecker()
    // Aceita forma original (para maiúsculas/nomes próprios) e minúscula
    const correct = spell.correct(word) || spell.correct(word.toLowerCase())
    const suggestions = correct ? [] : spell.suggest(word).slice(0, 5)
    return NextResponse.json({ correct, suggestions })
  } catch {
    // Em caso de erro, não interrompe o usuário
    return NextResponse.json({ correct: true, suggestions: [] })
  }
}
