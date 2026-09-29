# UI/UX Design

Produto: ÉireHome Flow · Versão do documento: 1.8 · Última revisão: 29/09/2026

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

- **Idioma:** inglês britânico e irlandês (`en-IE`) na fonte: *organise, savings, solicitor, flat, estate agent*. O site também está em português do Brasil, espanhol, francês, alemão, italiano, polonês, romeno e lituano, traduzidos a partir do inglês com as mesmas regras (sem travessão, sem "≈", sem "…", sem prometer resultado) e o glossário do [doc 08](08-Internationalisation.md), seção 6. Termos oficiais irlandeses ficam em inglês nas traduções, explicados na primeira menção. O blog fica só em inglês, com as mesmas regras de texto.
- **Maiúsculas:** sentence case em títulos e botões ("Start my journey", não "Start My Journey"). Exceções: nomes próprios e termos oficiais (Approval in Principle, Sale Agreed, Help to Buy, Local Property Tax).
- **Números:** em inglês, euro antes do valor e vírgula de milhar (€380,000). Nos outros idiomas, o formato local (€ 380.000 em português, 380.000 € em alemão e romeno, 380 000 € em francês, polonês e lituano), sempre com os mesmos valores. Faixas com hífen simples (€2,000-3,000; 1-2 weeks). Aproximação com "about" no texto e "~" nas tabelas ("ca." em alemão, "env." em francês).
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
| Contato | `contact.html` | Contact us \| ÉireHome Flow | Rodapé, mapa do site |
| Mapa do site | `sitemap.html` | Sitemap \| ÉireHome Flow | Rodapé |
| Política de privacidade | `privacy.html` | Privacy Policy \| ÉireHome Flow | Rodapé, cadastro, páginas de conta, My profile |
| Termos de uso | `terms.html` | Terms of Use \| ÉireHome Flow | Rodapé, cadastro |
| Artigo do blog | `blog/<slug>.html` | O título do artigo, em inglês | Slideshow e cartões do blog na Home, "Similar articles" |

**Endereços profundos da jornada:** `journey.html#step-<id>` abre a etapa no painel; `journey.html#phase-<slug>` rola até a fase. O endereço acompanha a etapa aberta.

Os títulos acima são os do inglês; cada idioma tem os seus (ex.: "Minha jornada | ÉireHome Flow").

**Retorno depois de entrar:** as páginas de conta aceitam `?next=<página>`, por exemplo `signup.html?next=journey.html#step-preparation-5`. Sem `next`, quem entra vai para o Dashboard.

## 4. Elementos compartilhados

### 4.1 Cabeçalho (`partials/header.html`)
- Verde (`--ink`), fixo no topo. A marca "ÉireHome **Flow**" é um link para a Home.
- Links: Home, Guide, My journey, Calculator. O link da página atual fica creme com sublinhado dourado e `aria-current="page"`.
- Sem contadores no topo: o XP aparece só no Dashboard.
- **Menu de idiomas:** botão com globo e o código do idioma atual (EN, PT...), antes de "Sign in" ou do círculo. Abre uma lista dos idiomas completos, cada um no próprio nome ("Português (Brasil)", "Deutsch"), com o nome no idioma atual embaixo e o atual marcado com ✓. `aria-label` diz o idioma atual ("Language: English. Change language"); cada nome tem o `lang` da língua. Fecha com Esc e clique fora, como o menu da conta. Escolher um idioma recarrega a página nele. Em telas baixas, a lista dos 9 idiomas rola dentro do menu, que para 16px antes do fim da tela.
- **Deslogado:** link "Sign in".
- **Logado:** círculo dourado com as iniciais do primeiro e do último nome ("Rodrigo Andrade Brigido" vira **RB**; sem nome, a inicial do e-mail). O clique abre o **menu da conta**:
  - nome e e-mail;
  - Dashboard · My profile · **Sign out** (em vermelho). A troca de senha não fica no menu: só em My profile.
  - Fecha ao clicar fora, com Esc (o foco volta ao círculo) ou ao escolher uma opção. No celular, abre na largura da tela, logo abaixo do cabeçalho.
