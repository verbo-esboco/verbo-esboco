# VERBO — Design System: Scriptorium

## Intent

**Who:** Pastor/pregador brasileiro. Sentado sozinho, tarde da noite ou cedo de manhã, preparando uma mensagem. Modo contemplativo, lidando com texto sagrado.

**What:** Estruturar uma mensagem bíblica — partir de um texto, desenvolver pontos, chegar ao púlpito com clareza.

**Feel:** Como abrir um diário de couro bem usado. Como o interior de uma biblioteca de seminário. Como um livro teológico bem tipografado — quente, focado, sem pressa. **Não** como um dashboard SaaS.

---

## Color Tokens (`globals.css`)

```css
--brand:         #1C4532   /* verde floresta — lombada de Bíblia de couro */
--brand-mid:     #2D6A4F
--brand-light:   #40916C
--brand-muted:   rgba(28, 69, 50, 0.10)
--brand-muted-2: rgba(28, 69, 50, 0.05)

--gold:          #B07D2A   /* latão/iluminura — acento dourado quente */
--gold-2:        #C9922E
--gold-muted:    rgba(176, 125, 42, 0.12)

--bg:            #F5F0E8   /* pergaminho envelhecido */
--surface:       #FDFCF9   /* página de livro */
--surface-2:     #F9F4EA
--hover:         #EDE7D5
--active:        #E3D9C5

--ink-1:         #1C1812   /* tinta nanquim */
--ink-2:         #3D3526
--ink-3:         #7A6E5E
--ink-4:         #A89880

--line:          #D4C5A9   /* sépia — margem de caderno antigo */
--line-soft:     rgba(212, 197, 169, 0.5)
```

## Typography

| Variável | Fonte | Uso |
|---|---|---|
| `--font-serif` | Playfair Display | Títulos, numerais romanos de seção, logotipo |
| `--font-sans`  | Inter | UI, labels, body text |

**Regras:**
- Títulos de esboço: `font-serif`, bold, 1.75rem
- Referência bíblica: itálico, cor `--gold`, tamanho xs
- Labels/ações: `text-[10px]` com `tracking-[0.15em] uppercase` — herança de tipografia editorial
- Nunca usar gradiente de texto

## Spacing

Base: `1rem` (16px). Padding padrão de telas: `px-8 py-8`.
Padding do sidebar: `px-4` a `px-5`.

## Elevation / Borders

**Sem `border-radius` grande.** Máximo `rounded-lg` (8px). A maioria dos elementos usa arestas retas ou `rounded-sm`.

**Sombras — sépia quente, baixo contraste:**
```css
--shadow-sm:  0 1px 3px rgba(28,24,18,0.07), 0 1px 2px rgba(28,24,18,0.04)
--shadow-md:  0 4px 16px rgba(28,24,18,0.09), 0 2px 6px rgba(28,24,18,0.05)
--shadow-lg:  0 8px 32px rgba(28,24,18,0.11), 0 2px 8px rgba(28,24,18,0.06)
--shadow-fab: 0 4px 24px rgba(28,69,50,0.38), 0 1px 6px rgba(28,24,18,0.14)
```

**Sem gradientes.** `.brand-gradient` e `.hero-gradient` mapeiam para `background: var(--brand)` sólido.

## Component Patterns

### Ornamento tipográfico
Usado em divisores, estados vazios, página de login:
```jsx
<div className="flex items-center gap-3">
  <div className="h-px w-14" style={{ background: 'var(--line)' }} />
  <div className="w-1.5 h-1.5 rotate-45" style={{ background: 'var(--gold)' }} />
  <div className="h-px w-14" style={{ background: 'var(--line)' }} />
</div>
```

### Inputs
Sem bordas de box. Apenas `borderBottom: '1px solid var(--line)'` — estilo formulário tipográfico.
Foco: sem outline colorido, sem ring.

### Botões primários
```css
background: var(--brand)   /* verde sólido */
color: #fff
/* sem border-radius grande, sem gradiente, sem glow */
```

### Botões/labels de ação (status, pasta)
```css
border: 1px solid var(--line)
font-size: 10px
tracking: wider
text-transform: uppercase
font-weight: 600
```

### Tags
```css
border: 1px solid var(--line)
background: var(--bg)
color: var(--ink-3)
font-size: 10px
tracking: wider
text-transform: uppercase
/* sem border-radius grande, sem background colorido */
```

### Cards de lista (EsbocoList)
- Sem card com bordas arredondadas
- Separados por `1px solid var(--line-soft)` horizontais
- Item ativo: `borderLeft: '2px solid var(--brand)'`, `background: var(--hover)`
- Item inativo: `borderLeft: '2px solid transparent'`

### Seções do editor (SecaoCard)
- `borderTop: '1px solid var(--line)'` entre seções
- Ativa/preenchida: `borderLeft: '2px solid var(--brand)'`
- Numeral romano em `font-serif`, cor `--brand` quando preenchido, `--ink-4` quando vazio
- Sem background de card, sem sombra

### Filtros da lista
Texto puro com `tracking-wider uppercase`. Ativo: `background: var(--brand) color: #fff`. Inativo: `color: var(--ink-4)`. Sem pills arredondadas.

### Status badges
Dot `1px` quadrado (sem `rounded-full`) + texto uppercase tracking.

## Layout

- Sidebar: `md:w-80 lg:w-96`, `border-right: 1px solid var(--line)`
- Editor: `flex-1`, `background: var(--surface)`
- Mobile: stack vertical — lista primeiro, editor ocupa tela inteira ao editar
- Scrollbar: `4px`, thumb cor sépia

## O que NUNCA fazer

- Gradientes (nem de fundo, nem de texto, nem de botão)
- `border-radius` acima de `rounded-lg`
- Glow/neon em sombras
- Azul/roxo/lavanda em qualquer token
- Cards elevados com sombra forte
- Pill buttons coloridos para filtros
- Ícone de logo dentro de container arredondado com gradiente
