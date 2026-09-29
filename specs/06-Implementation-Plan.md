# Implementation Plan

Produto: ÉireHome Flow · Versão do documento: 1.9 · Última revisão: 29/09/2026

Como usar: no início de cada sessão de trabalho, abra este arquivo, pegue o **próximo marco não concluído** e siga as tarefas na ordem. Ao terminar uma tarefa, marque `[x]` e atualize os outros documentos afetados.

Os códigos A8, M1 e similares vêm de `AUDITORIA.md`.

## Concluído

### Marco 0: Reestruturação (23/09/2026) ✅
- [x] Bundle do Claude Design (852 KB, runtime proprietário + React) substituído por HTML/CSS/JS puros
- [x] Arquivos separados: `index.html`, `partials/header.html`, `partials/footer.html`, `css/styles.css`, `js/*.js`
- [x] Marcas de IA removidas do texto (travessões, meias-riscas, "≈", clichês) e do código
- [x] Backup do original em `_original-Backup/`
- [x] Auditoria completa (`AUDITORIA.md`)

### Marco 1: Correções prioritárias da auditoria (23/09/2026) ✅
- [x] C1 entrada de 10% também para quem já teve imóvel
- [x] C2 preço máximo considera a poupança extra
- [x] C3 veredito com 4 estados (dinheiro e empréstimo avaliados separadamente)
- [x] A1 layout responsivo (960 / 720 / 480 px), sem rolagem horizontal em 320px
- [x] A2 progresso salvo no navegador
- [x] A3 todas as etapas legíveis; bloqueio só para concluir
- [x] A4 texto das etapas no HTML (guia completo)
- [x] A5 contraste de texto ≥ 4,5:1
- [x] A6 estados anunciados por leitor de tela
- [x] A7 ticker pausável e respeito a "reduzir movimento"

### Marco 2: Contas (23 e 24/09/2026) ✅
- [x] Etapa obrigatória "Create your ÉireHome Flow account" (`preparation-5`)
- [x] Supabase: login, cadastro, logout, redefinição de senha
- [x] Progresso na nuvem com soma ao entrar e limpeza ao sair
- [x] Tabela `progress` com RLS, verificada sem login

### Marco 3: Cadastro completo e e-mails (24/09/2026) ✅
- [x] Campos nome, e-mail, senha e confirmação de senha
- [x] Senha forte (8+, maiúscula, especial) com lista de requisitos ao vivo
- [x] Campos inválidos em vermelho com mensagem (nome com 2 palavras, e-mail com "@" e ".")
- [x] Modelos de e-mail de confirmação e de senha, e logo da marca em PNG
- [x] Documentação em `specs/`

### Marco 3.1: Páginas separadas e área logada (24/09/2026) ✅
- [x] Uma página `.html` por lugar: Home, Guide, My journey, Calculator, Dashboard, My profile, Sign in, Create account, Forgot password, New password
- [x] Núcleo compartilhado `js/app.js` e um script por página em `js/pages/`
- [x] `guide.html` como fonte única do conteúdo das etapas
- [x] Endereços profundos na jornada (`#step-<id>`, `#phase-<slug>`); título por página; Voltar do navegador (M7)
- [x] Círculo com iniciais e menu da conta (Dashboard, My profile, Change password, Sign out)
- [x] Dashboard e Meu perfil (editar nome)
- [x] Avisos: e-mail confirmado, link expirado, boas-vindas, saída, perfil salvo, senha trocada
- [x] Links dos e-mails voltam sempre para a Home

### Marco 3.2: Ilustrações, XP e páginas legais (24/09/2026) ✅
- [x] Menu da conta sem "Change password" (troca de senha só em My profile)
- [x] Topo com um único "★ N XP" amarelo
- [x] 31 ilustrações SVG, uma por etapa, no painel da jornada e no guia
- [x] M10 painel da etapa com rolagem própria, altura máxima da tela e botões sempre visíveis; ilustração do painel em 340px
- [x] Capa em WebP com `srcset` (600/900/1200px), de 298 KB para 55-179 KB conforme a tela (M20). O registro C2PA da imagem original não foi mantido, por decisão do Rodrigo
- [x] `privacy.html` e `terms.html`, com links no rodapé, no cadastro, nas páginas de conta e no perfil

