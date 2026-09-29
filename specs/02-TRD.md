# TRD: Technical Requirements Document

Produto: ÉireHome Flow · Versão do documento: 1.10 · Última revisão: 29/09/2026

## 1. Arquitetura

```
 Navegador do usuário
 ┌──────────────────────────────────────────────────────────────┐
 │ 14 páginas .html (uma por lugar do site) + 20 artigos         │
 │   cada uma: <body data-page>, <html data-i18n-ns>             │
 │   js/i18n-boot.js (1º no <head>: idioma e textos)             │
 │   textos: locales/<idioma>/<ns>.json (inglês = fonte)         │
 │   cabeçalho e rodapé já no HTML (copiados de partials/)       │
 │   css/styles.css                                              │
 │   js/pages/<pg>.js (módulo ES) → js/core/*.js → js/lib/*.js   │
 │   js/config.js (chaves do Supabase, lido por core/account.js) │
 │   conteúdo das etapas: guide.html (lido por fetch + DOMParser)│
 │   localStorage "eirehome-flow" · sessionStorage "eirehome-flash"│
 │   localStorage "eirehome-locale", "eirehome-i18n:*"           │
 └──────────────┬─────────────────────────────┬─────────────────┘
                │ HTTPS (estático)             │ HTTPS (API)
      ┌─────────▼────────┐          ┌─────────▼────────────────────┐
      │ GitHub Pages     │          │ Supabase (eu-west-1, Irlanda)│
      │ pasta /docs      │          │ Auth + Postgres + Storage    │
      └──────────────────┘          └─────────▲────────────────────┘
                                              │ supabase-js@2 via jsDelivr
                                              │ (só se config.js estiver preenchido)
```

- **Uma página por lugar.** Todo clique que leva a outro lugar abre um `.html` próprio. Painéis dentro de uma página (a etapa aberta na jornada) ganham endereço com `#`.
- **Sem build, sem framework.** HTML, CSS e JavaScript puros, em módulos ES (`<script type="module">`), carregados direto pelo navegador.
- **Sem servidor próprio.** A lógica roda no navegador; o Supabase cuida de login e do progresso na nuvem.
- **Vários idiomas, sem framework.** Os textos ficam em JSON por idioma e por parte do site; um script clássico no `<head>` escolhe o idioma e traduz a página enquanto ela é lida. Arquitetura completa, convenção e glossário: `specs/08-Internationalisation.md`.

## 2. Estrutura de arquivos

```
EireHomeFlow/
├── docs/                          ← site publicado (GitHub Pages)
│   ├── index.html                 ← Home
│   ├── guide.html                 ← guia completo; FONTE ÚNICA do conteúdo das 31 etapas
│   ├── journey.html               ← jornada (trilha, painel da etapa, progresso)
│   ├── calculator.html            ← calculadora
│   ├── dashboard.html             ← painel da pessoa logada
│   ├── profile.html               ← perfil (nome, e-mail, senha, sair)
│   ├── signin.html · signup.html · forgot-password.html · new-password.html
│   ├── contact.html               ← Contact us (formulário que abre o app de e-mail)
│   ├── sitemap.html               ← mapa do site (páginas, 31 etapas, artigos)
│   ├── sitemap.xml                ← mapa para buscadores, escrito por npm run posts: não edite
│   ├── privacy.html · terms.html   ← Privacy Policy e Terms of Use
│   ├── blog/<slug>.html           ← um artigo do blog por página (20), escritos por npm run posts: não edite
│   ├── partials/header.html       ← marca, navegação, menu de idiomas, Sign in / círculo e menu da conta
│   ├── partials/footer.html       ← rodapé (Contact us, Sitemap, Privacy Policy, Terms of Use) e caixa de avisos (toast)
│   ├── locales/<idioma>/<ns>.json ← textos do site: en (fonte), pt, es, fr, de, it, pl, ro, lt
│   │                                 (fonte única: npm run partials copia os dois para as 14 páginas e os artigos)
│   ├── css/styles.css
│   ├── js/config.js               ← SUPABASE_URL e SUPABASE_ANON_KEY (chave publicável)
│   ├── js/i18n-boot.js            ← runtime de tradução: script clássico, primeiro no <head>
│   ├── js/lib/                    ← lógica pura, sem DOM, testada no Node (tests/)
│   │   ├── calculator.js          ← regras e fórmulas, calc(), verdictKind(), RANGES
│   │   ├── progress.js            ← progress(steps, done), XP_PER_STEP
│   │   ├── validation.js          ← senha, e-mail, nome, safeNext()
│   │   ├── people.js              ← userName, firstName, initials
│   │   ├── locales.js             ← lista de idiomas (status complete/draft) e de namespaces
│   │   ├── posts.js               ← os artigos do blog (título, resumo, categoria, etapa, tags), sorteio e semelhantes
│   │   ├── contact.js             ← CONTACT_EMAIL e mailtoLink (a mensagem do formulário de contato)
│   │   └── format.js              ← num, esc, formatMoney/Number/Percent/Date (Intl), euro
│   ├── js/core/                   ← partes do navegador compartilhadas (ver seção 4)
│   │   ├── app.js                 ← startPage(): carregamento, cliques, eventos da conta
│   │   ├── state.js · steps.js · sync.js · account.js
│   │   ├── header.js · notices.js · forms.js · dom.js
│   │   └── i18n.js · language.js  ← t(), money(), date()...; menu de idiomas
│   ├── js/pages/<página>.js       ← um módulo por página (home, guide, journey, calculator,
│   │                                 dashboard, profile, auth, legal, post, contact, sitemap)
│   ├── img/hero-600.webp · hero-900.webp · hero-1200.webp  ← capa em WebP (srcset)
│   ├── img/steps/<id>.svg         ← uma ilustração por etapa (31), referenciada no guide.html
│   ├── img/blog/<slug>.svg        ← a imagem de cada artigo (topo do artigo e cartões da Home)
│   ├── img/brand/eirehome-flow-logo.png  ← logo dos e-mails, servida pelo GitHub Pages
│   ├── img/icon/                  ← ícone do site: favicon.svg, favicon-32.png, apple-touch-icon.png
│   └── fonts/*.woff2
├── content/blog/<slug>.json      ← o texto de cada artigo, em inglês (fonte da página em docs/blog/)
├── supabase/email-templates/      ← e-mails de confirmação e de nova senha
├── specs/                         ← estes documentos, AUDITORIA.md e SETUP-CONTAS.md
├── _original-Backup/              ← bundle original do Claude Design
├── tests/                         ← testes automáticos (npm test)
├── tools/                         ← serve.js (npm start), bump-version.js, check-versions.js, versions.js,
│                                     partials.js e stamp-partials.js (npm run partials),
│                                     i18n.js, i18n-project.js, stamp-i18n.js (npm run i18n) e check-i18n.js,
│                                     posts.js e stamp-posts.js (npm run posts)
├── .github/workflows/checks.yml   ← lint, testes, versões, partials, artigos e traduções em cada Pull Request (Node 22)
├── package.json · eslint.config.js · .editorconfig
├── README.md  ·  .gitignore  ·  .gitattributes (LF para todos)
```

