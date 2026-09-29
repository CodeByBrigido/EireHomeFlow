# PRD: Product Requirements Document

Produto: ÉireHome Flow · Versão do documento: 1.7 · Última revisão: 29/09/2026 · Dono: Rodrigo

## 1. Visão

Guiar quem vai comprar o primeiro imóvel na Irlanda, do primeiro euro poupado até o primeiro sofá na casa nova, com um caminho claro, números honestos e linguagem simples.

Frase de posicionamento (usada no site): *"From first savings to your first sofa."*

## 2. Problema

Comprar o primeiro imóvel na Irlanda envolve regras do Central Bank, documentação bancária, vocabulário próprio (AIP, Sale Agreed, gazumping, BER, snag list), custos fora do empréstimo e uma sequência de etapas que ninguém explica de ponta a ponta. As informações existem, mas estão espalhadas entre bancos, corretores, Revenue, Citizens Information e fóruns. O resultado:

- A pessoa não sabe **quanto pode pagar** de fato.
- Não sabe **qual é o próximo passo** nem o que ele exige.
- Descobre custos e exigências tarde demais (extratos "sujos", falta de dinheiro para solicitor e imposto de selo).
- Quem veio de fora do país ainda precisa aprender o vocabulário e os costumes locais.

## 3. Público-alvo

| Persona | Quem é | O que precisa |
|---|---|---|
| **Aoife, primeira compra** | 29 anos, irlandesa, aluga em Dublin, poupando há 1 ano | Saber quanto pode comprar e em que ordem fazer as coisas |
| **Rafael, imigrante** | 34 anos, brasileiro, trabalha em Dublin há 3 anos, inglês fluente mas não nativo | Entender o processo e o vocabulário irlandês sem jargão |
| **Casal com renda conjunta** | Dois salários, um já teve imóvel no país de origem | Simular a compra conjunta e acompanhar o progresso juntos, em aparelhos diferentes |

Idiomas do site: inglês (en-IE, a fonte dos textos), português do Brasil, espanhol, francês, alemão, italiano, polonês, romeno e lituano. Polonês, romeno e lituano atendem algumas das maiores comunidades estrangeiras do país (Censo 2022). Mercado: República da Irlanda.

## 4. Objetivos e métricas

| Objetivo | Métrica | Meta inicial |
|---|---|---|
| A pessoa entende o caminho completo | % de visitantes que abrem ao menos 1 fase do guia ou 1 etapa da jornada | a definir |
| A pessoa volta e continua | % de contas com progresso atualizado em mais de 1 dia | a definir |
| A calculadora é útil | % de visitas que usam a calculadora | a definir |
| Criação de conta | contas confirmadas por semana | a definir |

Hoje o site **não tem analytics**. Definir a ferramenta (preferência por uma sem cookies, ex.: Plausible ou Umami) e as metas é uma questão em aberto (seção 10).

## 5. Escopo atual (v1)

**Uma página por lugar:** todo clique que leva a outro lugar abre um `.html` próprio (Home, Guide, My journey, Calculator, Dashboard, My profile, Sign in, Create account, Forgot password, New password, Contact us, Sitemap, Privacy Policy, Terms of Use e uma página por artigo do blog). Cabeçalho e rodapé são compartilhados entre as páginas; o rodapé leva a Contact us, Sitemap, Privacy Policy e Terms of Use.

### 5.1 Home
- Hero com chamada, botões "Start/Resume my journey" e "Buying power calculator".
- Letreiro (ticker) com números-chave, com botão de pausa.
- Três cartões de números: limite de 4×, entrada mínima de 10%, custos fora do empréstimo.
- Cartões das 6 fases com barra de progresso, que levam à fase na jornada.
- Convite para o guia completo.
- Blog: um slideshow com 4 artigos e mais 3 ao lado, sorteados a cada visita, e os demais em `More articles`, em 2 colunas.

### 5.1.1 Guia completo (`guide.html`)
- As 31 etapas com texto, checklist e dica, em acordeão por fase, legíveis sem conta e sem JavaScript.
- Cada etapa tem o link "Open in my journey"; a etapa 1 também tem "Open the calculator", e a do Help to Buy tem passo a passo ("How to apply") e links para a Revenue.

