import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const NSpell = require('nspell') as (
  dict: { aff: Buffer; dic: Buffer }
) => { correct: (w: string) => boolean; suggest: (w: string) => string[] }

type Checker = ReturnType<typeof NSpell>

// Carregado na primeira requisição e mantido em memória
let checker: Checker | null = null

function getChecker(): Checker {
  if (!checker) {
    // Lê diretamente dos arquivos — evita o import.meta.url do dictionary-pt que
    // quebra quando o Next.js tenta fazer bundle do pacote ESM
    const base = path.join(process.cwd(), 'node_modules', 'dictionary-pt')
    const aff = fs.readFileSync(path.join(base, 'index.aff'))
    const dic = fs.readFileSync(path.join(base, 'index.dic'))
    checker = NSpell({ aff, dic })
  }
  return checker
}

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get('word')?.trim()
  if (!word || word.length < 2) {
    return NextResponse.json({ correct: true, suggestions: [] })
  }

  try {
    const spell = getChecker()
    // Aceita original (nomes próprios, siglas) e minúscula
    const correct = spell.correct(word) || spell.correct(word.toLowerCase())
    const suggestions = correct ? [] : spell.suggest(word).slice(0, 5)
    return NextResponse.json({ correct, suggestions })
  } catch {
    // Falha silenciosa — nunca interrompe o usuário
    return NextResponse.json({ correct: true, suggestions: [] })
  }
}