Cada página carrega um único script: `<script type="module" src="js/pages/<página>.js?v=...">`. Ele importa o que usa de `js/core/` e `js/lib/` e chama `startPage({ init, render, actions })`. O `guide.html` usa `js/pages/guide.js`, que só chama `startPage()`.

## 3. Ciclo de carregamento

0. No `<head>`, antes do CSS, `js/i18n-boot.js` escolhe o idioma (`?lang=`, escolha salva, idioma do navegador, inglês), marca `<html lang>` e `data-locale` e carrega os namespaces de `data-i18n-ns` (da cópia no `localStorage` na hora, ou por `fetch`). Com a cópia, um `MutationObserver` traduz cada elemento assim que o HTML é lido, antes do primeiro desenho; sem ela, a página fica escondida até os textos chegarem (no máximo 3 s). Detalhes: `specs/08-Internationalisation.md`, seção 4.
1. O HTML da página chega com o seu conteúdo estático, já com cabeçalho, rodapé e caixa de avisos (copiados de `partials/` por `npm run partials`). Por isso nada pula quando a página abre. Logo que os módulos rodam, antes de a lista de etapas chegar, `init()` desenha o cabeçalho: o link ativo, e "Sign in" ou o círculo da conta, que sai da sessão que o Supabase salvou neste navegador no último login (`Account.shown()`). Só quem chega por um link de e-mail (`#access_token`, `type=`, `error_code`) espera o Supabase, com os dois invisíveis (`data-auth-pending`). Assim nem "Sign in" pisca para quem está logado, nem o círculo aparece atrasado.
   Na troca de página, `@view-transition { navigation: auto; }` faz a página nova aparecer num fade de 0,15 s (Chrome, Edge, Safari 18.2+; nos outros, troca como antes), e o cabeçalho, com `view-transition-name: site-header`, fica parado. Desligado com `prefers-reduced-motion: reduce`.
2. Os módulos rodam depois que o HTML é lido (módulos ES são adiados por padrão). O módulo da página chama `startPage()` de `core/app.js`.
3. `init()` em `core/app.js`:
   1. `loadSaved()` restaura progresso e calculadora do `localStorage`;
   2. `ready()` (textos do idioma) e `loadSteps()`, lado a lado. `loadSteps()` monta `PHASES` e `steps` a partir de `guide.html` (buscado com `fetch`, lido com `DOMParser` e traduzido com `translate(doc)`; no próprio `guide.html`, usa o documento atual, já traduzido). O menu de idiomas é montado aqui;
   3. `init` da página, se existir;
   4. `render()` (cabeçalho e `render(p)` da página);
   5. mostra o aviso guardado na página anterior (`sessionStorage`) e, se o endereço trouxer erro de link de e-mail, o aviso vermelho;
   6. `Account.init(onAccountChange)`.

**Consequência:** o site precisa ser servido por HTTP. Abrindo um `.html` direto do disco (`file://`), os módulos e o `fetch` do guia falham: cabeçalho e rodapé aparecem, mas nada funciona e as etapas não carregam.

## 4. Núcleo compartilhado (`js/core/` e `js/lib/`)

