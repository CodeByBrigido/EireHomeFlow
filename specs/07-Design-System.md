# Design System

Produto: ÉireHome Flow · Versão do documento: 1.2 · Última revisão: 24/09/2026

Fonte de verdade técnica: `docs/css/styles.css`. Este documento explica os tokens e componentes e quando usar cada um. Toda cor nova precisa virar token em `:root` e passar no teste de contraste (seção 2.3).

## 1. Marca

- **Nome:** ÉireHome Flow. "ÉireHome" em creme e "Flow" em dourado sobre o verde.
- **Símbolo:** casinha creme com porta terracota sobre fundo verde (ícone do projeto original).
- **Logo para e-mail:** `docs/img/brand/eirehome-flow-logo.png` (publicada pelo GitHub Pages), selo verde arredondado com o símbolo e o nome, 498×112 px (exibida a 220px).
- **Personalidade:** acolhedora, prática, irlandesa (verde de musgo, terracota de tijolo, areia de praia).

## 2. Cores

### 2.1 Tokens

| Token | Hex | Uso |
|---|---|---|
| `--ink` | `#0f6b52` | Verde da marca: cabeçalho, botão principal, nós disponíveis, valores em destaque |
| `--ink-dark` | `#0a4c3a` | Sombra sólida dos botões verdes, hover de links |
| `--pop` | `#b3521f` | Terracota: eyebrows, etapas feitas, "Start here", cartão de custos, contorno de foco |
| `--pop-dark` | `#8a3d14` | Sombra dos elementos terracota; mensagens gerais dos formulários |
| `--gold` | `#f3b45f` | "Flow" na marca, sublinhado do link ativo, botão "Open this step", pontos do ticker |
| `--cream` | `#fffaf3` | Fundo da página; texto sobre verde e terracota; fundo dos campos |
| `--text` | `#2c2118` | Texto principal e títulos |
| `--body` | `#4a3d31` | Texto corrido longo (painel de etapa, guia) |
| `--muted` | `#6b5a48` | Texto de apoio, rótulos de campos |
| `--muted-2` | `#6f5e49` | Números de fase, "Step N of 31" |
| `--faint` | `#74644f` | Rótulos pequenos, legendas, rodapé, avisos |
| `--locked` | `#766652` | Etapas bloqueadas |
| `--brown` | `#5c4a38` | Texto de botões secundários, nota do painel |
| `--sand` | `#f3ece1` | Fundos suaves: rodapé, cabeçalho de fase, chips, cartão de prestação |
| `--sand-2` | `#f0e5d6` | Trilho de barras e anel, nó bloqueado |
| `--line` | `#efe2d1` | Borda de cartões |
| `--line-2` | `#e4d8c8` | Borda de botões secundários e campos |
| `--hover` | `#f7efe3` | Fundo no hover de botões secundários |
| `--peach` | `#fdf2e4` | Dicas ("Worth knowing"), veredito negativo, mini cartão de streak |
| `--mint` | `#e8f1ec` | Veredito positivo, mini cartão de XP |
| `--error` | `#b42318` | Borda, mensagem e requisitos pendentes de campo inválido (6,6:1 no branco) |
| `--error-bg` | `#fdf0ee` | Fundo de campo inválido |

Cores fixas fora dos tokens (usar só nestes lugares): `#cfe7dd` (anel do nó atual), `#e0d2be` (sombra do nó bloqueado), `#c98f3e` (sombra do botão dourado), `#ffd79a` ("★ N XP" no cabeçalho), `#8a5420` / `#6b4a22` / `#8a5a2a` (textos sobre `--peach`), `#cfe2d7` / `#f0dcc0` (bordas do veredito), `#fdfaf4` (itens da checklist), `#c3b39c` / `#ddcdb6` (selo final tracejado).

### 2.2 Combinações aprovadas