### Marco 3.3: Calculadora dentro da jornada (24/09/2026) ✅
- [x] Etapa 1 só se conclui pela calculadora ("Save to my journey"), que devolve a pessoa à etapa
- [x] Etapa de conta marcada sozinha ao entrar
- [x] "Your numbers" nas etapas 1, 2, 3 e 5, com os números da calculadora (só do navegador)
- [x] Campos da calculadora fixos: o que não se aplica fica desativado e diz por quê
- [x] Taxa e prazo em sliders (1-8% e 5-35 anos), o que resolve o prazo 0 ou vazio do M3
- [x] Prestação mensal logo abaixo do formulário
- [x] Imposto de selo por faixas (1% / 2% / 6%) e sobre o preço sem IVA em imóvel novo
- [x] M1 Help to Buy: opções "New house" e "New apartment", teto de €500.000 e empréstimo mínimo de 70%
- [x] Etapa do Help to Buy com requisitos, passo a passo no myAccount e links para a Revenue
- [x] Dica "rationed each quarter" substituída na etapa 1
- [x] Painel da etapa mais compacto (~140px a menos numa etapa comum; ilustração em 300px)
- [x] Imóvel novo dividido em casa (IVA 13,5%) e apartamento (IVA 9% desde 08/10/2025) no imposto de selo
- [x] Help to Buy só conta onde o empréstimo pode chegar a 70% do preço (Revenue)
- [x] Dashboard e calculadora não tratam os números de exemplo como da pessoa antes de salvar
- [x] Revisão com 4 revisores independentes (código, contas e regras, acessibilidade, textos e documentos); achados conferidos e corrigidos
- [x] Versão (`?v=`) nos CSS e JS de todas as páginas; guia e partials conferidos com o servidor a cada visita

### Marco 3.4: Base de engenharia (24/09/2026) ✅
- [x] Módulos ES: `js/lib/` (lógica pura, testada no Node) e `js/core/` (navegador); um módulo por página com `startPage()`
- [x] `app.js` de 540 linhas dividido em módulos com uma responsabilidade cada
- [x] Testes automáticos (`npm test`) com os valores de referência do TRD 12.1
- [x] ESLint, `.editorconfig` e `npm start` (sem precisar de Python)
- [x] `npm run bump` e `npm run check:versions` para o `?v=`
- [x] GitHub Actions: lint, testes e versões em cada Pull Request (Node 22)
- Plano: `specs/plans/2026-09-24-engineering-foundation.md`

### Marco 3.5: Cabeçalho sem pulo (24/09/2026) ✅
- [x] M11 cabeçalho, rodapé e avisos copiados de `partials/` para as 12 páginas por `npm run partials`, em vez de chegarem por `fetch` depois da página: nada pula ao trocar de página, e aparecem mesmo sem JavaScript
- [x] Link ativo da navegação já marcado no HTML; "★ N XP" invisível (ocupando o espaço) até o primeiro `render()`, e "Sign in" ou o círculo da conta até se saber se a pessoa está logada
- [x] `npm run check:partials` no `npm run check` e no GitHub Actions
- [x] Servidor local (`npm start`) guarda fontes e imagens e responde 304, então a fonte não pisca a cada clique

### Marco 3.6: Troca de página sem piscar (27/09/2026) ✅
- [x] Cabeçalho desenhado antes da lista de etapas chegar: XP das etapas deste navegador
- [x] "Sign in" ou o círculo da conta na hora, pela sessão salva no navegador; o Supabase confere depois. Só a volta de link de e-mail espera
- [x] Dashboard e Perfil abertos na hora para quem entrou neste navegador; sair e salvar o nome esperam o Supabase
- [x] Biblioteca do Supabase começa a baixar junto com a página
- [x] Transição suave entre páginas (`@view-transition`), com o cabeçalho parado; desligada com "reduzir movimento"

### Marco 3.7: Entrar com Google (28/09/2026) ✅
- [x] "Continue with Google" em `signin.html` e `signup.html`, com estados de carregando e de erro
- [x] Volta pela pasta do site (`/EireHomeFlow/`) e segue para a página de onde a pessoa saiu
- [x] Nome escolhido em My profile (`display_name`) não é apagado por um novo login com Google
- [x] Privacy Policy e Terms of Use atualizados (Google como forma de entrar, `eirehome-google`, exclusão pela própria pessoa); trecho antigo sobre a logo dos e-mails no Supabase corrigido
- [x] Ícone do site (casinha da logo) nas 12 páginas
- [x] Rodapé sem "Dublin" copiado para as 12 páginas (a checagem da `main` estava falhando)
- [x] Cabeçalho no celular em 2 linhas: "Sign in" ou o círculo sobem para a linha da marca
- [x] Texto corrido justificado em todo o site (justificado simples, última linha à esquerda)
- [x] "Delete my account" em My profile, com confirmação na página (função `delete_my_account()` no Supabase)
- [ ] Rodrigo: rodar o SQL da seção 2.1 do `SETUP-CONTAS.md` no Supabase antes de publicar

