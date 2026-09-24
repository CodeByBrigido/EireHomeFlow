# TRD: Technical Requirements Document

Produto: ÉireHome Flow · Versão do documento: 1.3 · Última revisão: 24/09/2026

## 1. Arquitetura

```
 Navegador do usuário
 ┌──────────────────────────────────────────────────────────────┐
 │ 12 páginas .html (uma por lugar do site)                      │
 │   cada uma: <body data-page="...">                            │
 │   partials/header.html e footer.html (fetch)                  │
 │   css/styles.css                                              │
 │   js/config.js → js/account.js → js/app.js → js/pages/<pg>.js │
 │   conteúdo das etapas: guide.html (lido por fetch + DOMParser)│
 │   localStorage "eirehome-flow" · sessionStorage "eirehome-flash"│
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
- **Sem build, sem framework.** HTML, CSS e JavaScript puros, scripts clássicos com `defer`.
- **Sem servidor próprio.** A lógica roda no navegador; o Supabase cuida de login e do progresso na nuvem.

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
│   ├── privacy.html · terms.html   ← Privacy Policy e Terms of Use
│   ├── partials/header.html       ← marca, navegação, "★ N XP", Sign in / círculo e menu da conta
│   ├── partials/footer.html       ← rodapé, links legais e caixa de avisos (toast)
│   ├── css/styles.css
│   ├── js/config.js               ← SUPABASE_URL e SUPABASE_ANON_KEY (chave publicável)
│   ├── js/account.js              ← objeto Account: login, cadastro, senha, perfil, progresso na nuvem
│   ├── js/app.js                  ← núcleo compartilhado (ver seção 4)
│   ├── js/pages/home.js           ← ticker, cartões de fase, botão Start/Resume
│   ├── js/pages/journey.js        ← trilha, painel, ações da jornada, endereços #step/#phase
│   ├── js/pages/calculator.js     ← formulário e resultados da calculadora
│   ├── js/pages/dashboard.js      ← painel logado
│   ├── js/pages/profile.js        ← formulário do perfil
│   ├── js/pages/auth.js           ← as 4 páginas de conta
│   ├── js/pages/legal.js          ← índice "On this page" das páginas legais
│   ├── img/hero-600.webp · hero-900.webp · hero-1200.webp  ← capa em WebP (srcset)
│   ├── img/steps/<id>.svg         ← uma ilustração por etapa (31), referenciada no guide.html
│   ├── img/brand/eirehome-flow-logo.png  ← logo dos e-mails, servida pelo GitHub Pages
│   └── fonts/*.woff2
├── supabase/email-templates/      ← e-mails de confirmação e de nova senha
├── specs/                         ← estes documentos, AUDITORIA.md e SETUP-CONTAS.md
├── _original-Backup/              ← bundle original do Claude Design
├── README.md  ·  .gitignore  ·  .gitattributes (LF para todos)
```

Cada página inclui `config.js`, `account.js`, `app.js` e, se precisar, o seu script de `js/pages/`. O `guide.html` não tem script próprio.

## 3. Ciclo de carregamento

1. O HTML da página chega com o seu conteúdo estático.
2. Os scripts rodam em ordem (`defer`); o `app.js` espera o `DOMContentLoaded`, que só dispara depois do script da página.
3. `init()` em `app.js`:
   1. `loadSaved()` restaura progresso e calculadora do `localStorage`;
   2. em paralelo, `loadPartials()` troca os `<div data-include>` por `header.html` e `footer.html`, e `loadSteps()` monta `PHASES` e `steps` a partir de `guide.html` (buscado com `fetch` e lido com `DOMParser`; no próprio `guide.html`, usa o documento atual);
   3. `initPage()` da página, se existir;
   4. `render()`;
   5. mostra o aviso guardado na página anterior (`sessionStorage`) e, se o endereço trouxer erro de link de e-mail, o aviso vermelho;
   6. `Account.init(onAccountChange)`.