| Texto | Fundo | Contraste |
|---|---|---|
| `--text` | `--cream` | 15,1:1 |
| `--muted` | `--cream` | 6,4:1 |
| `--faint` | branco / `--cream` / `--sand` | 5,7 / 5,5 / 4,9:1 |
| `--locked` | `--cream` | 5,3:1 |
| `--cream` | `--ink` | 6,2:1 |
| `--cream` | `--pop` | 4,9:1 |
| branco | `--pop` | 5,1:1 |
| creme a 90% (links do topo) | `--ink` | 5,4:1 |
| `--pop` | `--cream` | 4,9:1 |
| `--gold` (≥ 18,7px em negrito) | `--ink` | 3,6:1 (texto grande) |

### 2.3 Regras
- Texto normal: contraste mínimo de **4,5:1**. Texto grande (≥ 24px, ou ≥ 18,7px em negrito): 3:1.
- Não reduzir opacidade de texto sobre `--pop`. Sobre `--ink`, o mínimo é 80%.
- `--gold` sobre fundo claro não pode ser usado para texto.

## 3. Tipografia

- **Família:** Nunito (variável, 400 a 800), local em `docs/fonts/`, com itálico 600 para ênfase. Pilha: `'Nunito', system-ui, sans-serif`.
- **E-mails:** Arial/Helvetica (clientes de e-mail não carregam a Nunito).

| Estilo | Tamanho | Peso | Altura de linha | Espaçamento | Onde |
|---|---|---|---|---|---|
| Display | 66px (celular: `clamp(38px, 10.5vw, 66px)`) | 800 | 1 | -0.03em | Título do hero |
| H1 de tela | 48px (`clamp(32px, 8.5vw, 48px)`) | 800 | 1.02 | -0.03em | "Getting the keys...", "What you can actually buy" |
| Número grande | 56px (cartões), 52px (preço máximo), 38px (prestação) | 800 | 1 | -0.03em | Valores |
| H2 de seção | 42px (`clamp(28px, 7.5vw, 42px)`) | 800 | 1.05 | -0.025em | "Six phases...", "The full guide" |
| Título do painel | 34px (celular 28px) | 800 | 1.08 | -0.025em | Título da etapa |
| Título de cartão | 21px | 800 | 1.15 | | Fases |
| Título de etapa no guia | 18px | 800 | 1.25 | | |
| Corpo grande | 17-18px | 400 | 1.6 | | Hero, painel |
| Corpo | 15-16px | 400 | 1.5-1.6 | | Textos, checklist |
| Pequeno | 13-14px | 600-700 | 1.5 | | Notas, legendas, rodapé |
| Eyebrow / rótulo | 12px | 800 | | 0.12-0.14em, maiúsculas | "YOUR JOURNEY", "WHAT THIS TAKES" |

Ênfase no hero: `<em>` em itálico e verde (`--ink`).

## 4. Espaço, forma e profundidade

- **Largura máxima do conteúdo:** 1160px, centralizado.
- **Margem lateral:** 32px (desktop) e 16px (≤ 720px).
- **Espaçamentos comuns:** 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 30, 32, 36, 44, 56, 64, 90px.
- **Raios:** 999px (pílulas e botões), 50% (nós e selos), 26px (painel da etapa e cartão de conta), 24px (cartões da calculadora e imagem), 22px (cartões), 18px (cabeçalho de fase e dica), 16px (checklist), 14px (campos, mini cartões, notas).
- **Profundidade "pressionável":** botões e nós têm sombra sólida sem desfoque, deslocada 4-6px para baixo, na cor escura do próprio botão (ex.: `0 5px 0 var(--ink-dark)`). Ao clicar, o elemento desce 3-4px (`translateY`).
- **Camadas (z-index):** cabeçalho 40; menu da conta 45; painel de etapa em tela cheia (≤ 960px) 60; aviso (toast) 70.

## 5. Movimento

| Animação | Duração | Onde |
|---|---|---|
| `eh-marquee` | 38s linear, infinita | Ticker (pausa no hover, no foco e no botão) |
| `eh-bob` | 2.4s, infinita | Nó da etapa atual (só fora do modo compacto) |
| Transições | .12s (botões e nós), .14s (cartões de fase), .15s (ícone do acordeão), .25s (barra de progresso) | |

