# UI/UX Design

Produto: ÉireHome Flow · Versão do documento: 1.3 · Última revisão: 24/09/2026

Complementa o [Design System](07-Design-System.md), que define cores, tipos e componentes. Este documento define **o que cada página mostra, em que estado e com quais palavras**.

## 1. Princípios

1. **Ler antes de fazer.** Todo o conteúdo pode ser lido sem conta e sem ter "chegado" na etapa. O bloqueio vale só para concluir.
2. **Números honestos.** A calculadora mostra o limite real e diz com clareza o que bloqueia a compra: dinheiro, empréstimo ou os dois.
3. **Um próximo passo sempre visível.** "Start here", "Next up" e a etapa atual destacada.
4. **Progresso que motiva sem enganar.** XP e anel de progresso reforçam a sensação de avanço; nada promete aprovação de crédito.
5. **Escrito para quem não é nativo.** Frases curtas, termos locais explicados, sem gíria.
6. **Calmo e acolhedor.** Cores quentes, cantos arredondados, botões com "profundidade" (sombra sólida embaixo).
7. **Cada lugar é uma página.** Todo clique que leva a outro lugar abre um `.html` próprio, com endereço e título próprios. O botão Voltar do navegador sempre funciona.

## 2. Tom de voz e regras de texto

- **Idioma:** inglês britânico e irlandês (`en-IE`): *organise, savings, solicitor, flat, estate agent*.
- **Maiúsculas:** sentence case em títulos e botões ("Start my journey", não "Start My Journey"). Exceções: nomes próprios e termos oficiais (Approval in Principle, Sale Agreed, Help to Buy, Local Property Tax).
- **Números:** euro antes do valor e vírgula de milhar (€380,000). Faixas com hífen simples (€2,000-3,000; 1-2 weeks). Aproximação com "about" no texto e "~" nas tabelas.
- **Proibido** (marcas de texto gerado por IA):
  - travessão (—), meia-risca (–) e "≈";
  - ganchos do tipo "nobody tells you", "nobody warns you about", "the part nobody budgets for";
  - antíteses de efeito ("X, not Y") quando não acrescentam informação;
  - frase-soco curta no fim ("This happens often.", "Home.");
  - pares simétricos decorativos ("Your income sets the ceiling, your cash sets the floor");
  - excesso de ponto e vírgula.
- **Permitido:** o sinal × em "4×" e os ícones da interface (★ ◆ ✓ 🔒 🔑 ⏱ ← →, e o separador ·).
- **Sem prometer resultado:** use "estimate", "about", "roughly". Nunca "you will be approved".

## 3. Mapa de páginas

| Página | Arquivo | Título da aba | Como chegar |
|---|---|---|---|
| Home | `index.html` | ÉireHome Flow | "Home" e marca no topo |
| Guia completo | `guide.html` | The full guide \| ÉireHome Flow | "Guide" no topo, "Open the guide" na Home |
| Jornada | `journey.html` | My journey \| ÉireHome Flow | "My journey" no topo, "Start/Resume my journey", cartões de fase, "Open in my journey" no guia |
| Calculadora | `calculator.html` | Buying power calculator \| ÉireHome Flow | "Calculator" no topo, "Buying power calculator" |
| Dashboard | `dashboard.html` | Dashboard \| ÉireHome Flow | Menu da conta |
| Meu perfil | `profile.html` | My profile \| ÉireHome Flow | Menu da conta, Dashboard |
| Entrar | `signin.html` | Sign in \| ÉireHome Flow | "Sign in" no topo |
| Criar conta | `signup.html` | Create your account \| ÉireHome Flow | Etapa de conta, "Create an account" |
| Esqueci a senha | `forgot-password.html` | Reset your password \| ÉireHome Flow | "Forgot your password?" |
| Nova senha | `new-password.html` | Choose a new password \| ÉireHome Flow | Link do e-mail de senha, "Change password" em My profile |
| Política de privacidade | `privacy.html` | Privacy Policy \| ÉireHome Flow | Rodapé, cadastro, páginas de conta, My profile |
| Termos de uso | `terms.html` | Terms of Use \| ÉireHome Flow | Rodapé, cadastro |

**Endereços profundos da jornada:** `journey.html#step-<id>` abre a etapa no painel; `journey.html#phase-<slug>` rola até a fase. O endereço acompanha a etapa aberta.

