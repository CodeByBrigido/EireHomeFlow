# Auditoria do site ÉireHome Flow

Data: 23/09/2026 · Escopo: `docs/` (versão reestruturada em HTML/CSS/JS puros)

> **Status (atualizado em 23/09/2026):** os itens **C1, C2, C3, A1, A2, A3, A4, A5, A6 e A7** foram corrigidos e testados no navegador (desktop, 375px e 320px). Também foi criada a etapa obrigatória "Create your ÉireHome Flow account" no fim da fase 1, com login via Supabase e progresso salvo na nuvem. Para ativar as contas, veja `SETUP-CONTAS.md`. **Continuam em aberto:** A8 e todos os itens M e baixos, exceto M8 ("Sign in" agora abre a janela de conta). As referências de linha abaixo são da versão auditada; alguns arquivos mudaram depois.

## 1. Resumo

O site é bonito, leve e o conteúdo é útil, mas **a calculadora dá números errados em cenários comuns** e uma regra do Central Bank está desatualizada. Esses são os problemas mais graves, porque o site fala de dinheiro e cita um regulador. Em seguida vêm: **não funciona bem no celular**, **o progresso se perde ao recarregar a página** e **o Google não enxerga o conteúdo das 30 etapas**.

| Área | Nota | Principal problema |
|---|---|---|
| Precisão financeira | 🔴 Ruim | Entrada de 20% para quem já teve imóvel (o correto é 10%), preço máximo subestimado, veredito enganoso |
| Mobile / responsivo | 🔴 Ruim | Nenhuma media query; a página tem 549px de largura numa tela de 375px |
| Acessibilidade | 🟠 Fraca | Contraste abaixo do mínimo, estados invisíveis para leitor de tela, animação sem pausa |
| Funcionalidade / UX | 🟠 Fraca | Progresso não é salvo, 29 de 30 etapas bloqueadas até para leitura, "streak" que não é streak |
| SEO | 🟠 Fraca | Conteúdo das etapas só aparece após clique; sem meta description, OG ou URLs por tela |
| Confiança / legal | 🟡 Regular | Aviso legal fraco e longe dos resultados; sem fontes, data de revisão ou contato |
| Performance | 🟢 Boa | 463 KB no total (o bundle original tinha 852 KB); só a imagem pede otimização |
| Segurança / privacidade | 🟢 Boa | Nenhuma requisição a terceiros, sem cookies, fontes locais, nenhum XSS explorável |
| Qualidade de código | 🟢 Boa | Código limpo; faltam git, README, testes da calculadora e um único lugar para os números |

---

## 2. O que foi feito antes da auditoria

### Tarefa 1: marcas de IA removidas
- **Pontuação:** 28 travessões (—), 24 meias-riscas (–) e 9 "≈" removidos. Faixas de valores agora usam hífen ("€2,000-3,000") e aproximações usam "about"/"~".
- **Frases-clichê reescritas:** por exemplo, "the boiler service nobody warns you about", "The part nobody budgets for", "The letter that makes you real", "Where the keys eventually go.", "Home.".
- **Segunda passada:** feita por um revisor independente, com cada proposta verificada por outro agente. Foram 22 ajustes de frases "de máquina": pontos e vírgulas em excesso, antíteses do tipo "X, not Y", frases de efeito curtas no fim e pares simétricos. Todos os fatos e números foram mantidos.
- **Marcas do gerador no código:** título "Bundled Page", loader "Unpacking...", atributos `sc-*`/`hint-placeholder`, `x-dc`/`DCLogic`, nomes de arquivo em UUID, props do editor do Claude Design. Tudo removido.
- **Não removido de propósito:** a imagem `img/hero.jpg` contém um manifesto **C2PA (Content Credentials)**, que é metadado de proveniência assinado pela Anthropic registrando que o Claude forneceu o arquivo. É um registro de transparência, não texto do site, e removê-lo é decisão sua. Converter a imagem para WebP/AVIF (recomendado na seção de performance) normalmente descarta esse metadado. A obrigação de marcação do AI Act (art. 50(2), vigente desde 2/8/2026) recai sobre o fornecedor do sistema, não sobre o site.