Com `prefers-reduced-motion: reduce`, as animações e transições acima são desligadas, e o ticker vira uma lista estática.

## 6. Pontos de quebra

| Nome | Regra | Efeito principal |
|---|---|---|
| Tablet | `max-width: 960px` | Grades viram 1 coluna (fases em 2); painel da etapa em tela cheia |
| Celular | `max-width: 720px` | Margens de 16px; tipografia com `clamp()`; streak e XP ocultos no topo; onda da trilha a 45% |
| Celular estreito | `max-width: 480px` | Campos da calculadora e caixas de resultado em 1 coluna |

## 7. Componentes

### 7.1 Botões
| Componente | Classe | Aparência | Uso |
|---|---|---|---|
| Principal | `.btn.btn--primary` | Verde, texto creme, sombra sólida | Ação principal (Start my journey, Complete step, Create account) |
| Secundário claro | `.btn.btn--ghost` | Branco, borda `--line-2` | Ação alternativa no hero |
| Contorno | `.btn.btn--outline` | Transparente, borda `--line-2` | Previous / Next |
| Pílula de alternância | `.pill` (`.is-on`) | Branca; ativa fica verde | Perfis da calculadora; sempre com `aria-pressed` |
| Dourado | `.next-up__btn` | Dourado, texto escuro | "Open this step" |
| Escuro | `.verdict__btn` | `--text`, texto creme | "Back to my journey" |
| Pequeno | `.detail__close` | Pílula pequena com borda | "Close" |
| Largo discreto | `.reset` | Largura total, borda | "Reset progress" |
| Topo | `.btn-signin` (link) | Borda creme translúcida | "Sign in" deslogado |
| Link de texto | `<a>` sem classe | Verde, sublinhado; hover verde escuro | Links dentro de textos |
| Desativado | `.btn:disabled` | 45% de opacidade, sem sombra | Etapa bloqueada |

Links que parecem botão usam as mesmas classes em `<a>` (`.btn`, `.next-up__btn`, `.verdict__btn`, `.nav__link`, `.phase-card`). A regra de cor de link vale só para `<a>` sem classe.

### 7.2 Cartões e superfícies
`.stat` (número-chave; `.stat--accent` terracota), `.phase-card` (fase na Home, sobe 3px no hover), `.guide-phase` (acordeão do guia), `.card` (progresso), `.next-up` (verde), `.detail` (painel), `.form`, `.result-main` (verde), `.breakdown-card`, `.verdict` (mint; `.is-short` pêssego), `.monthly` (areia), `.auth-card` (páginas de conta), `.gate` (aviso de página logada), `.guide-cta__card` (convite ao guia, areia). Todos brancos com borda `--line` de 2px, exceto os coloridos citados.

### 7.3 Jornada
- **Nó** `.node`: círculo de 64px (44px no modo compacto), com os estados `.is-current`, `.is-done`, `.is-locked` e `.is-open` (ver UI/UX seção 4.3).
- **Balão** `.callout` ("Optional") e `.callout--start` ("Start here").
- **Cabeçalho de fase** `.phase__head` com selo `.phase__badge` (branco com borda; `.is-active` verde; `.is-done` terracota).
- **Selo final** `.finish__badge` (tracejado; `.is-done` terracota).
- **Anel** `.ring`: SVG de 84px, trilho `--sand-2`, preenchimento `--ink`, traço 11.
- **Barra** `.bar` / `.bar__fill` (verde; `.is-full` terracota).

### 7.4 Conteúdo
- **Eyebrow** `.eyebrow`: 12px, maiúsculas, terracota.
- **Rótulo** `.label`: 12px, maiúsculas, `--faint`.
- **Chips** `.chip`: areia; `.chip--tag` terracota (obrigatória) ou areia (`.is-optional`).
- **Checklist** `.checklist`: itens em caixa clara com ◆ verde.
- **Dica** `.tip` / `.guide-step__tip`: fundo pêssego, rótulo "Worth knowing".
- **Nota** `.detail__note`: fundo areia, texto `--brown`, negrito.
- **Dica da calculadora** `.hint`: fundo pêssego.