- **Até 880px, o cabeçalho tem 2 linhas, em qualquer idioma:** a marca à esquerda e o botão de idioma com "Sign in" (ou o círculo) à direita na primeira; Home, Guide, My journey e Calculator na segunda. Por isso esses botões ficam fora do `<nav>`, num `.site-header__account` próprio. Abaixo de 400px o botão de idioma mostra só o globo. Os rótulos do menu são curtos em todos os idiomas ("Jornada", "Parcours", "Percorso") para caberem em 320px.

### 4.2 Rodapé e avisos (`partials/footer.html`)
- Rodapé areia com "© 2026 ÉireHome Flow, All rights reserved." (a marca e o ano fixos, "All rights reserved." traduzido), "Educational content. Not regulated financial advice." e os links **Contact us**, **Sitemap**, **Privacy Policy** e **Terms of Use**, num `<nav>` com `aria-label` "About this site".
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

Todos os avisos aparecem no idioma da página. Os textos acima são os do inglês.

Avisos que acontecem logo antes de uma troca de página (entrar, sair, trocar senha) aparecem na página seguinte.

## 5. Páginas

### 5.1 Home (`index.html`)
1. **Hero:** eyebrow "For first-time buyers in Ireland", título "From first savings to your *first sofa*.", texto de apoio, botão principal ("Start my journey" ou "Resume my journey") e botão secundário ("Buying power calculator"). Ilustração com legenda. Em qualquer idioma, o título fica em 2 linhas como no inglês (o tamanho se ajusta ao idioma e à largura) e os botões ficam lado a lado; numa coluna estreita (tablet e celular), um embaixo do outro, na largura toda.
2. **Ticker:** faixa verde com 6 fatos em rolagem contínua; "Pause"/"Play".
3. **Números-chave:** 3 cartões (4×, 10%, €3,550).
4. **Seis fases:** cartões com número, título, resumo, barra e "N of M steps done"; cada um leva a `journey.html#phase-<slug>`.
5. **Convite ao guia:** faixa areia "Read the full guide" com o botão "Open the guide".
6. **Blog** (`#blog`, todo em inglês em qualquer idioma do site): eyebrow "From the blog" e título "Guides for buying a home in Ireland". Embaixo, como num portal de notícias:
   - à esquerda, um **slideshow** grande com 4 artigos sorteados a cada visita: imagem 16:10, categoria, título e resumo; controles embaixo (setas redondas e pontos com o atual alongado em verde, sem botão de pausa). Passa sozinho a cada 7 s, com o card inteiro deslizando da direita para a esquerda (para trás, o contrário); espera com o ponteiro ou o foco em cima e para de passar sozinho depois que a pessoa usa as setas ou os pontos;
   - à direita, depois de uma linha vertical, **3 artigos** sorteados, com imagem pequena ao lado da categoria e do título, separados por linhas. Eles ocupam a altura do slideshow: o primeiro começa na altura da imagem e o último termina junto com as setas;
   - uma linha horizontal e **"More articles"**: os outros 13 em 2 colunas, com imagem ao lado do texto, 6 por vez; "Show more articles" mostra os próximos 6.
   Nenhum artigo aparece duas vezes. Cada cartão inteiro é o link para o artigo.

### 5.2 Guia completo (`guide.html`)
- Eyebrow "The full guide", título "Every step, in detail", introdução com link para My journey.
- Um acordeão por fase. Cada etapa mostra, à esquerda, título, "Blocking/Optional step · ⏱ tempo · custo", texto, checklist, passo a passo numerado e links externos quando a etapa tem (ex.: "How to apply" e os links da Revenue no Help to Buy), "Worth knowing" e o link **"Open in my journey"** (`journey.html#step-<id>`); a etapa 1 também tem **"Open the calculator"**. À direita, a ilustração da etapa (no celular, acima do título).
- É a **fonte única do conteúdo** das etapas (ver TRD).