**Retorno depois de entrar:** as páginas de conta aceitam `?next=<página>`, por exemplo `signup.html?next=journey.html#step-preparation-5`. Sem `next`, quem entra vai para o Dashboard.

## 4. Elementos compartilhados

### 4.1 Cabeçalho (`partials/header.html`)
- Verde (`--ink`), fixo no topo. A marca "ÉireHome **Flow**" é um link para a Home.
- Links: Home, Guide, My journey, Calculator. O link da página atual fica creme com sublinhado dourado e `aria-current="page"`.
- Indicador único **"★ N XP"** em amarelo (`#ffd79a`), escondido no celular. Os dias de "streak" não aparecem no topo.
- **Deslogado:** link "Sign in".
- **Logado:** círculo dourado com as iniciais do primeiro e do último nome ("Rodrigo Andrade Brigido" vira **RB**; sem nome, a inicial do e-mail). O clique abre o **menu da conta**:
  - nome e e-mail;
  - Dashboard · My profile · **Sign out** (em vermelho). A troca de senha não fica no menu: só em My profile.
  - Fecha ao clicar fora, com Esc (o foco volta ao círculo) ou ao escolher uma opção. No celular, abre na largura da tela, logo abaixo do cabeçalho.

### 4.2 Rodapé e avisos (`partials/footer.html`)
- Rodapé areia com "ÉireHome Flow, Dublin", "Educational content. Not regulated financial advice." e os links **Privacy Policy** e **Terms of Use**.
- **Aviso (toast):** caixa no rodapé da tela, verde (sucesso) ou vermelha (erro), com ícone, texto, botão de ação opcional e "×". Some sozinho em 7 segundos, exceto os avisos marcados como fixos.

| Situação | Texto | Tipo |
|---|---|---|
| Voltou pelo link de confirmação | "Your email is confirmed. Welcome to ÉireHome Flow, Rodrigo!" + botão "Go to my journey" | Sucesso, fixo |
| Link do e-mail expirado ou já usado | "This link has expired or has already been used. Sign in, or ask for a new link." | Erro, fixo |
| Entrou | "Welcome back, Rodrigo." | Sucesso |
| Conta criada sem exigir confirmação | "Your account is ready. Welcome to ÉireHome Flow!" | Sucesso |
| Saiu | "You have signed out. Your progress is saved in your account." | Sucesso |
| Perfil salvo | "Your profile has been updated." | Sucesso |
| Senha trocada | "Your password has been changed." | Sucesso |

Avisos que acontecem logo antes de uma troca de página (entrar, sair, trocar senha) aparecem na página seguinte.

## 5. Páginas

### 5.1 Home (`index.html`)
1. **Hero:** eyebrow "For first-time buyers in Ireland", título "From first savings to your *first sofa*.", texto de apoio, botão principal ("Start my journey" ou "Resume my journey") e botão secundário ("Buying power calculator"). Ilustração com legenda.
2. **Ticker:** faixa verde com 6 fatos em rolagem contínua; "Pause"/"Play".
3. **Números-chave:** 3 cartões (4×, 10%, €3,550).
4. **Seis fases:** cartões com número, título, resumo, barra e "N of M steps done"; cada um leva a `journey.html#phase-<slug>`.
5. **Convite ao guia:** faixa areia "Read the full guide" com o botão "Open the guide".

### 5.2 Guia completo (`guide.html`)
- Eyebrow "The full guide", título "Every step, in detail", introdução com link para My journey.
- Um acordeão por fase. Cada etapa mostra, à esquerda, título, "Blocking/Optional step · ⏱ tempo · custo", texto, checklist, passo a passo numerado e links externos quando a etapa tem (ex.: "How to apply" e os links da Revenue no Help to Buy), "Worth knowing" e o link **"Open in my journey"** (`journey.html#step-<id>`); a etapa 1 também tem **"Open the calculator"**. À direita, a ilustração da etapa (no celular, acima do título).
- É a **fonte única do conteúdo** das etapas (ver TRD).

### 5.3 Jornada (`journey.html`)
**Desktop (>960px), sem etapa aberta:** trilha à esquerda e barra lateral de 300px à direita (anel de %, Streak, Earned, "Next up" com "Open this step", "Reset progress"). No fim da trilha, o selo 🔑.

**Com etapa aberta (modo compacto):** trilha estreita à esquerda e painel de detalhe à direita, fixo ao rolar. **Duas rolagens:** a trilha rola com a página e o painel tem rolagem própria, nunca mais alto que a tela. Os botões (Complete step, Previous, Next) ficam presos no rodapé do painel e estão sempre visíveis. No tablet e no celular (≤960px), o painel ocupa a tela inteira, com "Close".