**Consequência:** o site precisa ser servido por HTTP. Abrindo um `.html` direto do disco (`file://`), os `fetch` falham e cabeçalho, rodapé e etapas não aparecem.

## 4. Núcleo compartilhado (`app.js`)

| Parte | O que faz |
|---|---|
| Estado | `state = { done, open, ftb, joint, newBuild, apartment, salary, salary2, savings, gift, htb, price, rate, term, calcSaved }`. `apartment` só vale com `newBuild` (IVA de 9% em vez de 13,5%). `calcSaved` vira `true` quando a pessoa salva a calculadora na jornada: só depois disso os números aparecem como dela |
| Persistência | `loadSaved` (também traz taxa e prazo para dentro de `RANGES`: 1-8% e 5-35 anos), `save` (chave `eirehome-flow`), `setState`, `setDone` (também grava na nuvem se logado e devolve essa promessa) |
| Etapas | `loadSteps` (texto, checklist, dica, tempo, custo, tipo, `auto`, `numbers`, passo a passo, links externos e ilustração com alt de cada etapa), `progress()`, `stepLink(step)`, `calculatorStep()`, `phaseCardsHtml()` (Home e Dashboard) |
| Cálculo | `calc(s = state)` (Calculadora, Jornada e Dashboard), `homeVat(s)`, `stampBase(price, vat)`, `stampDuty(price, vat)`, `stampBands(base)`, `htbCap(price)`, `htbLimit(maxLoan)`, `htbFor(s, price, maxLoan)`, `highestPrice(ok, split)` |
| Cabeçalho | `renderHeader`: link ativo por `data-page`, XP, "Sign in" ou círculo com iniciais |
| Área logada | `renderGate()`: mostra `#gate` ou `#signed-in` conforme o login |
| Menu da conta | `setMenu(open)`, fecha com clique fora e Esc |
| Avisos | `showToast(msg, { error, action: { label, href }, sticky })`, `hideToast`, `flash` (para a próxima página), `showFlash` |
| Formulários | `FIELD_CHECKS`, `checkField`, `checkForm`, `markField`, `watchForm`, `renderPasswordRules`, `sayInForm` |
| Retorno de e-mail | `AUTH_RETURN` lê `type` e `error_code` do endereço antes do Supabase limpar; `cleanAuthUrl()` |
| Nomes | `userName`, `firstName`, `initials` ("Rodrigo Andrade Brigido" vira "RB") |
| Eventos | `actions` (registro de ações), um `click`, um `input` e um `keydown` no `document`; `onAccountChange` |
| Segurança | `esc()` em todo texto que vai para `innerHTML`; `safeNext()` aceita só `nome-de-pagina.html` com `#ancora` opcional |

Os scripts de página definem `initPage()` e/ou `renderPage(p)` e acrescentam entradas em `actions`.

### 4.1 Convenções do HTML

| Atributo | Função |
|---|---|
| `<body data-page="...">` | Identifica a página (home, guide, journey, calculator, dashboard, profile, signin, signup, forgot-password, new-password, privacy, terms) |
| `data-page` nos links do topo | Marca o link ativo |
| `data-action="<nome>"` | Executa `actions[nome](elemento)` |
| `data-id` | Id da etapa nos nós da trilha (`data-action="open"`) |
| `data-field="<campo>"` | Campo da calculadora ligado ao `state` |
| `data-bind="<nome>"` | Recebe texto via `bind(nome, valor)` |
| `data-include="<caminho>"` | Substituído pelo HTML do partial |
| `data-fields="name email ..."` num `<form>` | Campos a validar |
| `data-password="new\|current"` num `<form>` | Senha nova (regras de força) ou atual (só não vazia) |
| `data-keep-next` num link | Mantém o `?next=` ao trocar entre sign-in e sign-up |
| `data-auto="calculator\|account"` num `.guide-step` | O site marca a etapa sozinho: ao salvar a calculadora na jornada, ou ao entrar na conta. A etapa não tem botão "Complete step" |
| `data-numbers="calculator\|deposit\|costs\|htb"` num `.guide-step` | Quais números da calculadora a jornada mostra nessa etapa (caixa "Your numbers") |
| `.guide-step__howto-label` + `ol.guide-step__howto` | Passo a passo numerado da etapa (ex.: "How to apply" no Help to Buy) |
| `.guide-step__links a` | Links externos da etapa; a jornada mostra só os `https://`, abrindo em nova aba |