### 5.3 Jornada (`journey.html`)
**Desktop (>960px), sem etapa aberta:** trilha à esquerda e barra lateral de 300px à direita (anel de % com a contagem de etapas, "Next up" com "Open this step", "Reset progress"). No fim da trilha, o selo 🔑.

**Com etapa aberta (modo compacto):** trilha estreita à esquerda e painel de detalhe à direita, fixo ao rolar. **Duas rolagens:** a trilha rola com a página e o painel tem rolagem própria, nunca mais alto que a tela. Os botões (Complete step, Previous, Next) ficam presos no rodapé do painel e estão sempre visíveis. Na trilha, os nós e os rótulos diminuem, e os balões "Start here" e "Optional" continuam visíveis, menores. No tablet e no celular (≤960px), o painel ocupa a tela inteira, com "Close".

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
- **Deslogado ou carregando:** cartão "Sign in to see this page..." com "Sign in" e "Create an account" (voltam para o Dashboard). "Loading your account..." só aparece para quem chega por um link de e-mail. Quem entrou neste navegador vê o Dashboard na hora, sem esse cartão.
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
- **Delete your account:** texto "This deletes your account and the progress saved in it, straight away. It cannot be undone...". Botão com contorno vermelho **"Delete my account"**. O clique troca o botão por uma caixa vermelho-clara, na própria página (sem pop-up): "Delete the account for <e-mail> and all its saved progress? ..." com **"Yes, delete my account"** (vermelho cheio) e **"Cancel"**. Enquanto apaga: "Deleting...". Deu certo: Home, deslogado, aviso "Your account and its saved progress have been deleted." Deu errado: mensagem vermelha logo abaixo. Por último, a nota "Cannot sign in any more? Email eirehomeflow@gmail.com..."

### 5.7 Páginas de conta
Cartão branco centralizado com eyebrow "Your account", título, introdução, formulário e aviso de privacidade no fim. Eyebrow, título, introdução e a nota que substitui o formulário ficam centralizados; os textos longos (termos, aviso de privacidade) ficam justificados.

**Continue with Google** (em `signin.html` e `signup.html`, acima do formulário): botão branco largo com o logo "G" colorido do Google, como pedem as regras de marca do Google, e a linha "or use your email" separando do formulário. No cadastro, logo abaixo do botão: "By continuing with Google, you agree to our Terms of Use and confirm you have read our Privacy Policy." Enquanto abre: "Opening Google..." (desativado). Erro antes de sair do site (ex.: Google desligado no painel): mensagem abaixo do botão. O bloco some junto com o formulário quando a pessoa já está logada.

O aviso de privacidade das páginas de conta diz também: "With Google, it also keeps the profile picture link Google sends, which we do not use."

| Situação na volta do Google | Aviso |
|---|---|
| Conta já existia | "Welcome back, Rodrigo." (na página de onde a pessoa saiu) |
| Conta nova | "Your account is ready. Welcome to ÉireHome Flow, Rodrigo!" |
| Cancelou no Google | Vermelho, fixo: "Signing in with Google was cancelled. You can try again, or use your email." + "Sign in" |
| Outro erro | Vermelho, fixo: "Signing in with Google did not work: <motivo>. Please try again, or use your email." + "Sign in" |

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

Requisitos de senha ao vivo: ○ pendente, ✓ verde quando atendido, pendentes em vermelho depois de uma tentativa. Mensagens gerais abaixo dos campos: "Please wait...", "Check your inbox and click the link we sent to confirm your account.", "If that email has an account, a reset link is on its way. Check your inbox." e erros do Supabase. Os erros comuns do Supabase (senha errada, e-mail não confirmado, conta já existente, limite de tentativas, sessão expirada, rede) têm texto próprio no idioma da página; outros aparecem em inglês para quem usa inglês e como "Something went wrong" traduzido nos demais.

Em `signup.html`, logo acima do botão: "By creating an account, you agree to our Terms of Use and confirm you have read our Privacy Policy." (com links). Todas as páginas de conta levam o link "Read our Privacy Policy" no aviso de privacidade.