**Espaçamento compacto:** uma etapa comum (ilustração, texto, 3 itens e dica) mede cerca de 810px no painel, contra 950px antes. Ela cabe sem rolar a partir de uns 910px de altura útil de janela. Etapas com números da pessoa ou passo a passo (Help to Buy) são mais longas e rolam no painel.

**Estados de um nó:**

| Estado | Visual | Ícone | Leitor de tela |
|---|---|---|---|
| Atual | Verde, anel verde claro, pulando; balão "Start here" | ★ | "Step N of 31: título, current step" |
| Disponível (obrigatória) | Verde | ★ | "Step N of 31: título" |
| Disponível (opcional) | Verde; balão "Optional" | ◆ | "..., optional" |
| Feita | Terracota; título riscado | ✓ | "..., completed" |
| Bloqueada | Bege, texto marrom | 🔒 | "..., locked" |
| Aberta | Contorno terracota | (do estado) | |

**Painel da etapa:** fase, "Step N of 31", título, chips, **ilustração da etapa** (até 300px, cantos arredondados, **centralizada** no painel), texto, **"Your numbers"** (quando a etapa tem `data-numbers`), checklist, **passo a passo** e **links externos** (quando a etapa tem), dica, nota e ações.

**"Your numbers"** (caixa verde-menta) só mostra números depois que a pessoa salvou a calculadora na jornada; antes disso, diz "Save your numbers in the calculator (step 1) to see your own figures here."

| Etapa | O que a caixa mostra |
|---|---|
| 1. Calculate my buying power | Preço máximo, empréstimo máximo, fundos e a prestação no preço-alvo |
| 2. Confirm the 10% deposit | 10% do preço-alvo, poupança e presente, Help to Buy (se houver) e se os fundos cobrem a entrada |
| 3. Set aside cash for the extra costs | Imposto de selo, solicitor, vistoria, avaliação e o total além da entrada; aviso quando o imposto é sobre o preço sem IVA |
| 5. Check Help to Buy eligibility | Quanto a pessoa pode receber no preço-alvo, ou por que não se aplica (mudança, imóvel usado, preço acima de €500.000, empréstimo abaixo de 70%) |

**Etapas automáticas** (`data-auto`): o site marca sozinho e não mostra "Complete step".

| Situação | Nota | Botão principal |
|---|---|---|
| Disponível | (nenhuma) | "Complete step +25 XP" |
| Feita | (nenhuma) | "Mark as not done" |
| Bloqueada | "You can read this step now. You can complete it once you finish "X"." | desativado |
| Etapa 1, calculadora não salva | "This step is ticked for you when you choose Save to my journey in the calculator." | "Open the calculator" |
| Etapa 1 feita, mas sem os números neste navegador | (nenhuma; "Your numbers" diz "Your figures are not saved in this browser yet. Open the calculator and choose Save to my journey to see them here.") | "Change my numbers" (contorno) |
| Etapa 1, feita | (nenhuma; "Your numbers" aparece) | "Change my numbers" (contorno) |
| Etapa de conta, ainda carregando | "Checking your account..." | (nenhum) |
| Etapa de conta, sem login | "This step is ticked for you as soon as you sign in." | "Create account or sign in" (vai para `signup.html?next=...`) |
| Etapa de conta, com login | "You are signed in as <e-mail>, so this step is done." (enquanto a marcação chega: "...This step is being ticked for you.") | (nenhum) |
| Etapa de conta, contas desligadas | "Accounts are not switched on yet, so this step cannot be completed." | (nenhum) |

Links externos (ex.: Revenue no Help to Buy) abrem em nova aba, com "↗" e o aviso "(opens in a new tab)" para leitores de tela.

"← Previous" e "Next →" percorrem todas as 31 etapas.