### 5.1.2 Blog (`blog/<slug>.html`)
- 20 artigos sobre compra de imóvel na Irlanda: programas do governo (Help to Buy, First Home Scheme, Local Authority Home Loan), dinheiro (entrada, custos, taxas, seguros, alugar ou comprar), compra (AIP, lances, visitas, profissionais, imóvel novo ou usado), recém-chegados (permissão, renda do exterior, histórico de crédito), energia (BER e grants da SEAI) e mudança (troca de endereço, LPT, snag list).
- Escritos como por profissionais do setor, com números de 2026 e links para as fontes oficiais.
- Cada artigo tem imagem no topo (a mesma dos cartões da Home), categoria, tempo de leitura, cita o My journey no texto, termina com uma caixa que leva à etapa relacionada e mostra 3 artigos semelhantes.
- O blog é todo em inglês (a seção da Home e as páginas dos artigos, com categorias, botões e rótulos), em qualquer idioma do site. Só o cabeçalho e o rodapé seguem o idioma escolhido.

### 5.2 My journey
- 31 etapas em 6 fases: Preparation (6), Approval in Principle (5), Search & Bidding (5), Legal & Contracts (5), Keys in Hand (4), Settling In (6).
- 24 etapas obrigatórias ("blocking") e 7 opcionais.
- Desbloqueio em ordem: uma etapa só pode ser **concluída** depois de todas as obrigatórias anteriores. Qualquer etapa pode ser **lida** a qualquer momento.
- Painel de detalhe com ilustração da etapa, tempo, custo, texto, "Your numbers" (números da pessoa, quando a etapa tem), checklist, passo a passo e links externos (quando a etapa tem), dica e ações (concluir, anterior, próxima).
- Cada uma das 31 etapas tem uma ilustração própria, no estilo da marca, também exibida no guia.
- Progresso: anel de %, contagem de etapas, "Next up" e "Reset progress". O XP (25 por etapa) aparece só no Dashboard.

### 5.3 Calculadora de poder de compra
- Perfil: primeira compra ou mudança de imóvel; compra sozinho ou conjunta; imóvel usado, casa nova ou apartamento novo.
- Entradas: salário(s), poupança, presente familiar, Help to Buy, preço-alvo, taxa de juros e prazo (os dois últimos em sliders).
- Saídas: preço máximo, empréstimo máximo, fundos disponíveis, detalhamento de custos (imposto de selo por faixas), veredito e prestação mensal estimada, logo abaixo do formulário.
- **É o primeiro passo da jornada:** "Save to my journey" conclui a etapa 1, e as etapas seguintes passam a mostrar os números da pessoa (entrada, custos extras, Help to Buy).

### 5.4 Contas
- Cadastro com nome, e-mail, senha e confirmação de senha, **ou "Continue with Google"** (entrar e criar conta com a conta Google, sem senha no site).
- Senha forte: pelo menos 8 caracteres, 1 maiúscula e 1 caractere especial.
- Confirmação de e-mail, login, logout e redefinição de senha, com e-mails no visual da marca.
- Progresso salvo na nuvem e sincronizado entre aparelhos.
- **Apagar a conta** pelo próprio site, em My profile (sem precisar mandar e-mail).
- A etapa **"Create your ÉireHome Flow account"** (última da fase 1) é obrigatória e é marcada sozinha quando a pessoa entra na conta.

### 5.5 Área logada
- No topo, um círculo com as iniciais do primeiro e do último nome ("Rodrigo Andrade Brigido" vira RB) substitui o botão "Sign in".
- O círculo abre um menu com nome e e-mail e as opções **Dashboard**, **My profile** e **Sign out**. A troca de senha fica só dentro de My profile.
- **Dashboard** (`dashboard.html`): página com progresso geral, fase atual, XP, próxima etapa, progresso por fase, os números da calculadora e os dados da conta.
- **My profile** (`profile.html`): editar o nome, ver e-mail e data de cadastro, trocar a senha, sair.
- **Páginas de conta:** `signin.html`, `signup.html`, `forgot-password.html` e `new-password.html`, com retorno para a página de origem (`?next=`).
- **Avisos (toasts):** confirmação de e-mail ao voltar do link, link expirado, boas-vindas ao entrar, saída, perfil salvo e senha alterada.