### 7.5 Formulários
- **Campo** `.field` > `.field__label` + `input`: fundo creme, borda `--line-2` de 2px, raio 14px, texto 16px em negrito (16px evita zoom automático no iPhone).
- **Campo inválido** `.field.is-invalid`: borda `--error` e fundo `--error-bg`, com `aria-invalid="true"` no input.
- **Mensagem de erro** `.field__error`: 13px, negrito, `--error`, logo abaixo do input, ligada por `aria-describedby` (id `error-<campo>`); some quando vazia.
- **Requisitos de senha** `.password-rules`: lista de 13px; ○ pendente, ✓ verde quando atendido; com `.is-invalid`, os pendentes ficam `--error`.
- **Status** `.form-status`: 14px, negrito, `--pop-dark`, com `role="status"`; some quando vazio.

### 7.6 Ticker
`.ticker` (faixa verde) > `.ticker__track` (itens `.ticker__item` com ponto dourado `.ticker__dot`) e o botão `.ticker__toggle` ("Pause"/"Play"), que ganha contorno de foco dourado.

### 7.7 Conta e área logada
- **Círculo de iniciais** `.avatar`: 40px, dourado (`--gold`), texto `--text` 14px negrito, borda creme; `aria-expanded` indica o menu aberto.
- **Menu da conta** `.menu`: cartão branco, raio 18px, sombra suave, 240px de largura mínima, abaixo do círculo e alinhado à direita (no celular, largura da tela menos 16px de cada lado). Cabeçalho `.menu__who` (nome em negrito, e-mail em `--faint`) e itens `.menu__item` (hover `--hover`; "Sign out" com `.menu__item--danger` em `--error`).
- **Aviso** `.toast`: fixo no rodapé da tela, centralizado, até 560px, raio 18px. Sucesso: fundo `--mint`, ícone ✓ verde. Erro (`.is-error`): fundo `--error-bg`, ícone ! vermelho. Ação opcional `.toast__action` (pílula verde) e fechar `.toast__close` (×).
- **Cartão de conta** `.auth-card`: branco, até 440px, raio 26px, centralizado na página; título 30px; nota `.auth-card__note` em areia; links `.auth-card__switch` centralizados.
- **Aviso de página logada** `.gate`: cartão com texto `--brown` e botões "Sign in" / "Create an account".
- **Dashboard:** grade `.dash-stats` de 4 cartões (2 no tablet, 1 abaixo de 480px), `.dash-row` com o cartão verde de números e o cartão da conta (`.dash-account__*`, com faixa `--mint` "Your progress is saved to your account.").
- **Perfil:** `.profile-grid` com o formulário (`.profile-form`) e o cartão lateral (`.profile-side`); títulos de cartão `.card__title` 20px; valores só de leitura `.field__static`.

### 7.7.1 Painel da etapa
- `.detail`: fixo (`sticky`, 88px do topo), `box-sizing: border-box`, `max-height: calc(100vh - 104px)` e rolagem própria (`overflow-y: auto`, `overscroll-behavior: contain`).
- `.detail__actions`: presos no rodapé do painel (`position: sticky; bottom: 0`), fundo branco e linha `--sand` acima.
- Ao abrir outra etapa, o painel volta ao topo.

### 7.8 Páginas legais
- Grade `.legal-layout` com colunas em porcentagem (`68% 28%`, `justify-content: space-between`); uma coluna abaixo de 960px.
- Conteúdo em `.legal`: parágrafos e itens com `text-align: justify` e `hyphens: auto`; data em `.legal__updated` (14px, `--faint`), resumo em `.legal__summary` (fundo `--sand`, raio 18px).
- Barra lateral `.legal-aside` (fixa a 90px do topo no desktop): índice `.legal-toc` (cartão branco com borda; links 14px `--muted`, seção atual com fundo `--sand` e texto `--ink`) e cartão `.legal-help` (fundo `--ink`, link de e-mail creme sublinhado, botão dourado `.legal-help__link`).
- `h2` 24px e `h3` 18px em negrito; parágrafos e listas 16px com altura de linha 1.65 em `--body`.
- Links do rodapé em `.site-footer__links` (sublinhados, `--faint`).