### 5.4 Calculadora (`calculator.html`)
- Eyebrow "Phase 01: Preparation · Step 1", título "What you can actually buy". A introdução termina com "Save them to your journey to complete step 1."
- **Coluna da esquerda:** o formulário e, logo abaixo dele, a **prestação mensal**, para ver o efeito dos sliders sem rolar.
- **Formulário:** First-time buyer / Moving home; Buying alone / Joint application; **Second-hand / New house / New apartment** (três pílulas; no celular estreito o texto quebra em duas linhas); 6 campos em 3 linhas; dica do Help to Buy; **sliders** de taxa (1% a 8%, passo 0,05, valor "3.90%" ao lado do rótulo) e prazo (5 a 35 anos, "30 years"). O valor ao lado do rótulo é só visual (`aria-hidden`); o leitor de tela ouve o `aria-valuetext` do próprio slider, uma vez.
- **Campos que não se aplicam não saem do lugar:** ficam desativados (fundo areia, borda tracejada) com o motivo no lugar do número: "Joint applications only" (salário do parceiro), "First-time buyers only" ou "New builds only" (Help to Buy). Ao reativar, o valor digitado volta.
- **Dica do Help to Buy** conforme o caso: só primeira compra; só imóvel novo; acima de €500.000; 70% do preço acima do empréstimo máximo (não conta); ou o máximo no preço, com aviso para pegar pelo menos 70% de empréstimo se a pessoa estiver usando poupança demais.
- **Nota do limite:** "Right now your income is the limit..." ou "Right now your savings are the limit. Every extra €1,000 saved raises this by about €X." Preso no degrau do Help to Buy: "...at the highest price where Help to Buy still applies. Going above it without Help to Buy needs about €X more in savings."
- **Resultados:** preço máximo com nota do limite, empréstimo máximo e fundos, e o botão dourado **"Save to my journey"** ("Update my journey" depois da primeira vez) com a nota "Completes step 1. Your figures stay in this browser."; detalhamento "On a €X house" com o imposto e as faixas usadas ("Stamp duty (1%)", "(1% and 2% bands)", "(1%, 2% and 6% bands)"; em imóvel novo, "... of the price without 13.5% VAT" ou "without 9% VAT"); veredito com 4 estados; aviso "Educational estimates..." no fim.

### 5.5 Dashboard (`dashboard.html`)
- **Deslogado ou carregando:** cartão "Loading your account..." ou "Sign in to see this page..." com "Sign in" e "Create an account" (voltam para o Dashboard).
- **Logado:** eyebrow "Your dashboard", título "Hi, Rodrigo".
  1. Quatro cartões: Progress (% e "N of 31 steps"), Current phase (número e nome), Earned (XP), Next up (terracota, com "Open this step" levando à etapa na jornada).
  2. "Your phases": os 6 cartões de fase.
  3. "Your numbers" (cartão verde): preço máximo, empréstimo máximo e fundos da calculadora, com "Open the calculator". Se a calculadora ainda não foi salva neste navegador: "Not saved yet", o texto "Fill in the calculator and choose Save to my journey to see your numbers here. They stay in this browser." e o botão "Use the calculator", sem os números de exemplo.
  4. "Your account": nome, e-mail, "Member since", "✓ Your progress is saved to your account." e "My profile".

### 5.6 Meu perfil (`profile.html`)
- Mesmo cartão de acesso do Dashboard para quem não está logado.
- **Your details:** Full name (editável, regra de 2 palavras), Email e Member since (só leitura), "Save changes".
- **Password:** explicação das regras e "Change password" (vai para `new-password.html`).
- **Your data:** o que a conta guarda e onde, link para a Privacy Policy e como pedir a exclusão da conta (e-mail para eirehomeflow@gmail.com).
- **Sign out.**

### 5.7 Páginas de conta
Cartão branco centralizado com eyebrow "Your account", título, introdução, formulário e aviso de privacidade no fim.

| Página | Campos | Botão | Links |
|---|---|---|---|
| `signin.html` | Email, Password | Sign in | "Forgot your password?"; "New here? Create an account" |
| `signup.html` | Full name, Email, Password (+ requisitos), Confirm password | Create account | "Already have an account? Sign in" |
| `forgot-password.html` | Email | Send reset link | "Remembered it? Sign in" |
| `new-password.html` | Password (+ requisitos), Confirm password | Save new password | (se não houver sessão) "Send me a new link", "Sign in" |

Quando não há nada a fazer na página, o formulário dá lugar a uma nota:
- contas desligadas: "Accounts are not switched on yet. Please check back soon.";
- já logado em signin/signup: "You are signed in as <e-mail>." + "Go to my dashboard";
- nova senha sem sessão: "To choose a new password, open the link in your email again, or sign in first.".

**Validação campo a campo.** Campo inválido fica com **borda e fundo vermelhos** e mensagem vermelha abaixo (a cor nunca é o único sinal). Valida ao enviar (foco no primeiro inválido), ao sair de um campo preenchido e, num campo já vermelho, a cada tecla.