### 5.8 Páginas legais (`privacy.html`, `terms.html`)
- Eyebrow "Legal", título, "Last updated: <data>".
- **Duas colunas em porcentagem** (68% texto, 28% barra lateral), que se ajustam a qualquer largura; abaixo de 960px, uma coluna só, com a barra lateral acima do texto.
- **Texto:** caixa de resumo em areia no topo, títulos `h2`/`h3`, parágrafos e listas **justificados** (justificado normal: a última linha fica à esquerda) com hifenização automática em inglês.
- **Barra lateral** (fixa ao rolar no desktop): índice **"On this page"**, sempre aberto ao carregar e recolhível, montado a partir dos títulos, com a seção visível destacada; e cartão verde de contato ("Questions about your data?" / "Questions about these terms?", e-mail e link para o outro documento).
- Linguagem simples, em inglês britânico e irlandês, sem travessões.
- **Em outros idiomas:** eyebrow, título, data, o resumo ("The short version"), o índice, o cartão de contato e um aviso ("A política completa abaixo está disponível apenas em inglês.") ficam no idioma. O texto integral continua em inglês, marcado com `lang="en-IE"`, e o índice lateral também (aponta para as seções em inglês). O aviso não aparece em inglês.
- Trechos que dependem de decisão do dono do site ficam marcados no código com `<!-- TODO -->` ou `<!-- POLICY CHOICE -->`.

### 5.8.1 Contato (`contact.html`)
- Eyebrow "Contact us", título "Get in touch" e uma frase sobre o que se pode perguntar.
- **Duas colunas** (60% e 40%); abaixo de 960px, uma coluna, com os cartões depois do formulário.
- **Formulário "Write to us"** (cartão branco): Full name, Email, Topic (lista: "A question about the guide", "The calculator", "My account", "A figure or fact to correct", "An idea for the site", "Something else") e Message (até 1.500 caracteres). Abaixo, a nota "Your message goes straight to our inbox, and we use your email address only to reply. See our Privacy Policy." (com link) e o botão "Send message".
- Campos vazios ficam vermelhos, com "Enter your first and last name.", "Enter a valid email address..." e "Write your message.", e o foco vai ao primeiro. Com tudo certo, "Please wait..." aparece acima do botão, que fica desativado. Enviada: aviso verde "Thank you. Your message has been sent, and we aim to reply within 14 days.", e a mensagem e o assunto voltam ao início. Erro: "Your message could not be sent. Please try again, or email us at eirehomeflow@gmail.com."; depois de 5 mensagens em uma hora: "You have sent several messages in the last hour. Please try again later, or email us at eirehomeflow@gmail.com."
- Logado, nome e e-mail já vêm preenchidos.
- **Cartões ao lado:** "Email us directly" (branco: o endereço e o prazo de resposta, 14 dias, ou um mês para pedidos sobre dados pessoais) e "Before you write" (areia: o site não dá aconselhamento; para apagar a conta, My profile; ao apontar um erro, diga a etapa ou o artigo e a fonte).

### 5.8.2 Mapa do site (`sitemap.html`)
- Título "Sitemap" e "Every page of the site in one place."
- Três colunas no topo: **Main pages** (Home, Guide, My journey, Calculator, Blog), **Your account** (Sign in, Create an account, Dashboard, My profile) e **About the site** (Contact us, Privacy Policy, Terms of Use e o mapa XML).
- **My journey, phase by phase:** as 6 fases ("01 · Preparation"...), cada uma um link para a fase na jornada, com as etapas embaixo, cada uma um link que abre a etapa.
- **Blog articles:** os 20 artigos por categoria (Schemes, Money, Buying, Newcomers, Energy, Moving in), em inglês em qualquer idioma.
- 3 colunas no desktop, 2 abaixo de 960px e 1 abaixo de 720px; listas alinhadas à esquerda.

