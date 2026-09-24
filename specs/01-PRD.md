# PRD: Product Requirements Document

Produto: ÉireHome Flow · Versão do documento: 1.2 · Última revisão: 24/09/2026 · Dono: Rodrigo

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

Idioma do site: inglês (en-IE). Mercado: República da Irlanda.

## 4. Objetivos e métricas

| Objetivo | Métrica | Meta inicial |
|---|---|---|
| A pessoa entende o caminho completo | % de visitantes que abrem ao menos 1 fase do guia ou 1 etapa da jornada | a definir |
| A pessoa volta e continua | % de contas com progresso atualizado em mais de 1 dia | a definir |
| A calculadora é útil | % de visitas que usam a calculadora | a definir |
| Criação de conta | contas confirmadas por semana | a definir |

Hoje o site **não tem analytics**. Definir a ferramenta (preferência por uma sem cookies, ex.: Plausible ou Umami) e as metas é uma questão em aberto (seção 10).

## 5. Escopo atual (v1)

**Uma página por lugar:** todo clique que leva a outro lugar abre um `.html` próprio (Home, Guide, My journey, Calculator, Dashboard, My profile, Sign in, Create account, Forgot password, New password, Privacy Policy, Terms of Use). Cabeçalho e rodapé são compartilhados entre as páginas.

### 5.1 Home
- Hero com chamada, botões "Start/Resume my journey" e "Buying power calculator".
- Letreiro (ticker) com números-chave, com botão de pausa.
- Três cartões de números: limite de 4×, entrada mínima de 10%, custos fora do empréstimo.
- Cartões das 6 fases com barra de progresso, que levam à fase na jornada.
- Convite para o guia completo.

### 5.1.1 Guia completo (`guide.html`)
- As 31 etapas com texto, checklist e dica, em acordeão por fase, legíveis sem conta e sem JavaScript.
- Cada etapa tem o link "Open in my journey".

### 5.2 My journey
- 31 etapas em 6 fases: Preparation (6), Approval in Principle (5), Search & Bidding (5), Legal & Contracts (5), Keys in Hand (4), Settling In (6).
- 24 etapas obrigatórias ("blocking") e 7 opcionais.
- Desbloqueio em ordem: uma etapa só pode ser **concluída** depois de todas as obrigatórias anteriores. Qualquer etapa pode ser **lida** a qualquer momento.
- Painel de detalhe com ilustração da etapa, tempo, custo, texto, checklist, dica e ações (concluir, anterior, próxima).
- Cada uma das 31 etapas tem uma ilustração própria, no estilo da marca, também exibida no guia.
- Progresso: anel de %, contagem, "streak", XP (25 por etapa), "Next up" e "Reset progress".

### 5.3 Calculadora de poder de compra
- Perfil: primeira compra ou mudança de imóvel; compra sozinho ou conjunta.
- Entradas: salário(s), poupança, presente familiar, Help to Buy, preço-alvo, taxa de juros, prazo.
- Saídas: preço máximo, empréstimo máximo, fundos disponíveis, detalhamento de custos, veredito e prestação mensal estimada.

### 5.4 Contas
- Cadastro com nome, e-mail, senha e confirmação de senha.
- Senha forte: pelo menos 8 caracteres, 1 maiúscula e 1 caractere especial.
- Confirmação de e-mail, login, logout e redefinição de senha, com e-mails no visual da marca.
- Progresso salvo na nuvem e sincronizado entre aparelhos.
- A etapa **"Create your ÉireHome Flow account"** (última da fase 1) é obrigatória e só pode ser concluída com a pessoa logada.