| Parte | Módulo | O que faz |
|---|---|---|
| Estado | `core/state.js` | `state = { done, open, ftb, joint, newBuild, apartment, salary, salary2, savings, gift, htb, price, rate, term, calcSaved }`. `apartment` só vale com `newBuild` (IVA de 9% em vez de 13,5%). `calcSaved` vira `true` quando a pessoa salva a calculadora na jornada: só depois disso os números aparecem como dela. `setState` (grava no `localStorage`, chave `eirehome-flow`, e avisa quem se inscreveu com `onStateChange`), `loadSaved` (também traz taxa e prazo para dentro de `RANGES`: 1-8% e 5-35 anos) |
| Etapas | `core/steps.js` | `loadSteps` (texto, checklist, dica, tempo, custo, tipo, `auto`, `numbers`, passo a passo, links externos e ilustração com alt de cada etapa), `PHASES` e `steps` (preenchidos depois do carregamento), `currentProgress()`, `stepLink`, `calculatorStep`, `phaseCardsHtml` (Home e Dashboard) |
| Progresso | `lib/progress.js` | `progress(steps, done)` e `XP_PER_STEP` |
| Nuvem | `core/sync.js` | `setDone` (também grava na conta e devolve a promessa), `syncOnSignIn` (soma o progresso local com o da conta) |
| Cálculo | `lib/calculator.js` | `calc(s)`, `verdictKind(c)` (`"within"`, `"cashShort"`, `"loanOver"`, `"outOfReach"`), `homeVat`, `stampBase`, `stampDuty`, `stampBandCount` (1, 2 ou 3 faixas; a página escreve o rótulo), `htbCap`, `htbLimit`, `htbFor`, `highestPrice`, as constantes da seção 6 e `RANGES`. Nada de texto: a página traduz os códigos |
| Conta | `core/account.js` | objeto `Account` (Supabase) |
| Cabeçalho e área logada | `core/header.js` | `renderHeaderEarly` (link ativo, "Sign in" ou círculo com iniciais, sem textos traduzidos, antes de os textos chegarem), `renderHeader` (o resto), `renderGate`, `setMenu` |
| Idiomas | `core/i18n.js` + `js/i18n-boot.js` + `lib/locales.js` | `t(key, params)` (valores, plural por `count`, reserva em inglês), `ready()`, `locale()`, `tag()`, `money()`, `number()`, `percent()`, `date()`, `translate(root)`, `setLocale(code)` |
| Menu de idiomas | `core/language.js` | `renderLanguages` (idiomas completos no próprio nome), `setLanguageMenu`, `chooseLanguage` |
| Avisos | `core/notices.js` | `showToast(msg, { error, action, sticky })`, `hideToast`, `flash`, `showFlash` |
| Formulários | `core/forms.js` + `lib/validation.js` | `formValues`, `checkForm`, `watchForm`, `renderPasswordRules`, `sayInForm`, `errorText` (erros do Supabase por código, no idioma da página), `readerError`; regras `PASSWORD_RULES`, `EMAIL_PATTERN`, `isFullName` |
| Início e eventos | `core/app.js` | `startPage` (uma vez por página), `AUTH_RETURN`, `cleanAuthUrl`, ações comuns (`menu`, `languageMenu`, `setLocale`, `closeToast`, `signOut`), um `click`, um `input` e um `keydown` no `document`, `onAccountChange` |
| Nomes | `lib/people.js` | `userName`, `firstName`, `initials` ("Rodrigo Andrade Brigido" vira "RB") |
| Blog | `lib/posts.js` | `POSTS` (slug, categoria, etapa do My journey, tags, título e resumo em inglês), `CATEGORY_NAMES` e `CATEGORIES`, `SLIDESHOW` (as palavras do slideshow), `postPath`, `postImage`, `shuffle`, `homeSelection` (4 no slideshow, 3 ao lado, o resto abaixo, sem repetir), `similarPosts` (mesma categoria vale 3, cada tag em comum vale 1; empate segue a ordem de `POSTS`), `postCardHtml` |
| Contato | `lib/contact.js` | `CONTACT_EMAIL` (eirehomeflow@gmail.com) e `mailtoLink({ topic, name, email, message })`: o endereço `mailto:` com assunto "ÉireHome Flow: <assunto>" e o corpo (mensagem, nome, e-mail) codificados |
| Utilitários | `lib/format.js` + `core/dom.js` | `num`, `esc`, `formatMoney`, `formatNumber`, `formatPercent`, `formatDate`, `euro` (inglês da Irlanda); `PAGE`, `bind` |
| Segurança | `lib/format.js`, `lib/validation.js` | `esc()` em todo texto que vai para `innerHTML`; `safeNext()` aceita só `nome-de-pagina.html` com `#ancora` opcional |

Cada módulo de página passa a `startPage` os seus ganchos: `init()`, `render(p)` e `actions` (as ações de `data-action` só daquela página). `lib/` nunca importa de `core/`: por isso roda no Node.

### 4.1 Convenções do HTML

| Atributo | Função |
|---|---|
| `<body data-page="...">` | Identifica a página (home, guide, journey, calculator, dashboard, profile, signin, signup, forgot-password, new-password, contact, sitemap, privacy, terms, post) |
| `<body data-post="<slug>">` | Artigo do blog (a página inteira vem pronta do `npm run posts`) |
| `<base href="../">` | Só nos artigos (`blog/`): os links, o CSS e os scripts resolvem a partir de `docs/`, como nas outras páginas. Por isso os artigos não usam links só com `#âncora` |
| `data-page` nos links do topo | Marca o link ativo |
| `data-action="<nome>"` | Executa `actions[nome](elemento)` |
| `data-id` | Id da etapa nos nós da trilha (`data-action="open"`) |
| `data-field="<campo>"` | Campo da calculadora ligado ao `state` |
| `data-bind="<nome>"` | Recebe texto via `bind(nome, valor)` |
| `<!-- include partials/<arquivo>.html: ... -->` … `<!-- /include -->` | Cópia do partial dentro da página. **Não edite entre os marcadores:** edite o arquivo em `partials/` e rode `npm run partials` (que também marca o link ativo da navegação de cada página). `npm run check:partials` (também no GitHub Actions) falha se alguma página estiver desatualizada. Um `<div data-include="partials/<arquivo>.html"></div>` vazio numa página nova vira a cópia na próxima execução |
| `data-fields="name email ..."` num `<form>` | Campos a validar |
| `data-password="new\|current"` num `<form>` | Senha nova (regras de força) ou atual (só não vazia) |
| `data-keep-next` num link | Mantém o `?next=` ao trocar entre sign-in e sign-up |
| `<html data-i18n-ns="common ...">` | Namespaces de texto que a página usa (`common` sempre) |
| `data-i18n="ns:chave"` | Texto do elemento vem da chave (o elemento não pode ter outros elementos dentro). O inglês é copiado do JSON por `npm run i18n` |
| `data-i18n-html="ns:chave"` | Idem, com links e negrito permitidos (`a`, `br`, `em`, `strong`, `span`) |
| `data-i18n-aria-label`, `-alt`, `-placeholder`, `-title`, `-content` | Traduz o atributo |
| `translate="no"` | Nome que não se traduz (a marca, o XP) |
| `data-i18n-source-only` | Texto mantido em inglês de propósito (texto integral das páginas legais e o blog), com `lang="en-IE"` |
| `data-auto="calculator\|account"` num `.guide-step` | O site marca a etapa sozinho: ao salvar a calculadora na jornada, ou ao entrar na conta. A etapa não tem botão "Complete step" |
| `data-numbers="calculator\|deposit\|costs\|htb"` num `.guide-step` | Quais números da calculadora a jornada mostra nessa etapa (caixa "Your numbers") |
| `.guide-step__howto-label` + `ol.guide-step__howto` | Passo a passo numerado da etapa (ex.: "How to apply" no Help to Buy) |
| `.guide-step__links a` | Links externos da etapa; a jornada mostra só os `https://`, abrindo em nova aba |

### 4.2 Artigos do blog