### 5.9 Artigo do blog (`blog/<slug>.html`)
Coluna de leitura de 760px, centralizada:
1. **Topo:** "← All articles" (volta ao blog na Home), categoria em verde e maiúsculas, título grande, abertura em texto maior e tempo de leitura ("5 min read").
2. **Imagem:** a ilustração do artigo em 16:10, com cantos de 26px (a mesma dos cartões da Home).
3. **Texto:** títulos `h2`, parágrafos justificados, listas com marcador verde, passos numerados, notas "Worth knowing" em pêssego e tabelas com cabeçalho em maiúsculas (em telas estreitas, a tabela rola dentro da própria caixa).
4. **Caixa "In My journey":** cartão verde com o texto que liga o artigo a uma etapa e o botão dourado "Open this step in My journey", que abre a etapa no painel da jornada.
5. **Similar articles:** 3 cartões com imagem em cima, categoria e título (3 colunas no desktop, 2 no tablet, 1 no celular).

A página inteira fica em inglês (`lang="en-IE"`), em qualquer idioma do site; só o cabeçalho e o rodapé seguem o idioma escolhido.

### 5.10 E-mails
Modelos em `supabase/email-templates/`, só em inglês (o Supabase usa um modelo por projeto): fundo areia, cartão branco, logo, título, 2 parágrafos curtos, botão verde, nota "If you didn't..." e rodapé. Os dois links levam à Home, que mostra o aviso de confirmação ou encaminha para `new-password.html`.

## 6. Responsividade

| Largura | Mudanças |
|---|---|
| > 960px | Layouts completos de duas colunas |
| ≤ 960px | Hero, calculadora, jornada, Dashboard (linha de baixo) e Perfil em 1 coluna; cartões do Dashboard em 2; painel da etapa em tela cheia; no blog, os 3 artigos passam para baixo do slideshow e os semelhantes ficam em 2 colunas; contato em 1 coluna; mapa do site em 2 colunas |
| ≤ 880px | Cabeçalho em 2 linhas: marca, idioma e conta em cima; links embaixo |
| ≤ 720px | Margens de 16px; navegação em linha própria; botão de idioma, círculo e "Sign in" à direita; menus da conta e de idioma na largura da tela; títulos com `clamp()`; onda da trilha a 45%; artigos do blog em 1 coluna, com título do slide de 23px; mapa do site em 1 coluna |
| ≤ 400px | Botão de idioma só com o globo |
| ≤ 480px | Campos da calculadora, caixas de resultado e cartões do Dashboard em 1 coluna |

Mínimo suportado: 320px sem rolagem horizontal.

## 7. Acessibilidade

- **Contraste:** texto ≥ 4,5:1 em todos os fundos.
- **Leitores de tela:** nós da trilha com rótulo completo e `aria-current="step"`; link da página atual com `aria-current="page"`; círculo com `aria-label` "Account menu for <nome>" e `aria-expanded`; pílulas com `aria-pressed`; campos inválidos com `aria-invalid` e mensagem ligada por `aria-describedby`; veredito e avisos em regiões `aria-live`.
- **Idioma:** `<html lang>` segue o idioma mostrado (pt-BR, de-DE...), para leitores de tela e hifenização; trechos que ficam em inglês levam `lang="en-IE"`. Os `aria-label`, `alt` e mensagens de erro são traduzidos como o resto.
- **Teclado:** tudo é link, botão ou campo nativo; `:focus-visible` com contorno terracota. Esc fecha o menu da conta e o de idiomas.
- **Foco:** abrir etapa leva o foco ao título do painel; fechar devolve ao nó; formulário com erro leva o foco ao primeiro campo vermelho.
- **Movimento:** com `prefers-reduced-motion: reduce`, ticker parado, nó atual sem pulo e transições desligadas.

## 8. Pendências de UX (da auditoria)

A8 aviso legal junto aos resultados · M5 estado final contraditório · M9 chip "€ Free" · M17 etapas "Optional" que o texto trata como necessárias · M19 jargão e conteúdo para imigrantes. O item M7 (endereço por tela, Voltar do navegador, título por página) foi resolvido com as páginas separadas, e o M4 com a retirada do "streak".