### Marco 3.8: Site em vários idiomas (28/09/2026) ✅
- [x] Textos em JSON por idioma e por parte do site (`docs/locales/`), com o inglês como fonte
- [x] 9 idiomas completos, com 683 textos cada: inglês, português do Brasil, espanhol, francês, alemão, italiano, polonês, romeno e lituano
- [x] Idioma do navegador na primeira visita; escolha no menu do cabeçalho salva e nunca substituída; `?lang=` para mandar um link num idioma
- [x] Página traduzida antes de aparecer, sem piscar em inglês, também nas partes montadas por JavaScript (passos, calculadora, avisos, erros do Supabase)
- [x] Números, dinheiro e datas no formato de cada idioma, com os mesmos valores e regras irlandesas
- [x] `npm run check:i18n` no `npm run check` e no GitHub Actions; testes do runtime, das ferramentas e dos formatos
- [x] Páginas legais com resumo e moldura traduzidos e texto integral em inglês, com aviso; Privacy Policy lista as chaves novas do navegador
- [x] Cabeçalho em 2 linhas até 880px em todos os idiomas; menu de idiomas rola por dentro em telas baixas
- [x] Doc 08 (Internacionalização) com a convenção obrigatória para textos novos e o glossário

### Marco 3.9: Jornada e topo mais limpos (28/09/2026) ✅
- [x] Sem "★ N XP" no topo e sem os cartões "Streak" e "Earned" na jornada; o XP fica só no Dashboard
- [x] Balões "Start here" e "Optional" continuam visíveis, menores, com uma etapa aberta

### Marco 3.10: Blog (28/09/2026) ✅
- [x] 20 artigos em inglês, escritos como por profissionais do setor, com números de 2026 conferidos nas fontes oficiais: programas do governo, dinheiro, compra, recém-chegados, energia e mudança
- [x] Cada artigo com ilustração própria, tempo de leitura, citação do My journey, caixa que leva à etapa ligada e 3 artigos semelhantes
- [x] Na Home, depois do convite ao guia: slideshow com 4 artigos sorteados, 3 ao lado e "More articles" em 2 colunas, 6 por vez
- [x] Blog todo em inglês, em qualquer idioma do site (só cabeçalho e rodapé seguem o idioma)
- [x] `npm run posts` escreve as páginas a partir de `content/blog/` e `js/lib/posts.js`; `npm run check:posts` no `npm run check` e no CI

### Marco 3.11: Contato e mapa do site (29/09/2026) ✅
- [x] `contact.html`: formulário (nome, e-mail, assunto, mensagem) com a validação dos outros formulários, que abre o aplicativo de e-mail com a mensagem pronta; nada passa por servidor
- [x] `sitemap.html`: todas as páginas, as 6 fases e as 31 etapas (cada uma abre na jornada) e os 20 artigos por categoria
- [x] `sitemap.xml` com as páginas públicas e os artigos, escrito por `npm run posts` e conferido pelo `npm run check:posts`
- [x] Rodapé com Contact us, Sitemap, Privacy Policy e Terms of Use em todas as páginas e artigos
- [x] Textos de contato e do mapa do site nos 9 idiomas

## Próximos marcos

### Marco 4: Contas funcionando de verdade
Responsável: Rodrigo (painel do Supabase e conta Google), com apoio do Claude.
- [ ] SMTP: ativar a verificação em duas etapas no Google e gerar a senha de app, **ou** criar conta no Brevo
- [ ] Preencher "Enable custom SMTP" no Supabase (ver `SETUP-CONTAS.md`)
- [x] Logo dos e-mails publicada pelo GitHub Pages (`docs/img/brand/`), sem bucket no Supabase
- [ ] Colar os dois modelos de e-mail (versão com a logo no GitHub Pages) e os assuntos
- [ ] Definir o tamanho mínimo de senha = 8
- [ ] Teste completo em `http://localhost:8000/`: `signup.html` → e-mail → confirmação (aviso na Home) → concluir a etapa de conta → fase 2 destrava → outro navegador mostra o mesmo progresso → menu da conta → Dashboard → Perfil (mudar o nome) → Sign out → `forgot-password.html` → e-mail → `new-password.html`

**Pronto quando:** todos os passos do teste passam com uma conta real.

### Marco 5: Publicação
- [x] Repositório `CodeByBrigido/EireHomeFlow` no GitHub, com `.gitignore` e `.gitattributes` (final de linha LF para todos)
- [x] GitHub Pages servindo a pasta `/docs` da `main`: `https://codebybrigido.github.io/EireHomeFlow/`
- [ ] Convidar os 4 colaboradores e proteger a `main` (mudanças só por Pull Request)
- [ ] Na proteção da `main`, exigir o check `checks` do GitHub Actions (workflow **Checks**)
- [ ] Atualizar **Site URL** e **Redirect URLs** no Supabase com o endereço publicado
- [ ] Repetir o teste do Marco 4 em produção
- [ ] (Opcional) domínio próprio, ex.: `eirehomeflow.ie`, com HTTPS