### 5.6 Páginas do rodapé
- **Privacy Policy** (`privacy.html`) e **Terms of Use** (`terms.html`), com links no rodapé de todas as páginas, no cadastro (aceite ao criar a conta) e no perfil.

### 5.6.1 Contato (`contact.html`)
- Formulário com nome, e-mail, assunto (dúvida sobre o guia, calculadora, conta, correção, ideia, outro) e mensagem.
- O botão abre o aplicativo de e-mail da pessoa com a mensagem pronta para eirehomeflow@gmail.com; nada é enviado nem guardado pelo site. Logado, nome e e-mail já vêm preenchidos.
- Ao lado: o endereço de e-mail, o prazo de resposta e "Before you write" (o site não dá aconselhamento, como apagar a conta, como apontar um erro).

### 5.6.2 Mapa do site (`sitemap.html` e `sitemap.xml`)
- Página com todos os lugares do site: páginas principais, conta, páginas sobre o site, as 6 fases e as 31 etapas da jornada (cada uma abre a etapa) e os 20 artigos do blog por categoria (em inglês).
- `sitemap.xml` para buscadores, com as páginas públicas e os artigos, gerado por `npm run posts`.

### 5.7 Persistência sem conta
- Progresso e valores da calculadora ficam salvos no navegador.

### 5.8 Idiomas
- O site inteiro (navegação, as 31 etapas, calculadora, contas, avisos, erros, textos para leitor de tela) está em inglês, português do Brasil, espanhol, francês, alemão, italiano, polonês, romeno e lituano.
- Na primeira visita, o site segue o idioma do navegador; sem idioma disponível, abre em inglês.
- Menu de idiomas no cabeçalho, com os nomes na própria língua. A escolha fica salva no navegador e nunca é trocada pela detecção.
- Regras, valores e nomes oficiais irlandeses (Help to Buy, AIP, Revenue...) são os mesmos em todos os idiomas; os nomes oficiais ficam em inglês, com explicação.
- Nas páginas legais, o resumo e a moldura são traduzidos; o texto integral continua em inglês, com aviso. Os e-mails de conta continuam em inglês.
- O blog (a seção da Home e os artigos) é todo em inglês; nele, só o cabeçalho e o rodapé seguem o idioma.
- Detalhes: `specs/08-Internationalisation.md`.

## 6. Requisitos funcionais

| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-01 | Mostrar o guia completo sem login | As 31 etapas aparecem no HTML de `guide.html`, legíveis com JavaScript desligado |
| RF-02 | Desbloqueio em ordem | Etapa só conclui se todas as obrigatórias anteriores estiverem feitas; a etapa bloqueada mostra quem a bloqueia. Exceção: a etapa de conta (automática) é marcada ao entrar, mesmo com etapas anteriores pendentes |
| RF-03 | Leitura livre | Qualquer etapa abre no painel de detalhe, inclusive as bloqueadas |
| RF-04 | Etapa de conta automática | Sem login, o botão é "Create account or sign in" e leva a `signup.html`, que devolve a pessoa à etapa depois; ao entrar, a etapa fica feita sem clique |
| RF-05 | Salvar progresso local | Recarregar a página mantém etapas feitas e valores da calculadora |
| RF-06 | Sincronizar com a conta | Ao entrar, progresso local e da conta são somados e gravados; cada mudança posterior é gravada na conta |
| RF-07 | Logout limpa o navegador | Após "Sign out", nenhuma etapa aparece como feita neste navegador |
| RF-08 | Senha forte | Cadastro e nova senha exigem 8+ caracteres, 1 maiúscula e 1 especial; a lista de requisitos marca cada item ao digitar |
| RF-09 | Confirmação de senha | Senhas diferentes bloqueiam o envio com "The passwords do not match." |
| RF-10 | Redefinir senha | "Forgot your password?" envia e-mail; o link leva a `new-password.html` |
| RF-11 | Preço máximo correto | Com os valores padrão, o preço máximo é €209,851 (ver TRD, seção 6) |
| RF-12 | Veredito honesto | O veredito avalia dinheiro em caixa e limite do empréstimo separadamente, com 4 estados; verde só quando os dois passam |
| RF-13 | Regra de entrada | Entrada mínima de 10% para primeira compra e para quem já teve imóvel; limite de 4× (primeira compra) ou 3,5× (mudança) |
| RF-14 | Funcionar no celular | Nenhuma tela tem rolagem horizontal entre 320px e 1440px |
| RF-15 | Acessibilidade | Estados das etapas e opções da calculadora anunciados por leitor de tela; letreiro pausável; contraste mínimo 4,5:1 no texto |
| RF-16 | Campos inválidos em vermelho | Nome sem 2 palavras, e-mail sem "@" e "." depois dele, senha fora dos critérios ou confirmação diferente ficam com borda e fundo vermelhos e mensagem abaixo; o vermelho some ao corrigir |
| RF-17 | Aviso ao confirmar o e-mail | Ao voltar pelo link de confirmação, aparece "Your email is confirmed. Welcome to ÉireHome Flow, <nome>!" com o botão "Go to my journey"; link expirado ou usado mostra um aviso de erro |
| RF-18 | Iniciais no topo | Logado, o topo mostra um círculo com as iniciais do primeiro e do último nome (sem nome: inicial do e-mail) |
| RF-19 | Menu da conta | O círculo abre um menu com nome, e-mail, Dashboard, My profile e Sign out (sem troca de senha); fecha ao clicar fora, com Esc ou ao escolher uma opção |
| RF-20 | Dashboard | Mostra progresso, fase atual, XP, próxima etapa, as 6 fases, preço máximo, empréstimo máximo, fundos e dados da conta |
| RF-21 | Editar perfil e senha | Em My profile: salvar um novo nome (2 palavras) e acessar "Change password", que troca a senha com as regras de senha forte |
| RF-22 | Uma página por lugar | Cada destino de navegação é um `.html` com título próprio; o botão Voltar funciona; `journey.html#step-<id>` abre a etapa e sobrevive a recarregar |
| RF-23 | Ilustração por etapa | As 31 etapas têm uma ilustração própria (SVG no estilo da marca, com texto alternativo), exibida no painel da etapa e no guia |
| RF-24 | Páginas legais | `privacy.html` e `terms.html` acessíveis pelo rodapé de todas as páginas; o cadastro informa o aceite dos Termos e o conhecimento da Política |
| RF-25 | XP só no Dashboard | O topo e a jornada não mostram XP nem sequência de dias; o Dashboard mostra o XP (25 por etapa feita) |
| RF-26 | Calculadora como etapa 1 | A etapa 1 não tem "Complete step": só "Save to my journey", na calculadora, a conclui e devolve a pessoa à etapa |
| RF-27 | Números da pessoa na jornada | Depois de salvar a calculadora, as etapas 1, 2, 3 e 5 mostram preço máximo, entrada, imposto de selo e custos, e Help to Buy calculados com os números dela; os números continuam só no navegador |
| RF-28 | Campos fixos na calculadora | Trocar perfil, tipo de compra ou tipo de imóvel não move nenhum campo; o que não se aplica fica desativado e diz por quê |
| RF-29 | Imposto de selo real | 1% até €1m, 2% até €1,5m, 6% acima; em imóvel novo, sobre o preço sem IVA (13,5% em casa, 9% em apartamento) |
| RF-30 | Help to Buy com as regras da Revenue | Só primeira compra, imóvel novo, preço até €500.000 e empréstimo possível de pelo menos 70% do preço; a etapa explica quem pode, o passo a passo no myAccount e tem links para a Revenue |
| RF-31 | Painel compacto | Uma etapa comum cabe no painel sem rolar numa janela de 910px de altura útil ou mais |
| RF-32 | Entrar com Google | "Continue with Google" em `signin.html` e `signup.html` leva ao Google e volta ao site já logado, na página de onde a pessoa saiu (`?next=`), mantendo a pasta `/EireHomeFlow/` do GitHub Pages; cancelar ou dar erro mostra um aviso vermelho com "Sign in" |
| RF-33 | Apagar a conta pelo site | Em My profile, "Delete my account" pede confirmação na própria página e apaga a conta e o progresso na hora; depois a pessoa volta à Home deslogada, com o aviso "Your account and its saved progress have been deleted." |
| RF-34 | Cabeçalho no celular em 2 linhas | Até 880px, em todos os idiomas: marca, botão de idioma e "Sign in" (ou o círculo da conta) na primeira linha, os 4 links na segunda. Abaixo de 400px o botão de idioma mostra só o globo |
| RF-35 | Site em 9 idiomas | Todo texto visível ou lido por leitor de tela existe em en, pt, es, fr, de, it, pl, ro e lt; `npm run check:i18n` mostra 100% nesses idiomas |
| RF-36 | Idioma na primeira visita | Sem escolha salva, o site abre no primeiro idioma do navegador que estiver completo; sem nenhum, em inglês |
| RF-37 | Escolha de idioma salva | O menu do cabeçalho lista os idiomas completos pelo nome na própria língua; a escolha fica salva no navegador, vale em todas as páginas e nunca é substituída pela detecção |
| RF-38 | Regras iguais em todo idioma | Cada tradução tem os mesmos números do inglês (taxas, limites, preços, datas); a calculadora dá o mesmo resultado em todos os idiomas, só com o formato local (€209,851 ou 209.851 €) |
| RF-39 | Troca de página sem inglês antes | Com os textos já copiados no navegador, a página aparece direto no idioma, sem mostrar o inglês primeiro |
| RF-40 | Idioma incompleto não é anunciado | Idioma em rascunho não aparece no menu nem é detectado; só abre com `?lang=`, e o que falta aparece em inglês |
| RF-41 | Blog na Home | Depois do convite ao guia: um slideshow com 4 artigos sorteados a cada visita (passa sozinho a cada 7 s; para ao apontar ou focar nele, com o botão Pause e com "reduzir movimento"), 3 artigos sorteados ao lado e os outros abaixo, em 2 colunas, 6 por vez com "Show more articles". Nenhum artigo aparece duas vezes |
| RF-42 | Página de artigo | Cada artigo tem página própria (`blog/<slug>.html`), com imagem no topo, categoria, título, abertura, tempo de leitura, texto, a caixa "In My journey" com botão para a etapa relacionada e 3 "Similar articles" (mesma categoria primeiro) |
| RF-43 | Blog em inglês | A seção do blog na Home e as páginas dos artigos ficam em inglês em qualquer idioma (`lang="en-IE"`), inclusive categorias, botões e rótulos; só o cabeçalho e o rodapé seguem o idioma escolhido |
| RF-44 | Artigos levam ao My journey | Todo artigo cita o My journey no texto e aponta uma etapa; `npm run check:posts` recusa um artigo sem essa ligação, sem imagem ou com travessão |
| RF-45 | Contato sem servidor | `contact.html` confere nome, e-mail e mensagem como os outros formulários e abre o aplicativo de e-mail com assunto "ÉireHome Flow: <assunto>" e o texto pronto; o site não envia nem guarda a mensagem |
| RF-46 | Rodapé completo | O rodapé de todas as páginas, artigos inclusive, tem Contact us, Sitemap, Privacy Policy e Terms of Use |
| RF-47 | Mapa do site | `sitemap.html` lista todas as páginas, as 31 etapas (cada link abre a etapa na jornada) e os 20 artigos; `sitemap.xml` lista as páginas públicas e os artigos, sem as páginas de conta, e `npm run check:posts` falha se estiver desatualizado |