### 5.5 Área logada
- No topo, um círculo com as iniciais do primeiro e do último nome ("Rodrigo Andrade Brigido" vira RB) substitui o botão "Sign in".
- O círculo abre um menu com nome e e-mail e as opções **Dashboard**, **My profile** e **Sign out**. A troca de senha fica só dentro de My profile.
- No topo, um único indicador amarelo "★ N XP".
- **Dashboard** (`dashboard.html`): página com progresso geral, fase atual, XP, próxima etapa, progresso por fase, os números da calculadora e os dados da conta.
- **My profile** (`profile.html`): editar o nome, ver e-mail e data de cadastro, trocar a senha, sair.
- **Páginas de conta:** `signin.html`, `signup.html`, `forgot-password.html` e `new-password.html`, com retorno para a página de origem (`?next=`).
- **Avisos (toasts):** confirmação de e-mail ao voltar do link, link expirado, boas-vindas ao entrar, saída, perfil salvo e senha alterada.

### 5.6 Páginas legais
- **Privacy Policy** (`privacy.html`) e **Terms of Use** (`terms.html`), com links no rodapé de todas as páginas, no cadastro (aceite ao criar a conta) e no perfil.

### 5.7 Persistência sem conta
- Progresso e valores da calculadora ficam salvos no navegador.

## 6. Requisitos funcionais

| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-01 | Mostrar o guia completo sem login | As 31 etapas aparecem no HTML de `guide.html`, legíveis com JavaScript desligado |
| RF-02 | Desbloqueio em ordem | Etapa só conclui se todas as obrigatórias anteriores estiverem feitas; a etapa bloqueada mostra quem a bloqueia |
| RF-03 | Leitura livre | Qualquer etapa abre no painel de detalhe, inclusive as bloqueadas |
| RF-04 | Etapa de conta | Sem login, o botão vira "Create account or sign in" e leva a `signup.html`, que devolve a pessoa à etapa depois; com login, conclui normalmente |
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
| RF-25 | Indicador de XP | O topo mostra só "★ N XP" em amarelo |

## 7. Requisitos não funcionais

- **Acessibilidade:** WCAG 2.2 nível AA como meta.
- **Responsividade:** de 320px a telas largas, com breakpoints em 960px, 720px e 480px.
- **Performance:** página inicial abaixo de 500 KB; sem frameworks; fontes locais.
- **Privacidade:** nenhum rastreador de terceiros; dados da calculadora nunca saem do navegador; dados de conta hospedados na Irlanda (Supabase eu-west-1).
- **Confiabilidade do conteúdo:** regras e valores revisados periodicamente, com data de revisão visível (pendente).
- **Hospedagem:** site estático (GitHub Pages), sem servidor próprio.
- **Navegadores:** versões atuais de Chrome, Edge, Firefox e Safari (desktop e celular).

## 8. Fora de escopo (v1)

- Aconselhamento financeiro personalizado ou recomendação de banco, produto ou corretor.
- Comparação de taxas de juros ou de bancos em tempo real.
- Pagamentos, assinaturas ou área paga.
- Aplicativo nativo (iOS/Android).
- Outros idiomas além do inglês.
- Login social (Google, Apple) e autenticação em dois fatores.
- Compartilhamento de progresso entre duas contas (casal usa uma conta só por enquanto).

## 9. Premissas, restrições e riscos

**Premissas**
- O público lê inglês; o texto evita jargão e explica termos locais.
- Regras de 2026: 4× / 3,5× de renda, 10% de entrada, imposto de selo 1% até €1m, Help to Buy até €30.000.

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

## 10. Questões em aberto

1. Ferramenta de analytics e metas numéricas da seção 4.
2. Domínio próprio (ex.: eirehomeflow.ie) e e-mail no domínio.
3. Política de privacidade e termos já existem; faltam o nome legal e o endereço do responsável pelo site (marcados como TODO nas páginas), a revisão das escolhas marcadas como POLICY CHOICE e uma página "About".
4. "Streak" hoje é `min(etapas feitas, 7)` exibido como dias; decidir entre renomear ou implementar sequência real por datas.
5. Itens abertos da auditoria (`AUDITORIA.md`): A8 e M1 a M22, priorizados no Implementation Plan.
6. Conteúdo específico para imigrantes (residência, renda no exterior, histórico de crédito).