### Tarefa 2: código separado
```
docs/
├── index.html            ← estrutura das 3 telas + o guia completo (texto das 31 etapas)
├── partials/header.html  ← cabeçalho (carregado via fetch)
├── partials/footer.html  ← rodapé (carregado via fetch)
├── css/styles.css        ← todo o estilo (antes era inline)
├── js/config.js          ← chaves do Supabase (vazias até você configurar)
├── js/account.js         ← login e progresso na nuvem
├── js/app.js             ← lógica: telas, progresso, calculadora, janela de conta
├── img/hero.jpg
└── fonts/*.woff2         ← Nunito local (sem Google Fonts)
```
- O runtime proprietário do Claude Design (69 KB) e o React (~140 KB) saíram. Tudo foi reescrito em JavaScript puro.
- A comparação no navegador mostrou o **mesmo visual pixel a pixel** na home, na jornada (com etapa aberta) e na calculadora, com os mesmos resultados numéricos.
- O original está guardado em `_original/index.bundle.html`.
- ⚠️ **Header e footer são carregados via `fetch`, então o site precisa ser servido por HTTP.** Funciona no GitHub Pages ou com `python -m http.server` rodando dentro de `docs/`. Abrindo o `index.html` com duplo clique (`file://`), o cabeçalho e o rodapé não aparecem. Veja o item M11.

---

## 3. Achados

As referências `arquivo:linha` apontam para o estado atual dos arquivos.

### 🔴 Críticos e altos