## 5. Endereços

- `journey.html#step-<id>` abre a etapa; `journey.html#phase-<slug>` rola até a fase. Abrir ou fechar uma etapa atualiza o endereço com `history.replaceState`.
- `guide.html#step-<id>` e `guide.html#guide-<slug>` são âncoras do guia.
- Páginas de conta aceitam `?next=`, validado por `safeNext`. Padrão: `dashboard.html`.
- Links dos e-mails voltam sempre para a Home (`Account.homeUrl()`, a pasta do site), então as Redirect URLs do Supabase só precisam do endereço base.

## 6. Especificação da calculadora

Constantes (no topo da seção de cálculo em `app.js`):

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

- **Cliente:** `supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`, criado só se as duas constantes estiverem preenchidas.
- **`Account.ready`** fica `true` quando já se sabe se há alguém logado (primeiro evento do Supabase, ou contas desligadas). Até lá, as páginas logadas mostram "Loading your account...".
- **Operações** (`account.js`): `signUp(email, password, name)` (nome em `user_metadata.full_name`), `signIn`, `signOut`, `sendReset`, `setPassword`, `updateProfile(name)`, `loadProgress`, `saveProgress`. Cadastro e redefinição usam `homeUrl()` como endereço de retorno.
- **Eventos** (`onAuthStateChange` → `onAccountChange`, sempre via `setTimeout`):

| Evento | Ação |
|---|---|
| `PASSWORD_RECOVERY` fora de `new-password.html` | Redireciona para `new-password.html` (a sessão fica no navegador) |
| `INITIAL_SESSION` com usuário, `SIGNED_IN`, `PASSWORD_RECOVERY` | Carrega o progresso da conta, soma com o local, marca a etapa com `data-auto="account"` (estar logado é o que ela pede) e grava o resultado. Se a leitura da nuvem falhar, marca a etapa de conta pelo menos no navegador |
| `SIGNED_OUT` | Limpa `done` e a etapa aberta |
| Qualquer evento com usuário, com `type=signup` no endereço de chegada | Aviso fixo de boas-vindas com "Go to my journey"; limpa o endereço |
| `USER_UPDATED` | Re-renderiza (iniciais e nome novos) |

- **Depois das ações das páginas de conta:** entrar guarda "Welcome back, <nome>." e vai para `next`; nova senha guarda "Your password has been changed." e vai para o Dashboard; sair (em Dashboard, Perfil ou Nova senha) guarda "You have signed out..." e vai para a Home.
- **Validação** (`FIELD_CHECKS`):
  - nome: pelo menos 2 palavras com 2+ letras (`\p{L}`) cada; espaços extras normalizados antes do envio;
  - e-mail: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`;
  - senha nova: `length ≥ 8`, `/\p{Lu}/u` e um símbolo da lista aceita pelo Supabase ``!@#$%^&*()_+-=[]{};'\:"|<>?,./`~``; senha atual: não vazia;
  - confirmação: não vazia e igual à senha.
  Campo inválido recebe `.is-invalid` e `aria-invalid="true"`; a mensagem vai para `#error-<campo>`. A checagem roda no envio (foco no primeiro inválido), no `focusout` de campo preenchido e a cada tecla num campo já marcado.

## 8. Segurança

