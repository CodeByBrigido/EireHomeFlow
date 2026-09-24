# Implementation Plan

Produto: ÉireHome Flow · Versão do documento: 1.2 · Última revisão: 24/09/2026

Como usar: no início de cada sessão de trabalho, abra este arquivo, pegue o **próximo marco não concluído** e siga as tarefas na ordem. Ao terminar uma tarefa, marque `[x]` e atualize os outros documentos afetados.

Os códigos A8, M1 e similares vêm de `AUDITORIA.md`.

## Concluído

### Marco 0: Reestruturação (23/09/2026) ✅
- [x] Bundle do Claude Design (852 KB, runtime proprietário + React) substituído por HTML/CSS/JS puros
- [x] Arquivos separados: `index.html`, `partials/header.html`, `partials/footer.html`, `css/styles.css`, `js/*.js`
- [x] Marcas de IA removidas do texto (travessões, meias-riscas, "≈", clichês) e do código
- [x] Backup do original em `_original/`
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
- [x] Capa em WebP com `srcset` (600/900/1200px), de 298 KB para 55-179 KB conforme a tela (M20). O registro C2PA da imagem original não foi mantido, por decisão do Rodrigo
- [x] `privacy.html` e `terms.html`, com links no rodapé, no cadastro, nas páginas de conta e no perfil

## Próximos marcos

### Marco 4: Contas funcionando de verdade
Responsável: Rodrigo (painel do Supabase e conta Google), com apoio do Claude.
- [ ] SMTP: ativar a verificação em duas etapas no Google e gerar a senha de app, **ou** criar conta no Brevo
- [ ] Preencher "Enable custom SMTP" no Supabase (ver `SETUP-CONTAS.md`)
- [ ] Criar o bucket público `brand` e enviar `supabase/brand/eirehome-flow-logo.png`
- [ ] Colar os dois modelos de e-mail e os assuntos
- [ ] Definir o tamanho mínimo de senha = 8
- [ ] Teste completo em `http://localhost:8000/`: `signup.html` → e-mail → confirmação (aviso na Home) → concluir a etapa de conta → fase 2 destrava → outro navegador mostra o mesmo progresso → menu da conta → Dashboard → Perfil (mudar o nome) → Sign out → `forgot-password.html` → e-mail → `new-password.html`

**Pronto quando:** todos os passos do teste passam com uma conta real.

### Marco 5: Publicação
- [ ] `git init`, `.gitignore` (ignorar `_original/` e `.claude/`), primeiro commit
- [ ] Repositório no GitHub; GitHub Pages servindo a pasta `/docs`
- [ ] Atualizar **Site URL** e **Redirect URLs** no Supabase com o endereço publicado
- [ ] Repetir o teste do Marco 4 em produção
- [ ] (Opcional) domínio próprio, ex.: `eirehomeflow.ie`, com HTTPS

**Pronto quando:** o site está no ar e o cadastro funciona no endereço público.

### Marco 6: Confiança e requisitos legais (antes de divulgar)
- [ ] A8 aviso legal fixo logo abaixo dos resultados da calculadora; renomear para "Estimated maximum price"; vereditos com tom de estimativa
- [ ] Revisar `privacy.html` e `terms.html`: preencher os `TODO` (nome legal e endereço), decidir os `POLICY CHOICE` e, idealmente, pedir uma revisão jurídica
- [ ] Página "About" com quem mantém o site e um contato
- [ ] M16 links para fontes oficiais (Central Bank, Revenue, Citizens Information) e "Last reviewed: mês/ano"

**Pronto quando:** um visitante sabe quem está por trás do site, de onde vêm os números e o que é feito com o e-mail dele.

### Marco 7: Precisão da calculadora e do conteúdo
- [ ] M1 Help to Buy: teto de €500.000 no valor do imóvel, pergunta "new build?", exigência de empréstimo ≥ 70%
- [ ] M2 custos consistentes em todo o site (€3,550 vs €3,050) e IVA de 23% no solicitor
- [ ] M3 validação dos campos (negativos, vazios, prazo fora de 5-35 anos)
- [ ] Imposto de selo por faixas (1% até €1m, 2% até €1,5m, 6% acima)
- [ ] Corrigir a dica "rationed each quarter" sobre as exceções ao limite de renda (a cota é anual)
- [ ] M17 rever quais etapas são "Optional"
- [ ] M9 chip de custo sem o "€ " duplicado

**Pronto quando:** os valores de referência do TRD (seção 12.1) estiverem atualizados e conferidos.

### Marco 8: Jornada e navegação
- [ ] M4 decidir "streak": renomear ("Steps done") ou implementar por datas (exige mudar `done`, ver Backend Schema seção 9)
- [ ] M5 estado final coerente (nota do selo final; "Next up" quando só faltam opcionais)
- [ ] M10 painel da etapa com altura máxima e rolagem interna em notebooks
- [ ] Confirmação antes de "Reset progress"
- [ ] M12 a M14 foco, anúncios e títulos para leitor de tela

### Marco 9: SEO e divulgação
- [ ] M15 meta description, Open Graph e Twitter card, favicon, canonical, `robots.txt`, `sitemap.xml`, página 404
- [ ] Título da página mais descritivo

### Marco 10: Qualidade e manutenção
- [ ] Testes automáticos da calculadora (página `tests.html` que roda `calc()` contra os valores de referência)
- [ ] `README.md` do repositório, licença e `fonts/OFL.txt` (M21)
- [ ] M22 constantes regulatórias num único objeto `RULES`
- [ ] Escolher analytics sem cookies (Plausible ou Umami) e definir as metas do PRD

### Marco 11: Conteúdo para imigrantes
- [ ] M19 glossário acessível desde o início (AIP, EDS, DIRT, BER, outlays...)
- [ ] Seção para quem veio de fora: residência e vistos, renda no exterior, histórico de crédito, imóvel no país de origem

## Definição de pronto (vale para toda tarefa)

1. Funciona no navegador em desktop e em 375px, sem erros no console.
2. Passa no roteiro de testes do TRD (seção 12) nas partes afetadas.
3. Texto novo segue o tom de voz (UI/UX seção 2): sem travessões, sem clichês.
4. Documentos em `specs/` atualizados, com a data de revisão.
5. Nenhum ID de etapa mudou sem migração (Backend Schema seção 4).