| Campo | Regra | Mensagem |
|---|---|---|
| Full name | Pelo menos 2 palavras com 2+ letras cada | Enter your first and last name. |
| Email | Algo antes do "@" e um "." depois dele | Enter a valid email address, like name@example.com. |
| Password (nova) | 8+ caracteres, 1 maiúscula, 1 especial | Your password does not meet the requirements below. |
| Password (login) | Não vazia | Enter your password. |
| Confirm password | Não vazia e igual à senha | Confirm your password. / The passwords do not match. |

Requisitos de senha ao vivo: ○ pendente, ✓ verde quando atendido, pendentes em vermelho depois de uma tentativa. Mensagens gerais abaixo dos campos: "Please wait...", "Check your inbox and click the link we sent to confirm your account.", "If that email has an account, a reset link is on its way. Check your inbox." e erros do Supabase (em inglês).

Em `signup.html`, logo acima do botão: "By creating an account, you agree to our Terms of Use and confirm you have read our Privacy Policy." (com links). Todas as páginas de conta levam o link "Read our Privacy Policy" no aviso de privacidade.

### 5.8 Páginas legais (`privacy.html`, `terms.html`)
- Eyebrow "Legal", título, "Last updated: <data>".
- **Duas colunas em porcentagem** (68% texto, 28% barra lateral), que se ajustam a qualquer largura; abaixo de 960px, uma coluna só, com a barra lateral acima do texto.
- **Texto:** caixa de resumo em areia no topo, títulos `h2`/`h3`, parágrafos e listas **justificados** (justificado normal: a última linha fica à esquerda) com hifenização automática em inglês.
- **Barra lateral** (fixa ao rolar no desktop): índice **"On this page"**, sempre aberto ao carregar e recolhível, montado a partir dos títulos, com a seção visível destacada; e cartão verde de contato ("Questions about your data?" / "Questions about these terms?", e-mail e link para o outro documento).
- Linguagem simples, em inglês britânico e irlandês, sem travessões.
- Trechos que dependem de decisão do dono do site ficam marcados no código com `<!-- TODO -->` ou `<!-- POLICY CHOICE -->`.

### 5.9 E-mails
Modelos em `supabase/email-templates/`: fundo areia, cartão branco, logo, título, 2 parágrafos curtos, botão verde, nota "If you didn't..." e rodapé. Os dois links levam à Home, que mostra o aviso de confirmação ou encaminha para `new-password.html`.

## 6. Responsividade

| Largura | Mudanças |
|---|---|
| > 960px | Layouts completos de duas colunas |
| ≤ 960px | Hero, calculadora, jornada, Dashboard (linha de baixo) e Perfil em 1 coluna; cartões do Dashboard em 2; painel da etapa em tela cheia |
| ≤ 720px | Margens de 16px; navegação em linha própria; streak e XP escondidos; círculo e "Sign in" à direita; menu da conta na largura da tela; títulos com `clamp()`; onda da trilha a 45% |
| ≤ 480px | Campos da calculadora, caixas de resultado e cartões do Dashboard em 1 coluna |

Mínimo suportado: 320px sem rolagem horizontal.

## 7. Acessibilidade

- **Contraste:** texto ≥ 4,5:1 em todos os fundos.
- **Leitores de tela:** nós da trilha com rótulo completo e `aria-current="step"`; link da página atual com `aria-current="page"`; círculo com `aria-label` "Account menu for <nome>" e `aria-expanded`; pílulas com `aria-pressed`; campos inválidos com `aria-invalid` e mensagem ligada por `aria-describedby`; veredito e avisos em regiões `aria-live`.
- **Teclado:** tudo é link, botão ou campo nativo; `:focus-visible` com contorno terracota. Esc fecha o menu da conta.
- **Foco:** abrir etapa leva o foco ao título do painel; fechar devolve ao nó; formulário com erro leva o foco ao primeiro campo vermelho.
- **Movimento:** com `prefers-reduced-motion: reduce`, ticker parado, nó atual sem pulo e transições desligadas.

## 8. Pendências de UX (da auditoria)

A8 aviso legal junto aos resultados · M4 "streak" que não é sequência · M5 estado final contraditório · M9 chip "€ Free" · M17 etapas "Optional" que o texto trata como necessárias · M19 jargão e conteúdo para imigrantes. O item M7 (endereço por tela, Voltar do navegador, título por página) foi resolvido com as páginas separadas.