- A chave em `config.js` é a **publishable/anon key**, feita para ficar pública. A proteção vem do Row Level Security (ver Backend Schema). **Nunca** colocar a chave `service_role`/`secret` no site.
- `esc()` escapa `& < > "` em tudo que vai para `innerHTML`; textos simples usam `textContent`.
- `?next=` só aceita nomes de página do próprio site, o que evita redirecionamento para fora.
- Sem cookies próprios e sem rastreadores. Requisições externas: jsDelivr (biblioteca) e Supabase.
- O GitHub Pages não permite cabeçalhos HTTP próprios; uma CSP por `<meta>` é possível no futuro.
- `@supabase/supabase-js@2` fixada na versão principal.

## 9. Compatibilidade

Recursos que exigem navegador atual: `:focus-visible`, `:where()`, `clamp()`, `display: contents`, regex com `\p{Lu}` e flag `u`, `DOMParser`, `history.replaceState`, `overscroll-behavior` e `text-wrap: pretty` (melhoria progressiva). Alvos: Chrome, Edge, Firefox e Safari atuais, em desktop, iOS e Android.

## 10. Performance

- A capa só carrega na Home, em WebP com `srcset`: o navegador escolhe 600px (55 KB), 900px (110 KB) ou 1200px (179 KB) conforme a tela; antes era um JPEG único de 298 KB. As 31 ilustrações das etapas são SVG (73,8 KB no total, ~2,4 KB cada), mais leves que WebP para desenhos chapados e nítidas em qualquer tela. As fontes são locais com `unicode-range` (o navegador baixa só o subconjunto latin, ~56 KB).
- Páginas que não são o guia buscam `guide.html` (~38 KB) para montar a lista de etapas; o navegador guarda em cache entre páginas.
- Sem minificação; para esse tamanho, não compensa um processo de build.
- O GitHub Pages usa cache de 10 minutos, então um visitante pode receber uma página nova com um script antigo (ou o contrário). Três defesas:
  1. **Versão nos endereços:** todas as páginas carregam `css/styles.css?v=AAAAMMDD` e `js/...js?v=AAAAMMDD`. Página nova sempre busca scripts novos. **Ao mudar qualquer CSS ou JS, troque o número em todas as páginas** (buscar e substituir `?v=` antigo pelo novo).
  2. `guide.html` e os partials são buscados com `cache: "no-cache"`: o navegador sempre pergunta ao servidor se mudaram.
  3. Os scripts de página toleram partes que faltam (ex.: `s.howto || []`, elementos ausentes) e `loadSteps` ainda aceita o atributo antigo `data-account`. As assinaturas de funções usadas por outras páginas continuam compatíveis (ex.: `signUp(email, password, name)`).

## 11. Ambientes

| Ambiente | Endereço | Como rodar |
|---|---|---|
| Local | `http://localhost:8000/` | `python -m http.server 8000 --directory docs` |
| Produção | `https://codebybrigido.github.io/EireHomeFlow/` (GitHub Pages, branch `main`, pasta `/docs`) | Pull Request aceito na `main` do repositório `CodeByBrigido/EireHomeFlow` |
| Supabase | projeto `dyfxstpbzmihtmccaezs`, região eu-west-1 | Painel supabase.com |

Qualquer novo endereço base (produção, domínio próprio) precisa entrar em **Site URL** e **Redirect URLs** no Supabase.

## 12. Testes

Ainda não há testes automatizados (ver Implementation Plan). Antes de publicar, rode este roteiro manual.

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

### 12.2 Páginas e navegação
- As 12 páginas abrem sem erro no console, cada uma com seu título e com o link certo marcado no topo.
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

### 12.4 Layout e acessibilidade
- Sem rolagem horizontal em 320, 375, 768, 1024 e 1440 px em todas as páginas.
- Navegação completa só com teclado.
- Com "reduzir movimento" ligado, o ticker fica parado e o nó atual não pula.