## 7. Requisitos não funcionais

- **Acessibilidade:** WCAG 2.2 nível AA como meta.
- **Responsividade:** de 320px a telas largas, com breakpoints em 960px, 720px e 480px.
- **Performance:** página inicial abaixo de 500 KB; sem frameworks; fontes locais.
- **Privacidade:** nenhum rastreador de terceiros; dados da calculadora nunca saem do navegador; dados de conta hospedados na Irlanda (Supabase eu-west-1).
- **Internacionalização:** todo texto novo nasce em inglês em `docs/locales/en/` e é traduzido nos idiomas completos no mesmo trabalho (exceção: o blog, só em inglês); nenhuma tradução automática no site; cada página baixa só os textos do idioma dela (e o inglês de reserva).
- **Confiabilidade do conteúdo:** regras e valores revisados periodicamente, com data de revisão visível (pendente).
- **Hospedagem:** site estático (GitHub Pages), sem servidor próprio.
- **Navegadores:** versões atuais de Chrome, Edge, Firefox e Safari (desktop e celular).

## 8. Fora de escopo (v1)

- Aconselhamento financeiro personalizado ou recomendação de banco, produto ou corretor.
- Comparação de taxas de juros ou de bancos em tempo real.
- Pagamentos, assinaturas ou área paga.
- Aplicativo nativo (iOS/Android).
- Texto integral das páginas legais e e-mails de conta em outros idiomas além do inglês (por enquanto).
- Tradução do blog: fica em inglês.
- Envio do formulário de contato pelo próprio site: por enquanto ele abre o aplicativo de e-mail da pessoa.
- Login com Apple e autenticação em dois fatores.
- Compartilhamento de progresso entre duas contas (casal usa uma conta só por enquanto).