- **Fonte:** cada artigo tem uma entrada em `js/lib/posts.js` (slug, categoria, etapa do My journey, tags, título e resumo, em inglês) e o texto em `content/blog/<slug>.json`: `alt` (a imagem), `lead`, `sections` (cada uma com `title` e `body`) e `journey` (a caixa que leva ao My journey). Um bloco do `body` é um parágrafo (texto), uma lista (lista de textos), passos numerados (`{ "steps": [...] }`), uma nota "Worth knowing" (`{ "tip": "..." }`) ou uma tabela (`{ "head": [...], "rows": [[...]] }`). Parágrafos, itens, notas e células aceitam `<strong>`, `<em>`, `<br>` e links (`https://` ou uma página do site); títulos são texto simples.
- **Páginas:** `npm run posts` (`tools/stamp-posts.js`) escreve `docs/blog/<slug>.html` com o artigo inteiro em inglês dentro de `<main lang="en-IE" data-i18n-source-only>`: categoria, título, abertura, tempo de leitura (200 palavras por minuto), texto, a caixa do My journey e os 3 artigos semelhantes. Só o cabeçalho e o rodapé (dos partials) têm chaves de tradução. A página usa `<base href="../">`. `npm run check:posts` (no `npm run check` e no CI) falha se faltar texto ou imagem, se um texto tiver travessão, "≈" ou "…", tag ou link fora da lista, se o `journey` não citar "My journey", se uma página ou o `sitemap.xml` estiver desatualizado ou se sobrar página ou texto sem artigo em `POSTS`.
- **Na página:** `js/pages/post.js` só chama `startPage()`, porque o artigo já vem pronto no HTML e funciona sem JavaScript. Na Home, `js/pages/home.js` sorteia os artigos (`homeSelection`) uma vez por visita, no `init`, dentro da seção `#blog`, que também é inglês fixo (`lang="en-IE" data-i18n-source-only`).
- **Slideshow:** os 4 slides ficam empilhados na mesma célula do grid. Na troca, o card inteiro desliza: o atual sai para a esquerda e o próximo entra pela direita, 24px atrás dele, em 0,7 s (classes `is-leaving` e `is-next`). Para trás (seta anterior ou um ponto de número menor), o contrário (`is-prev`). O que saiu fica escondido no `animationend`. Com "reduzir movimento", a troca é direta, sem animação. Só o atual pode receber foco (`inert` nos outros). Passa a cada 7 s, a não ser que a pessoa esteja com o ponteiro ou o foco nele ou a aba esteja escondida. Não há botão de pausa: quando a pessoa usa as setas ou os pontos, ele para de passar sozinho até a próxima visita (`stopped`), o que também serve de meio de parar o movimento (WCAG 2.2.2). Com "reduzir movimento", não passa sozinho. Botões anterior/próximo e pontos (alvos de 24px); só a troca pedida pela pessoa é anunciada (`aria-live="polite"`).

### 4.3 Contato e mapa do site
- **Contato (`contact.html`, `js/pages/contact.js`):** o formulário usa `data-fields="name email message"` e a validação de `core/forms.js` (a regra `message` só pede texto). Logado, nome e e-mail vêm de `Account.shown()`, sem apagar o que a pessoa já digitou. Ao enviar, `mailtoLink` monta o `mailto:` com o assunto no idioma da página e `location.href` abre o aplicativo de e-mail; a página mostra o aviso em `.form-status`. Nada passa pelo Supabase nem fica guardado.
- **Mapa do site (`sitemap.html`, `js/pages/sitemap.js`):** as seções fixas (páginas principais, conta, sobre o site) vêm no HTML, traduzidas. No `init`, a página desenha `#sitemap-steps` (as 6 fases de `PHASES`, cada uma com `journey.html#phase-<slug>`, e as etapas com `journey.html#step-<id>`, nos textos do idioma) e `#sitemap-posts` (os artigos de `POSTS` por categoria, em inglês, numa seção `lang="en-IE" data-i18n-source-only`).
- **`sitemap.xml`:** `npm run posts` escreve as páginas públicas (`PUBLIC_PAGES` em `tools/stamp-posts.js`: Home, guia, jornada, calculadora, contato, mapa do site, privacidade e termos) e os 20 artigos, com o endereço completo de produção (`index.html` vira a pasta do site). As páginas de conta ficam de fora. Depois de publicar, envie `https://codebybrigido.github.io/EireHomeFlow/sitemap.xml` no Google Search Console.

## 5. Endereços

- `journey.html#step-<id>` abre a etapa; `journey.html#phase-<slug>` rola até a fase. Abrir ou fechar uma etapa atualiza o endereço com `history.replaceState`.
- `guide.html#step-<id>` e `guide.html#guide-<slug>` são âncoras do guia.
- `blog/<slug>.html` é um artigo; `index.html#blog` leva à seção do blog na Home.
- `contact.html` é o contato; `sitemap.html` é o mapa do site e `sitemap.xml` o mapa para buscadores.
- Páginas de conta aceitam `?next=`, validado por `safeNext`. Padrão: `dashboard.html`.
- Qualquer página aceita `?lang=<código>` (en, pt, es, fr, de, it, pl, ro, lt, e qualquer idioma em rascunho): abre a página nesse idioma, nesta aba, sem mudar a escolha salva.
- Links dos e-mails voltam sempre para a Home (`Account.homeUrl()`, a pasta do site), então as Redirect URLs do Supabase só precisam do endereço base.

## 6. Especificação da calculadora

Constantes (em `docs/js/lib/calculator.js`):