**C1. Regra do Central Bank errada: 20% de entrada para quem já teve imóvel**
`js/app.js:34` (`depositRate = s.ftb ? 0.1 : 0.2`), `index.html:50`, `js/content.js:22`
- **Problema:** desde janeiro de 2023, o limite de LTV do Central Bank of Ireland para *second and subsequent buyers* é 90%, ou seja, **entrada mínima de 10%**, igual à de quem compra pela primeira vez. Só buy-to-let exige 30%.
- **Impacto:** no modo "Moving home", com os valores padrão, a calculadora diz "You are €47,850 short" quando o correto é €9,850. E o site atribui a regra ao regulador ("per Central Bank of Ireland rules").
- **Correção:** usar `0.1` para os dois casos (mantendo o LTI de 3,5× para quem já teve imóvel) e corrigir os dois textos.
- **Fontes:** [Central Bank: mortgage measures](https://www.centralbank.ie/financial-system/financial-stability/macro-prudential-policy/mortgage-measures), [explainer](https://www.centralbank.ie/consumer-hub/explainers/what-are-the-mortgage-measures)

**C2. "Maximum property price" subestima quem tem mais do que a entrada mínima**
`js/app.js:40-48`
- **Problema:** a fórmula `maxLoan / (1 - depositRate)` assume que a pessoa coloca exatamente 10% de entrada e joga fora qualquer dinheiro extra.
- **Exemplos:** com os valores padrão, mostra €200,000 quando o correto é €209,851. Com um presente familiar de €60,000, continua mostrando €200,000 quando o correto é €269,257. O "Mortgage needed" tem o mesmo erro.
- **Correção:** `maxPrice = min((maxLoan + funds - fees) / 1.01, (funds - fees) / (depositRate + 0.01))`, e o empréstimo necessário deve ser só o que o dinheiro não cobre.

**C3. O veredito da calculadora ignora o teto do empréstimo quando falta dinheiro**
`js/app.js:207-213`
- **Problema:** logo ao abrir, a calculadora diz "You are €9,850 short… save the difference". Mas o empréstimo necessário (€342,000) é €162,000 maior do que o permitido (€180,000). Juntar €9,850 não resolve nada.
- **Problema 2:** quando o dinheiro cobre os custos mas o empréstimo estoura o teto, o cartão fica **verde** com o título "Your cash covers this purchase".
- **Correção:** avaliar os dois limites separadamente e mostrar o que de fato bloqueia a compra. O verde só deve aparecer quando os dois passam.

**A1. Não há layout para celular**
`css/styles.css` (nenhuma `@media`)
- **O que acontece:** numa tela de 375px a página fica com 549px de largura e rola na horizontal. O título continua em 66px, a navegação vaza para fora da tela, as grades de 2 e 3 colunas espremem o conteúdo e o caminho da jornada (deslocamentos de ±108px) sai da tela.
- **Impacto:** falha o critério WCAG 1.4.10 (Reflow) e prejudica o SEO, porque o Google indexa a versão mobile. O problema já existia no original.
- **Correção:** breakpoints em ~720px com uma coluna, `clamp()` nos títulos, navegação com quebra de linha e onda reduzida no mobile.

**A2. O progresso some ao recarregar a página**
`js/app.js:8`
- **Problema:** o estado fica só na memória. Um F5 volta tudo para 0%, 0 XP e "Start my journey". Isso numa jornada de meses que oferece o botão "Resume my journey".
- **Correção:** salvar `done` e os campos da calculadora em `localStorage`, dentro de try/catch.

**A3. 29 das 30 etapas ficam bloqueadas até para leitura**
`js/app.js:57-61, 112, 122`
- **Problema:** o bloqueio é etapa por etapa, e não por fase como diz o texto da home ("Finish the blocking steps in a phase to unlock the next one").
- **Impacto:** quem ainda está juntando dinheiro fica preso atrás da etapa "Keep the bank account clean for six months" e não consegue ler sobre AIP, lances ou advogados. A única saída é marcar como feito algo que não fez.
- **Correção:** permitir abrir qualquer etapa em modo leitura e bloquear só o botão "Complete".

**A4. O Google não vê o conteúdo principal**
`index.html:85`, `js/app.js:149-163`
- **Problema:** as cerca de 1.750 palavras de orientação das etapas (texto, checklist e dica) só entram na página depois de um clique, e o Google não clica. Header, footer, aviso legal, ticker e cards também só existem depois do JavaScript.
- **Correção:** renderizar todas as etapas no HTML, por exemplo com `<details>` ou uma página por fase, e deixar o painel lateral como melhoria progressiva.

**A5. Contraste de texto abaixo do mínimo (WCAG 1.4.3)**
`css/styles.css:47-48`
- **Cor `--faint` #8a7a66:** usada em cerca de 15 estilos, incluindo **o aviso legal**. Dá 4,15:1 no branco, 4,0:1 no creme e 3,54:1 no rodapé; o mínimo é 4,5:1.
- **Rótulos das etapas bloqueadas #a2917d:** 2,94:1, e na primeira visita isso vale para 29 das 30 etapas.
- **Correção:** escurecer `--faint` para cerca de #74644f ou reutilizar `--muted` #6b5a48, que dá 6,36:1.

**A6. Leitores de tela não percebem estados**
`js/app.js:122`, `index.html:157-164`
- **Nós da jornada:** o `aria-label` tem só o título; feito, bloqueado, atual e opcional não são anunciados.
- **Botões de alternância da calculadora** ("First-time buyer / Moving home", "Buying alone / Joint"): não têm `aria-pressed`, então quem usa leitor de tela não sabe qual regra (4× ou 3,5×) está sendo aplicada.
- **Correção:** incluir o estado no nome acessível e adicionar `aria-pressed` e `role="group"`.

**A7. Animação infinita sem pausa (WCAG 2.2.2, nível A)**
`css/styles.css:122, 189`
- **Problema:** o ticker roda para sempre, não tem botão de pausa e não respeita `prefers-reduced-motion`. O conteúdo duplicado é lido duas vezes pelo leitor de tela. O nó da etapa atual também fica pulando sem parar.
- **Correção:** pausar no hover e no foco, envolver as animações em `@media (prefers-reduced-motion: no-preference)` e marcar a cópia duplicada com `aria-hidden`.

**A8. Aviso legal fraco e longe dos resultados**
`index.html:206`, `partials/footer.html:4`
- **Problema:** os resultados usam linguagem definitiva ("Maximum property price", "Your cash covers this purchase", "Next step: gather the AIP paperwork"). Mas o aviso fica embaixo da coluna de campos, em texto de baixo contraste, e o "Not regulated financial advice" só existe no rodapé carregado por fetch. Se o fetch falha, ele não aparece.
- **Correção:** colocar um aviso fixo logo abaixo dos resultados, com ≥14px e bom contraste; renomear para "Estimated maximum price"; suavizar os vereditos.

### 🟠 Médios

| # | Achado | Onde | Correção sugerida |
|---|---|---|---|
| M1 | O Help to Buy entra na conta **sem o teto de €500.000 de valor do imóvel**, sem a exigência de empréstimo ≥70% e sem perguntar se é imóvel novo. O limite do HTB também muda conforme o "Target price" digitado | `app.js:37-38` | Validar preço ≤ €500k e ter um toggle "new build" ([Revenue](https://www.revenue.ie/en/property/help-to-buy-incentive/what-type-of-property-qualifies.aspx)) |
| M2 | Custos inconsistentes: a home e a etapa 3 dizem €3,550, mas a calculadora usa €3,050. O "Total cash you need" ignora os 23% de IVA e as despesas extras (outlays) do solicitor, que o próprio texto menciona | `index.html:54`, `app.js:41`, `content.js:25` | Definir os custos num só lugar e incluir o IVA |
| M3 | Prazo 0 ou vazio faz a "prestação mensal" virar o empréstimo inteiro; valores negativos ou inválidos geram euros negativos, sem nenhuma mensagem | `app.js:17, 51` | Validar e limitar os campos (prazo 5-35) e mostrar erro |
| M4 | O "Streak" não é uma sequência de dias: é `min(etapas feitas, 7)` exibido como "days" | `app.js:78` | Renomear ("Steps done") ou implementar com datas |
| M5 | Estado final contraditório: a nota diz que o final desbloqueia com as etapas obrigatórias, mas o código exige todas as 30. Quando só faltam opcionais, "Next up" mostra "Put the kettle on" e o botão não faz nada | `app.js:144-147, 170` | Alinhar a regra com o texto |
| M6 | Desmarcar uma etapa anterior deixa as posteriores "feitas" mas bloqueadas: elas contam XP e não abrem mais | `app.js:112-122` | Manter abertas as etapas já feitas |
| M7 | Sem URLs: o botão Voltar sai do site, não dá para compartilhar a calculadora, o título da aba não muda e a rolagem não volta ao topo ao trocar de tela. Os 6 cards de fase abrem todos no mesmo lugar | `app.js:243` | Rotas por hash (`#journey`, `#calculator`), `scrollTo(0,0)` e âncora por fase |
| M8 | O botão "Sign in" não faz nada e sugere contas que não existem | `partials/header.html:10` | Remover ou implementar |
| M9 | O chip de custo duplica o euro: "€ €3,000-5,000 refundable", "€ Free", "€ 10% of price" | `index.html:95` | Tirar o prefixo "€ " fixo |
| M10 | O painel da etapa é `sticky` e mais alto que a tela de notebooks comuns, então "Complete step" e "Next" ficam fora de vista | `styles.css:201` | Usar `max-height: calc(100vh - 120px); overflow:auto` |
| M11 | Header e footer via fetch: não funcionam em `file://`, a navegação e o aviso somem se o fetch falhar, e há um salto de layout de cerca de 60px (110px no celular) | `app.js:253-272` | É a contrapartida da separação em arquivos. Alternativa: um script de build simples (Python) que monta o HTML final, mantendo os partials como fonte |
| M12 | Foco e teclado: o foco se perde ao trocar de tela e ao abrir uma etapa; o anel de foco terracota tem 1,28:1 sobre o verde; o contorno da etapa atual sobrescreve o foco; o header sticky pode cobrir o elemento focado | `styles.css:65, 189`, `app.js` | Mover o foco para o título da tela ou painel; usar anel de foco claro sobre fundos escuros |
| M13 | Nenhum `aria-live`: resultados da calculadora e XP mudam em silêncio | `index.html:209` | Usar `aria-live="polite"` no veredito |
| M14 | Os títulos de fase são `<span>`, e o modo compacto esconde o único `<h1>` | `app.js:131` | Usar `<h2>`/`<h3>` |
| M15 | SEO básico ausente: meta description, Open Graph e Twitter, título só com a marca, favicon, canonical, robots.txt, sitemap e 404 próprio. Sem domínio próprio, o Google não mostra nome nem favicon do site | `index.html:3-10` | Adicionar as tags; considerar domínio próprio (.ie) |
| M16 | Confiança (tema de dinheiro): nenhum link para fontes oficiais, nenhuma data de "última revisão", nenhuma página de Sobre, contato ou privacidade. O site não tem nenhum `<a href>` | todo o site | Links para Central Bank, Revenue e Citizens Information; "Revisado em: mês/ano"; página Sobre |
| M17 | Algumas etapas marcadas como "Optional" são descritas no próprio texto como necessárias ou com prazo. Exemplo: o HTB diz "approval must be in place before you sign" | `content.js:31-33, 104, 126` | Rever a classificação |
| M18 | A lista de custos mistura "Mortgage needed" no meio de uma lista somada como "Total cash you need" | `app.js:192-200` | Separar em dois blocos |
| M19 | Jargão antes da explicação (AIP, EDS, DIRT, BER, outlays) e nada para compradores imigrantes (residência, renda no exterior). "Moving home" é ambíguo | `index.html:23`, `content.js` | Glossário acessível desde o início; seção para imigrantes |
| M20 | A imagem hero (298 KB, 80% do peso da página) tem um só tamanho e formato, sem `srcset`, WebP/AVIF ou `fetchpriority="high"` | `index.html:30` | Gerar 600w/1200w em WebP e AVIF (atenção: isso descarta o C2PA, veja a seção 2) |
| M21 | Projeto sem git, README e LICENSE; a licença OFL da fonte Nunito não acompanha os arquivos | raiz, `fonts/` | `git init`; adicionar `fonts/OFL.txt` |
| M22 | Números regulatórios espalhados em 4 ou mais lugares, e `calc()` sem testes | `app.js:30-54` | Um objeto `RULES` único e alguns testes com valores de referência |

### 🟡 Baixos

- O imposto de selo é fixo em 1%; acima de €1m o correto é 2%, e 6% acima de €1,5m (`app.js:46`).
- O texto diz que as exceções ao limite de 4× são "rationed each quarter and go early in the year", o que é contraditório. A cota dos bancos é anual (`content.js:21`).
- Cada tecla digitada na calculadora reconstrói os cards da home e os 30 nós da jornada via `innerHTML` (`app.js:66-73`).
- Os botões Previous/Next falham em silêncio nas pontas, e os nós bloqueados são botões focáveis que não fazem nada (sem `disabled`/`aria-disabled`).
- "Reset progress" apaga tudo sem pedir confirmação.
- O anel de progresso mostra um ponto verde em 0%.
- A etapa 1 ("Calculate my buying power") não tem link para a calculadora.
- "Blocking step" é jargão de desenvolvedor, e não há legenda para ★ ◆ ✓ 🔒.
- O quadro "Earned" mostra só um número, sem "XP".
- Os placeholders dos campos contradizem os valores preenchidos (30000 vs 35000) e não há separador de milhar.
- Os glifos decorativos são lidos em voz alta, e o SVG do anel não tem texto alternativo.
- A navegação não tem `aria-current`.
- A fonte principal não é pré-carregada, e o itálico só existe no peso 600 (o título usa 800, então o navegador sintetiza o negrito).
- Não há Content-Security-Policy; o GitHub Pages só permite definir por `<meta>`.
- `.claude/launch.json` usa caminho absoluto; é só uma conveniência de desenvolvimento.

### 🟢 Pontos positivos
- Nenhuma requisição a terceiros, sem cookies e sem armazenamento. As fontes são locais, o que é bom para o GDPR. Os dados de salário nunca saem do navegador; vale dizer isso ao usuário.
- Nenhum caminho de XSS explorável: todo texto inserido via `innerHTML` passa por `esc()`.
- Primeiro carregamento cerca de 37% menor que o bundle original, e a imagem principal aparece sem esperar o JavaScript.
- Não compensa minificar: todo o texto somado dá cerca de 18 KB com gzip.
- CSS sem classes órfãs; `lang="en-IE"` correto; `alt` presente na imagem.
- O texto é bem informado e específico para a Irlanda (RPPR, EDS, BER, gazumping, snag list).

---

## 4. Por onde começar (ordem sugerida)

1. **Corrigir a calculadora e a regra dos 20%** (C1, C2, C3, M1, M2). É o que pode induzir alguém a erro financeiro. Esforço pequeno.
2. **Aviso legal fixo e visível junto aos resultados** (A8). Esforço pequeno.
3. **Layout mobile** (A1). Esforço médio, e é o maior ganho de alcance.
4. **Salvar o progresso** (A2) e **liberar a leitura das etapas** (A3). Esforço pequeno a médio.
5. **Contraste e ARIA** (A5, A6, A7). Esforço pequeno, quase tudo no CSS.
6. **SEO e confiança** (A4, M15, M16): renderizar as etapas no HTML, adicionar meta tags, links para fontes oficiais e data de revisão.

---

## 5. Como a auditoria foi feita (e limites)

- **Execução:** 9 revisores independentes, um por dimensão (funcional, precisão financeira, acessibilidade, responsivo, SEO, performance, segurança e legal, UX e conteúdo, qualidade de código), mais revisores de fidelidade da reestruturação e de marcas de IA.
- **Limite de uso:** o limite de uso da sessão foi atingido duas vezes. Os revisores de **precisão financeira**, **responsivo** e **fidelidade** não chegaram a terminar. Cada um foi coberto de outra forma:
  - **Fatos regulatórios:** as regras do Central Bank, o Help to Buy e o imposto de selo foram checados em fontes oficiais pelos revisores funcional, de UX e de legal, com os links acima.
  - **Responsivo:** medido no navegador (375px) e coberto pelo revisor de acessibilidade.
  - **Fidelidade:** feita por comparação visual lado a lado no navegador, nas três telas e com uma etapa aberta.
- **Verificação:** a verificação adversarial independente rodou completa para as marcas de IA (29 de 29 itens). Para a auditoria, os verificadores não terminaram, então **eu conferi pessoalmente os achados críticos e altos**, relendo o código, recalculando os exemplos da calculadora e medindo os contrastes. Os achados médios e baixos vieram de um único revisor e foram consolidados por mim, sem segunda verificação independente.
- **Fora do escopo:** o site não foi testado em Safari/iOS real nem com leitor de tela real, e não houve medição com Lighthouse (sem Node.js na máquina).