**Pronto quando:** o site está no ar e o cadastro funciona no endereço público.

### Marco 6: Confiança e requisitos legais (antes de divulgar)
- [ ] A8 aviso legal fixo logo abaixo dos resultados da calculadora; renomear para "Estimated maximum price"; vereditos com tom de estimativa
- [ ] Revisar `privacy.html` e `terms.html`: preencher os `TODO` (nome legal e endereço), decidir os `POLICY CHOICE` e, idealmente, pedir uma revisão jurídica
- [ ] Página "About" com quem mantém o site (o contato já existe em `contact.html`)
- [ ] M16 links para fontes oficiais (Central Bank, Revenue, Citizens Information) e "Last reviewed: mês/ano"
- [ ] Revisão das traduções por falantes nativos, começando pelo vocabulário financeiro. Polonês, romeno e lituano primeiro, por serem os mais novos

**Pronto quando:** um visitante sabe quem está por trás do site, de onde vêm os números e o que é feito com o e-mail dele.

### Marco 7: Precisão da calculadora e do conteúdo
- [ ] M2 custos consistentes em todo o site e IVA de 23% no solicitor. A etapa 3 já usa os €3,050 da calculadora; falta a Home ("€3,550") e decidir se o solicitor entra com IVA e outlays (muda os valores de referência do TRD)
- [ ] M3 validação dos campos de valor (negativos e vazios); taxa e prazo já estão resolvidos pelos sliders
- [ ] M17 rever quais etapas são "Optional"
- [ ] M9 chip de custo sem o "€ " duplicado
- [ ] Revisar os números dos artigos do blog a cada Budget e quando os programas mudarem (Help to Buy, First Home Scheme, LAHL, grants da SEAI, LPT)

**Pronto quando:** os valores de referência do TRD (seção 12.1) estiverem atualizados e conferidos.

### Marco 8: Jornada e navegação
- [x] M4 "streak" retirado da jornada (era `min(etapas feitas, 7)` mostrado como dias, não uma sequência real)
- [ ] M5 estado final coerente (nota do selo final; "Next up" quando só faltam opcionais)
- [ ] Confirmação antes de "Reset progress"
- [ ] M12 a M14 foco, anúncios e títulos para leitor de tela

### Marco 9: SEO e divulgação
- [x] M15 (parte) ícone do site
- [x] M15 (parte) `sitemap.xml` e página `sitemap.html`
- [ ] M15 meta description, Open Graph e Twitter card, canonical, `robots.txt` (com a linha `Sitemap:`), página 404
- [ ] Enviar `https://codebybrigido.github.io/EireHomeFlow/sitemap.xml` no Google Search Console, depois do merge
- [ ] Título da página mais descritivo
- [ ] Decidir se os idiomas precisam de endereços próprios para busca (hoje a tradução acontece no navegador, e o Google indexa o inglês)

### Marco 10: Qualidade e manutenção
- [x] Testes automáticos da calculadora (`tests/calculator.test.js`, no Node, em vez de uma página `tests.html`)
- [x] `README.md` do repositório, com o fluxo de trabalho em equipe (M21, parte 1)
- [ ] Licença e `fonts/OFL.txt` (M21, parte 2)
- [ ] M22 constantes regulatórias num único objeto `RULES` (já estão todas em `lib/calculator.js`; falta agrupar e mostrar a data da última conferência)
- [ ] Atualizar o ESLint (a versão 9 não recebe mais suporte) e, quando todos tiverem Node 22, subir `engines` para `>=22`
- [ ] Escolher analytics sem cookies (Plausible ou Umami) e definir as metas do PRD

### Marco 11: Conteúdo para imigrantes
- [ ] M19 glossário acessível desde o início (AIP, EDS, DIRT, BER, outlays...)
- [ ] Seção para quem veio de fora: residência e vistos, renda no exterior, histórico de crédito, imóvel no país de origem

## Definição de pronto (vale para toda tarefa)

1. Funciona no navegador em desktop e em 375px, sem erros no console.
2. Passa no `npm run check` e no roteiro de testes do TRD (seção 12) nas partes afetadas.
3. Texto novo segue o tom de voz (UI/UX seção 2): sem travessões, sem clichês.
4. Documentos em `specs/` atualizados, com a data de revisão.
5. Nenhum ID de etapa mudou sem migração (Backend Schema seção 4).
6. Texto novo nasce em inglês em `docs/locales/en/` e é traduzido nos outros 8 idiomas no mesmo trabalho (doc 08, seção 7). Se mudou o cabeçalho, ele continua em 2 linhas em 320px em todos os idiomas.