| Nome | Valor | Origem |
|---|---|---|
| Múltiplo de renda | 4× (primeira compra), 3,5× (mudança) | Central Bank of Ireland |
| Entrada mínima (`DEPOSIT_RATE`) | 10% para os dois perfis | Central Bank, desde 2023 |
| Imposto de selo (`stampDuty`) | 1% até €1m, 2% de €1m a €1,5m, 6% acima; em imóvel novo, sobre o preço sem IVA (`VAT`): casa ÷ 1,135 (13,5%), apartamento ÷ 1,09 (9%, vendas de 08/10/2025 a 31/12/2030, [Revenue: qualifying apartments](https://www.revenue.ie/en/vat/vat-on-property-and-construction/qualifying-apartments/index.aspx)) | [Revenue: rates](https://www.revenue.ie/en/property/stamp-duty/property/stamp-duty-property/rates.aspx) (desde 02/10/2024) e [VAT-exclusive consideration](https://www.revenue.ie/en/property/stamp-duty/consideration/vat-exclusive-consideration.aspx) |
| Solicitor / vistoria / avaliação (`FEES`) | €2.500 / €400 / €150 (total €3.050) | Estimativas de mercado (ver M2: falta o IVA do solicitor) |
| Help to Buy (`HTB`, `htbFor`) | mínimo entre o valor digitado, €30.000 e 10% do preço; só primeira compra **e** imóvel novo (`newBuild`) **e** preço até `htbLimit` = menor entre €500.000 e empréstimoMáx ÷ 0,7 (a Revenue exige empréstimo de pelo menos 70% do preço; acima disso nem pegando o máximo dá). Se a pessoa usa tanta poupança que o empréstimo fica abaixo de 70%, a dica avisa para pegar 70% e guardar o resto | [Revenue: Help to Buy](https://www.revenue.ie/en/property/help-to-buy-incentive/index.aspx) (vale até 31/12/2029) |
| Sliders (`RANGES`) | taxa de 1% a 8% (passo 0,05); prazo de 5 a 35 anos | Faixa prática de mercado; evita prazo 0 (M3) |

Fórmulas:

```
renda          = salário + (conjunta ? salário2 : 0)
empréstimoMáx  = renda × múltiplo
próprios       = poupança + presente
fundos(P)      = próprios + htbFor(P)                    // o HTB depende do preço e do empréstimo máximo
custos(P)      = stampDuty(P, IVA) + 3.050
preçoPorCaixa  = maior P com fundos(P) ≥ 0,10 × P + custos(P)
preçoPorRenda  = maior P com P + custos(P) − fundos(P) ≤ empréstimoMáx   // poupança extra reduz o empréstimo
preçoMáximo    = min(preçoPorCaixa, preçoPorRenda)
```

Com faixas de imposto e o HTB dependendo do preço, não há fórmula fechada. `highestPrice(ok)` faz busca binária (precisão de 50 cêntimos): cada condição fica mais difícil conforme o preço sobe, exceto no degrau onde o HTB para (`htbLimit`), por isso a faixa acima dele é buscada separadamente e fica o maior resultado. Até €1m e sem imóvel novo, dá o mesmo que as fórmulas antigas `(fundos − 3.050) / 0,11` e `(empréstimoMáx + fundos − 3.050) / 1,01`.

```
entrada        = preço × 0,10
imposto        = stampDuty(preço, IVA)
caixaNecessário= entrada + imposto + taxas
poupançaExtra  = max(0, fundos − caixaNecessário)
empréstimo     = max(0, preço − entrada − poupançaExtra)
falta          = caixaNecessário − fundos           // > 0: falta dinheiro
excesso        = empréstimo − empréstimoMáx         // > 0: empréstimo acima do limite
prestação      = empréstimo × r / (1 − (1 + r)^−n),  r = taxa/12/100, n = prazo × 12
```

"Every extra €1,000 saved raises this by about X" é calculado de verdade: `calc()` com poupança + 1.000, menos o preço por caixa atual. Se o preço está preso no degrau do HTB (X seria €0), a nota diz quanto a mais de poupança (`savingsPastHtb`) é preciso para passar do degrau sem o HTB.

### 6.1 Calculadora e jornada

- "Save to my journey" (ou "Update my journey", se a etapa 1 já estiver feita **e** `calcSaved` for verdadeiro) grava `calcSaved: true`, marca a etapa com `data-auto="calculator"` (`preparation-0`), espera a cópia na nuvem e abre `journey.html#step-preparation-0` com o aviso "Your numbers are saved and step 1 is done."
- A jornada e o Dashboard leem os números do `localStorage` deste navegador, nunca da nuvem. Se a etapa 1 está feita mas `calcSaved` está vazio (marcada à mão antes desta versão, ou vinda de outro aparelho), a jornada pede para salvar a calculadora neste navegador e o Dashboard mostra "Not saved yet" em vez dos números de exemplo.
- Botão "Save to my journey": bloqueado durante o envio e liberado de novo no `pageshow` (voltar pelo navegador). Se a lista de etapas não carregou, fica desativado com "Could not load your journey. Reload the page to save."

Veredito (4 estados):

| Falta dinheiro? | Empréstimo acima do limite? | Título | Cor |
|---|---|---|---|
| Não | Não | This price is within your limits | verde (mint) |
| Sim | Não | You are €X short in cash | pêssego |
| Não | Sim | The mortgage is over your limit | pêssego |
| Sim | Sim | This price is out of reach for now | pêssego |

## 7. Contas e sincronização

- **Cliente:** `window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`, criado só se as duas constantes estiverem preenchidas.
- **`Account.ready`** fica `true` quando o Supabase responde se há alguém logado (primeiro evento, ou contas desligadas); `Account.whenReady` é a promessa desse momento. A biblioteca começa a baixar assim que `core/account.js` roda, e não depois da lista de etapas.
- **Antes da resposta** (`Account.saved`, `shown()`, `settled()`, `available()`): a sessão salva em `localStorage` (`sb-<projeto>-auth-token`) só é **lida**, para desenhar o cabeçalho, o Dashboard e o Perfil na hora. Nada é enviado com ela. O Supabase confere a sessão logo depois; se ela não valer mais, a página passa para "Sign in". Sair e salvar o nome esperam `Account.whenReady`. "Loading your account..." só aparece para quem chega por link de e-mail.
- **Operações** (`core/account.js`): `signUp(email, password, name)` (nome em `user_metadata.full_name`), `signIn`, `signInWithGoogle(next)`, `googleAvailable()`, `takeGoogleReturn()`, `signOut`, `sendReset`, `setPassword`, `updateProfile(name)` (grava `display_name` e `full_name`), `loadProgress`, `saveProgress`. Cadastro, redefinição e Google usam `homeUrl()` como endereço de retorno.
- **Entrar com Google** (`signInWithOAuth`, fluxo *implicit*, o padrão do `supabase-js@2`; o PKCE não é usado porque quebraria os links de e-mail abertos em outro aparelho):
  1. `googleAvailable()` lê `GET /auth/v1/settings` (configuração pública, com a chave publicável) e diz se o Google está ligado no painel. O botão aparece assim que as contas estão ligadas e só some se essa leitura disser que não.
  2. O clique grava em `sessionStorage` (`eirehome-google`) a página de destino (`next`, validada por `safeNext`) e a hora, e chama `signInWithOAuth({ provider: "google", options: { redirectTo: homeUrl(), queryParams: { prompt: "select_account" } } })`. O botão fica em "Opening Google..." até a página mudar e volta ao normal no `pageshow` (botão Voltar).
  3. Google → `https://<projeto>.supabase.co/auth/v1/callback` → `homeUrl()` com `#access_token=...`. `homeUrl()` é a pasta do site (`https://codebybrigido.github.io/EireHomeFlow/`), então as Redirect URLs só precisam do endereço base.
  4. Na Home, `AUTH_RETURN.token` (tem `access_token` ou `code`) e `takeGoogleReturn()` (existe e tem menos de 15 minutos) juntos disparam o aviso ("Welcome back, <nome>." ou, para conta nova, "Your account is ready. Welcome to ÉireHome Flow, <nome>!") e `location.replace(next)`, **antes** da sincronização do progresso, que a página seguinte faz ao abrir.
  5. Erro na volta (`?error=`/`#error=`, com `error_description`): se havia `eirehome-google`, aviso vermelho "Signing in with Google was cancelled..." (`access_denied`) ou "Signing in with Google did not work: <descrição>...", com o botão "Sign in" (volta para `signin.html?next=...`). Sem `eirehome-google`, continua o aviso de link de e-mail expirado.
- **Nome** (`lib/people.js`): `userName` prefere `display_name` (definido em My profile), depois `full_name` e `name`: o Google regrava `full_name` e `name` a cada login com Google. A foto que o Google manda (`avatar_url`, `picture`) fica no `user_metadata` do Supabase, mas o site não a mostra: o círculo do topo tem sempre as iniciais.
- **Apagar a conta** (`Account.deleteAccount()`, em My profile): chama `rpc("delete_my_account")`, a função do banco da seção 2.1 do `SETUP-CONTAS.md`, que apaga só a linha de `auth.users` de quem chama (`auth.uid()`). O `progress` vai junto (`ON DELETE CASCADE`), e as sessões e tokens de atualização também. Depois, `signOut({ scope: "local" })` limpa a sessão deste navegador, `done` é zerado e a pessoa vai à Home com o aviso. Se a função ainda não existir (erro `PGRST202`), a mensagem manda escrever para eirehomeflow@gmail.com. Nenhuma chave secreta é usada: a função roda com os direitos de quem a criou (`security definer`), e só `authenticated` pode chamá-la.
- **Segredos:** o Client ID e o Client Secret do Google ficam **só** no painel do Supabase (Authentication → Sign In / Providers → Google). O site só conhece `SUPABASE_URL` e a chave publicável.
- **Eventos** (`onAuthStateChange` → `onAccountChange`, sempre via `setTimeout`):

| Evento | Ação |
|---|---|
| `PASSWORD_RECOVERY` fora de `new-password.html` | Redireciona para `new-password.html` (a sessão fica no navegador) |
| `INITIAL_SESSION` com usuário, `SIGNED_IN`, `PASSWORD_RECOVERY` | Carrega o progresso da conta, soma com o local, marca a etapa com `data-auto="account"` (estar logado é o que ela pede) e grava o resultado. Se a leitura da nuvem falhar, marca a etapa de conta pelo menos no navegador |
| `SIGNED_OUT` | Limpa `done` e a etapa aberta |
| Qualquer evento com usuário, com `type=signup` no endereço de chegada | Aviso fixo de boas-vindas com "Go to my journey"; limpa o endereço |
| `USER_UPDATED` | Re-renderiza (iniciais e nome novos) |

- **Depois das ações das páginas de conta:** entrar guarda "Welcome back, <nome>." e vai para `next`; nova senha guarda "Your password has been changed." e vai para o Dashboard; sair (em Dashboard, Perfil ou Nova senha) guarda "You have signed out..." e vai para a Home.
- **Validação** (`FIELD_CHECKS` em `core/forms.js`; as regras ficam em `lib/validation.js`):
  - nome: pelo menos 2 palavras com 2+ letras (`\p{L}`) cada; espaços extras normalizados antes do envio;
  - e-mail: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`;
  - senha nova: `length ≥ 8`, `/\p{Lu}/u` e um símbolo da lista aceita pelo Supabase ``!@#$%^&*()_+-=[]{};'\:"|<>?,./`~``; senha atual: não vazia;
  - confirmação: não vazia e igual à senha.
  Campo inválido recebe `.is-invalid` e `aria-invalid="true"`; a mensagem vai para `#error-<campo>`. A checagem roda no envio (foco no primeiro inválido), no `focusout` de campo preenchido e a cada tecla num campo já marcado.

## 8. Segurança

- A chave em `config.js` é a **publishable/anon key**, feita para ficar pública. A proteção vem do Row Level Security (ver Backend Schema). **Nunca** colocar a chave `service_role`/`secret` no site.
- `esc()` escapa `& < > "` em tudo que vai para `innerHTML`; textos simples usam `textContent`.
- `?next=` só aceita nomes de página do próprio site, o que evita redirecionamento para fora.
- Traduções com HTML passam por uma lista de tags e atributos permitidos; links só para páginas do site, `mailto:` e `https:`. `?lang=` só aceita códigos da lista de idiomas.
- Sem cookies próprios e sem rastreadores. Requisições externas: jsDelivr (biblioteca) e Supabase.
- O GitHub Pages não permite cabeçalhos HTTP próprios; uma CSP por `<meta>` é possível no futuro.
- `@supabase/supabase-js@2` fixada na versão principal.

## 9. Compatibilidade

Recursos que exigem navegador atual: `:focus-visible`, `:where()`, `clamp()`, `display: contents`, regex com `\p{Lu}` e flag `u`, `DOMParser`, `history.replaceState`, `overscroll-behavior` e `text-wrap: pretty` (melhoria progressiva). Alvos: Chrome, Edge, Firefox e Safari atuais, em desktop, iOS e Android.

## 10. Performance

- A capa só carrega na Home, em WebP com `srcset`: o navegador escolhe 600px (55 KB), 900px (110 KB) ou 1200px (179 KB) conforme a tela; antes era um JPEG único de 298 KB. As 31 ilustrações das etapas são SVG (73,8 KB no total, ~2,4 KB cada), mais leves que WebP para desenhos chapados e nítidas em qualquer tela. As fontes são locais com `unicode-range` (o navegador baixa só o subconjunto latin, ~56 KB).
- Páginas que não são o guia buscam `guide.html` (~38 KB) para montar a lista de etapas; o navegador guarda em cache entre páginas.
- Traduções: cada página baixa só os namespaces que usa, do idioma dela e do inglês (reserva). Depois do carregamento, o resto do mesmo idioma é copiado para o `localStorage` (o maior arquivo, `guide.json`, tem ~40 KB). A versão dos textos vai no endereço de cada JSON, então um texto novo é baixado assim que publicado.
- Sem minificação; para esse tamanho, não compensa um processo de build.
- O GitHub Pages usa cache de 10 minutos, então um visitante pode receber uma página nova com um script antigo (ou o contrário). Três defesas:
  1. **Versão nos endereços:** as páginas carregam `css/styles.css?v=AAAAMMDD` e `js/pages/<página>.js?v=AAAAMMDD`, e todo `import` entre módulos também leva `?v=AAAAMMDD`. **Ao mudar qualquer CSS ou JS, rode `npm run bump`**, que troca o número em todos os arquivos de `docs/` pela data de hoje. Numa segunda mudança no mesmo dia, use `npm run bump -- AAAAMMDD` com um número novo (ex.: a data de amanhã). O `npm run check:versions` (também no GitHub Actions) falha se sobrar um número diferente ou um arquivo sem versão: um `import` sem `?v=` criaria uma segunda cópia do módulo, com estado separado.
  2. `guide.html` é buscado com `cache: "no-cache"`: o navegador sempre pergunta ao servidor se mudou. Cabeçalho e rodapé vêm dentro de cada página, então não há partial para ficar desatualizado.
  3. Os scripts de página toleram partes que faltam (ex.: `s.howto || []`, elementos ausentes) e `loadSteps` ainda aceita o atributo antigo `data-account`. As assinaturas de funções usadas por outras páginas continuam compatíveis (ex.: `signUp(email, password, name)`).

## 11. Ambientes

| Ambiente | Endereço | Como rodar |
|---|---|---|
| Local | `http://localhost:8000/` | `npm start` (Node 20.1+), ou `python -m http.server 8000 --directory docs` (no Windows, algumas instalações do Python enviam os `.js` com o tipo errado e os módulos não carregam; prefira `npm start`) |
| Produção | `https://codebybrigido.github.io/EireHomeFlow/` (GitHub Pages, branch `main`, pasta `/docs`) | Pull Request aceito na `main` do repositório `CodeByBrigido/EireHomeFlow` |
| Supabase | projeto `dyfxstpbzmihtmccaezs`, região eu-west-1 | Painel supabase.com |

Qualquer novo endereço base (produção, domínio próprio) precisa entrar em **Site URL** e **Redirect URLs** no Supabase.

## 12. Testes

Testes automáticos: `npm test` roda `tests/*.test.js` no Node, sem navegador: calculadora (os valores da seção 12.1), progresso, validação, formatação por idioma, o runtime de tradução, o validador de traduções, as ferramentas de versão, o blog (sorteio, semelhantes, cartões, verificação e página dos artigos), o `sitemap.xml` e o link do formulário de contato. `npm run check` roda lint, testes, versões, partials, artigos e traduções, igual ao GitHub Actions. O roteiro manual abaixo continua valendo para o que depende do navegador.

### 12.1 Calculadora (valores de referência)

Valores padrão: primeira compra, sozinho, salário 45.000, poupança 35.000, presente 0, HTB 0, preço 380.000, taxa 3,9%, prazo 30.

| Cenário | Preço máximo | Veredito | Outros |
|---|---|---|---|
| Padrão | €209,851 | This price is out of reach for now | Empréstimo máx. €180,000; caixa €44,850; empréstimo €342,000; prestação €1,613 |
| Presente 60.000 | €269,257 | (depende do preço) | |
| Preço 200.000 | €209,851 | This price is within your limits | Empréstimo €170,050 ("using all your savings") |
| Poupança 60.000, preço 300.000 | €234,604 | The mortgage is over your limit | Empréstimo €246,050 |
| Salário 120.000, poupança 20.000, preço 300.000 | €154,091 | You are €16,050 short in cash | |
| Padrão em "Moving home" | €187,574 | This price is out of reach for now | Múltiplo 3.5×; entrada €38,000 (10%) |
| Padrão em "New house" | €210,099 | This price is out of reach for now | Imposto €3,348 (sobre €380.000 ÷ 1,135); caixa €44,398 |
| Padrão em "New apartment" | €210,023 | This price is out of reach for now | Imposto €3,486 (sobre €380.000 ÷ 1,09) |
| "New house" com HTB 30.000 | €233,217 | This price is out of reach for now | O HTB para em €257,143 (€180.000 ÷ 0,7): conta no preço máximo, mas não nos €380.000 (fundos €35,000; empréstimo €342,000) |
| "New house", HTB 30.000, poupança 100.000 | €274,531 | The mortgage is over your limit | Acima de €257,143 não há HTB; sem ele, o limite é a renda |
| "New house", HTB 30.000, conjunta | €390,509 | This price is within your limits | Empréstimo máx. €332,000; HTB €30,000; empréstimo €321,398; prestação €1,516 |
| "New house", HTB 30.000, conjunta, salários 60.000 + 60.000, poupança 45.000 | €500,000 | This price is within your limits | Preso no teto do HTB; a nota pede €12,455 a mais de poupança para passar dele sem HTB |
| Preço 1.200.000 | €209,851 | This price is out of reach for now | Imposto €14,000 (1% até €1m + 2% sobre €200.000); rótulo "1% and 2% bands" |

Imposto de um imóvel novo de €400.000: €3,524.23 numa casa (o exemplo da própria Revenue) e €3,669.72 num apartamento.

Os números desta tabela estão em `tests/calculator.test.js`. Ao mudar uma regra, atualize a tabela e o teste no mesmo trabalho.

Em outro idioma, os números são os mesmos, só com o formato local: o padrão dá €209,851 em inglês, € 209.851 em português, 209.851 € em alemão e 209 851 € em francês. Os textos citados acima são os do inglês.

### 12.2 Páginas e navegação
- As 14 páginas e os 20 artigos abrem sem erro no console, cada um com seu título (nos artigos, nenhum link do topo fica marcado).
- O botão Voltar do navegador leva à página anterior.
- `journey.html#step-aip-0` abre a etapa; recarregar mantém a etapa aberta.
- Cartão de fase na Home leva a `journey.html#phase-<slug>`; "Open in my journey" no guia leva à etapa.

### 12.3 Jornada e conta
- Primeira visita: só "Calculate my buying power" está como atual.
- Etapa bloqueada: texto visível, "Complete" desativado, nota com a etapa que falta.
- Etapa 1 sem salvar: botão "Open the calculator", sem "Complete step". Na calculadora, "Save to my journey" volta à etapa 1 marcada, com "Your numbers"; as etapas 2, 3 e 5 mostram depósito, custos extras e Help to Buy da pessoa.
- Calculadora: trocar "Buying alone"/"Joint application" e "Second-hand"/"New build" não muda a posição de nenhum campo; o campo que não se aplica fica desativado com o motivo ("Joint applications only", "New builds only", "First-time buyers only") e volta com o valor digitado.
- Etapa de conta sem login: "Create account or sign in" leva a `signup.html?next=journey.html#step-preparation-5`. Ao entrar, a etapa aparece feita sem clicar em nada.
- Cadastro com tudo vazio: 4 campos vermelhos, foco em "Full name". "Rodrigo" e "rodrigo@gmail" ficam vermelhos; "Rodrigo Brigido" e "rodrigo@gmail.com" passam. Senha "abcdefgh" mostra "One capital letter" e "One special character" em vermelho. Confirmação diferente: "The passwords do not match."
- Link de confirmação: a Home mostra "Your email is confirmed. Welcome..." com "Go to my journey"; o topo mostra as iniciais.
- Link expirado: aviso vermelho "This link has expired or has already been used...".
- Menu da conta: abre, fecha com Esc e com clique fora; no celular abre na largura da tela.
- Perfil: nome preenchido; salvar atualiza as iniciais e mostra "Your profile has been updated."
- "Forgot your password?" → e-mail → link → `new-password.html` → nova senha → Dashboard com "Your password has been changed."
- Outro navegador com a mesma conta: o progresso aparece.
- "Sign out" no Perfil: volta à Home com "You have signed out..." e sem progresso local.

### 12.4 Idiomas
- Primeira visita (sem escolha salva): o site abre no idioma do navegador, se estiver completo; senão, em inglês. Nada é gravado em `eirehome-locale`.
- Menu de idiomas: abre pelo teclado e fecha com Esc e com clique fora; no celular abre na largura da tela; em 320×480 os 9 idiomas cabem rolando dentro do menu; escolher um idioma recarrega a página nele, e ele continua nas páginas seguintes.
- `?lang=pt` abre em português só nesta aba; a escolha salva continua a mesma. Um idioma em rascunho aberto com `?lang=` mostra o que já foi traduzido e o resto em inglês, e não aparece no menu.
- Em cada idioma completo: nenhuma frase em inglês fora das páginas legais e dos nomes oficiais; a calculadora dá os valores da seção 12.1; mensagens de validação, avisos e erros no idioma.
- Cabeçalho em 2 linhas até 880px e em 1 linha acima disso, em todos os idiomas, sem rolagem horizontal.
- Páginas legais: fora do inglês, o aviso "texto integral só em inglês" aparece; em inglês, não.
- Blog: em qualquer idioma, a seção do blog na Home e os artigos ficam em inglês; o resto da Home, o cabeçalho e o rodapé seguem o idioma.

### 12.5 Layout e acessibilidade
- Sem rolagem horizontal em 320, 375, 768, 1024 e 1440 px em todas as páginas.
- Navegação completa só com teclado.
- Com "reduzir movimento" ligado, o ticker fica parado, o nó atual não pula e o slideshow do blog não passa sozinho e troca de artigo sem deslizar.

### 12.6 Blog
- Home: 4 slides, 3 artigos ao lado e 13 abaixo, todos diferentes, e outra ordem a cada visita. Anterior, próximo e os pontos trocam o slide (do último volta ao primeiro) e, depois disso, ele não passa mais sozinho; não há botão de pausa. "Show more articles" mostra 6 por vez, leva o foco ao primeiro novo e some no fim.
- Artigo: imagem, categoria, título, abertura, tempo de leitura, texto, caixa "In My journey" (o botão abre a etapa em `journey.html#step-<id>`, com o painel aberto) e 3 artigos semelhantes da mesma categoria. Os links do topo levam às páginas certas a partir de `blog/`.
- Em 375px, uma coluna, sem rolagem horizontal; tabelas largas rolam dentro da própria caixa.

### 12.7 Contato e mapa do site
- Rodapé de qualquer página (artigos inclusive): Contact us, Sitemap, Privacy Policy e Terms of Use, no idioma da página.
- Contato com tudo vazio: nome, e-mail e mensagem ficam vermelhos, com foco no nome; ao corrigir, o vermelho some. Enviar abre o aplicativo de e-mail com o assunto "ÉireHome Flow: <assunto>" e mostra "Your email app should now be open...". Logado, nome e e-mail já vêm preenchidos.
- Mapa do site: 6 fases e 31 etapas no idioma da página (cada link abre a etapa na jornada) e os 20 artigos em inglês, por categoria. Em 375px, uma coluna, sem rolagem horizontal.