## 9. Premissas, restrições e riscos

**Premissas**
- O público lê um dos 9 idiomas do site; o texto evita jargão e explica os termos locais, que ficam em inglês porque são os que a pessoa vai ouvir de bancos, corretores e da Revenue.
- Regras de 2026: 4× / 3,5× de renda, 10% de entrada, imposto de selo de 1% até €1m (2% até €1,5m e 6% acima, sobre o preço sem IVA em imóvel novo), Help to Buy até €30.000 para imóvel novo de até €500.000, até o fim de 2029.

**Restrições**
- Sem servidor próprio: toda lógica roda no navegador; o Supabase é o único backend.
- O site precisa ser servido por HTTP (header e footer são carregados por `fetch`); não funciona abrindo o arquivo direto.

**Riscos**
| Risco | Impacto | Mitigação |
|---|---|---|
| Regras do Central Bank, Revenue ou Help to Buy mudarem | Números errados no site | Revisão periódica com data visível; fontes oficiais linkadas |
| Site ser visto como aconselhamento financeiro | Legal | Aviso claro junto aos resultados (item A8 da auditoria, pendente) |
| Limite de envio de e-mail (Gmail ~500/dia; Supabase 30/h) | Cadastros sem e-mail de confirmação | Migrar para Brevo ou Resend com domínio próprio |
| Projeto gratuito do Supabase pausar por inatividade | Login fora do ar | Monitorar; plano pago quando houver usuários |
| Etapa de conta obrigatória afastar visitantes | Menos gente na fase 2+ | Leitura continua livre; medir desistência na etapa |
| Tradução com erro de conteúdo | Regra ou valor errado num idioma | `check:i18n` compara os números de cada texto com o inglês; revisão por falantes nativos antes de divulgar em cada idioma |

## 10. Questões em aberto

1. Ferramenta de analytics e metas numéricas da seção 4.
2. Domínio próprio (ex.: eirehomeflow.ie) e e-mail no domínio (hoje o contato é eirehomeflow@gmail.com); envio do formulário de contato pelo site, sem depender do aplicativo de e-mail da pessoa.
3. Política de privacidade e termos já existem; faltam o nome legal e o endereço do responsável pelo site (marcados como TODO nas páginas), a revisão das escolhas marcadas como POLICY CHOICE e uma página "About".
4. Itens abertos da auditoria (`AUDITORIA.md`): A8 e M1 a M22, priorizados no Implementation Plan.
5. Conteúdo específico para imigrantes (residência, renda no exterior, histórico de crédito).
6. Números dos artigos do blog (Help to Buy, First Home Scheme, LAHL, grants da SEAI, LPT): revisar a cada Budget e quando os programas mudarem.
7. Revisão das traduções por falantes nativos; tradução do texto integral das páginas legais depois de fechar os itens em aberto delas; e-mails de conta em outros idiomas.