### 7.9 Ilustrações das etapas
Uma ilustração por etapa em `docs/img/steps/<id da etapa>.svg`, exibida com a classe `.step-image` (proporção 8:5, raio 18px): até 340px e **centralizada por alinhamento** no painel da jornada (contêiner `.detail__figure` com `display: flex; justify-content: center`, sem margem automática na `.detail__image`) e, no guia, numa coluna à direita do texto (`.guide-step` em grade `68% 28%`; no celular, acima do título, até 320px).

Regras para criar ou trocar uma ilustração (conferidas pelo validador `check_svg.py`):
- SVG escrito à mão, `viewBox="0 0 320 200"`, `width="320" height="200"`, até 6 KB.
- Primeiro elemento sempre `<rect width="320" height="200" rx="20" fill="#f3ece1"/>`.
- Elipse de chão `#e4d8c8` sob o assunto principal.
- Formas chapadas. Profundidade "pressionável": cada objeto principal tem uma cópia mais escura desenhada antes, 4-6px abaixo (`#0f6b52` → `#0a4c3a`, `#b3521f` → `#8a3d14`, `#f3b45f` → `#c98f3e`, creme ou branco → `#e4d8c8`).
- Detalhes com traços arredondados de 3-4px em `#e4d8c8`, `#6b5a48` ou `#c98f3e`; 2-4 pontinhos de destaque nos cantos.
- Só as cores da paleta da marca. Proibido: texto (letras ou números), gradientes, filtros, máscaras, imagens externas, `<use>`, `<style>`, scripts, rostos.
- Um assunto principal centralizado (55-65% da área), 1-3 elementos de apoio, 16px de margem livre nas bordas. Reconhecível a 240px.
- Todo `<img>` de ilustração tem texto alternativo que descreve o desenho literalmente.

### 7.10 Imagens
- **Ilustrações** (desenhos chapados): SVG. Mais leve que WebP ou PNG e nítido em qualquer tela.
- **Ilustrações com textura ou fotos** (a capa): WebP em 3 larguras (600, 900, 1200) com `srcset` e `sizes`, `width`/`height` definidos e `fetchpriority="high"` quando for a imagem principal da página.

## 8. Ícones e símbolos

★ etapa obrigatória disponível · ◆ opcional / marcador de checklist · ✓ feita · 🔒 bloqueada · 🔑 selo final · ⏱ tempo · € custo · ← → navegação · ○ requisito pendente · + / × acordeão fechado / aberto. Ícones decorativos ao lado de texto ficam `aria-hidden`.

## 9. E-mails

- Fundo `#F3ECE1`; cartão branco, borda `#EFE2D1`, raio 16px, largura máxima 560px.
- Título 25px negrito `#2C2118`; texto 16px `#6B5A48`; nota 13px; rodapé 12px.
- Botão verde `#0F6B52`, texto branco, raio 8px, padding 16×24px, feito com tabela para funcionar no Outlook.
- Logo com texto alternativo estilizado (verde, 26px, negrito) para quando as imagens estão bloqueadas.

## 10. Fazer e não fazer

| Fazer | Não fazer |
|---|---|
| Usar tokens de `:root` | Escrever hex novo direto num componente |
| Botões com sombra sólida e "pressionar" ao clicar | Sombras desfocadas em botões |
| Texto em sentence case | Title Case Em Botões |
| Testar contraste antes de usar uma cor nova | Reduzir opacidade de texto para "suavizar" |
| Um único botão principal por área | Dois botões verdes lado a lado |
| Ícone acompanhado de texto ou rótulo acessível | Ícone sozinho como única informação |
