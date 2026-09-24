# App Flow

Produto: ÉireHome Flow · Versão do documento: 1.3 · Última revisão: 24/09/2026

Os diagramas usam Mermaid (renderizado no GitHub e no VS Code com a extensão de preview). Cada caixa com `.html` é uma página própria.

## 1. Mapa do site

```mermaid
flowchart LR
  H[index.html] -->|Guide / Open the guide| G[guide.html]
  H -->|My journey / Start or Resume / cartão de fase| J[journey.html]
  H -->|Calculator| C[calculator.html]
  G -->|Open in my journey| J
  C -->|Save to my journey: marca a etapa 1| J
  J -->|Open the calculator / Change my numbers| C
  J -->|Create account or sign in na etapa de conta| SU[signup.html]
  H & G & J & C -->|Sign in| SI[signin.html]
  SI <-->|links| SU
  SI -->|Forgot your password?| FP[forgot-password.html]
  SI -->|depois de entrar, ou ?next=| D[dashboard.html]
  D -->|menu / My profile| P[profile.html]
  P -->|Change password| NP[new-password.html]
  H & SU & P -->|rodapé, cadastro, perfil| LG[privacy.html e terms.html]
  E1[Link do e-mail de confirmação] --> H
  E2[Link do e-mail de senha] --> H -->|redireciona| NP
```

## 2. Primeira visita

1. O visitante chega à Home. Sem progresso salvo, o botão diz "Start my journey".
2. Pode ler o guia completo (`guide.html`), usar a calculadora ou abrir a jornada, sem conta.
3. Na jornada, "Calculate my buying power" aparece como atual ("Start here"); as demais obrigatórias aparecem bloqueadas.
4. A etapa 1 só se conclui pela calculadora: "Open the calculator" → preenche → "Save to my journey" → volta à etapa 1 marcada, com os números da pessoa. Daí em diante, as etapas 2, 3 e 5 mostram os números dela.

## 3. Regra de desbloqueio

```
unlocked = quantidade de etapas, a partir da primeira, até achar a primeira obrigatória não feita
etapa i está:
  feita      se done[id]
  atual      se i == unlocked e não feita
  bloqueada  se i > unlocked
  disponível nos demais casos
```

- Etapas **opcionais** nunca bloqueiam as seguintes.
- A etapa **de conta** (`preparation-5`) é obrigatória: sem ela, nada da fase 2 em diante pode ser concluído.
- Etapas **automáticas** (`data-auto`) não têm "Complete step": a calculadora (`preparation-0`) é marcada ao salvar na jornada, e a de conta (`preparation-5`) ao entrar. A de conta é marcada mesmo que as anteriores ainda não estejam feitas; a trilha continua parada na primeira obrigatória pendente.
- Desmarcar uma etapa obrigatória anterior volta a bloquear as seguintes; as que já estavam feitas podem ser desmarcadas.
- Etapas automáticas não têm "Mark as not done". "Reset progress" limpa tudo, menos a etapa de conta de quem está logado.

## 4. Abrir e concluir uma etapa (journey.html)

```mermaid
flowchart TD
  S[Clica num nó, Open this step, ou chega por journey.html#step-id] --> O[Painel abre; endereço vira #step-id; foco no título]
  O --> Q0{Etapa automática?}
  Q0 -->|Calculadora| C1[Open the calculator ou Change my numbers] --> C2[Save to my journey marca a etapa 1 e volta]
  Q0 -->|Conta, sem login| A[Create account or sign in → signup.html?next=journey.html#step-preparation-5] --> A2[Ao entrar, a etapa é marcada sozinha]
  Q0 -->|Conta, com login| A3[Nota: You are signed in as ..., so this step is done]
  Q0 -->|Não| Q1{Etapa já feita?}
  Q1 -->|Sim| U[Mark as not done] --> U2[Desmarca e salva]
  Q1 -->|Não| Q2{Bloqueada?}
  Q2 -->|Sim| L[Nota: You can complete it once you finish X; botão desativado]
  Q2 -->|Não| K[Complete step +25 XP] --> K2[Marca, +25 XP, salva local e na nuvem se logado]
```

"Close" fecha o painel, remove o `#step-...` do endereço e devolve o foco ao nó.

## 5. Criar conta

```mermaid
sequenceDiagram
  actor P as Pessoa
  participant SU as signup.html
  participant SB as Supabase
  participant M as Caixa de e-mail
  participant H as index.html
  P->>SU: Nome, e-mail, senha, confirmação
  SU->>SU: Valida os 4 campos (vermelho se errado)
  SU->>SB: signUp(email, senha, full_name), retorno para a Home
  SB-->>SU: conta criada, confirmação pendente
  SU-->>P: "Check your inbox and click the link..."
  SB->>M: "Confirm your email for ÉireHome Flow"
  P->>M: Clica em "Confirm email address"
  M->>H: Abre a Home com #access_token...&type=signup
  H->>SB: supabase-js cria a sessão
  SB-->>H: evento SIGNED_IN
  H->>SB: carrega e soma o progresso, marca a etapa de conta, grava de volta
  H-->>P: Aviso fixo "Your email is confirmed. Welcome..., Rodrigo!" + "Go to my journey"
  P->>H: Go to my journey → journey.html#step-preparation-5
```

Se a confirmação de e-mail estiver desligada no Supabase, o cadastro já cria a sessão: aviso "Your account is ready..." e ida direta para o `next` (ou Dashboard).

## 6. Entrar

1. "Sign in" no topo abre `signin.html` (ou `signin.html?next=...` quando vem de uma página logada).
2. E-mail e senha (sem regra de força, para não travar contas antigas).
3. Com sucesso: o aviso "Welcome back, Rodrigo." é guardado para a próxima página, e a pessoa vai para o `next` ou para o Dashboard. Lá, o evento `INITIAL_SESSION` soma e sincroniza o progresso.
4. Com erro: mensagem do Supabase (ex.: "Invalid login credentials").

## 7. Esqueci a senha e troca de senha

```mermaid
sequenceDiagram
  actor P as Pessoa
  participant FP as forgot-password.html
  participant SB as Supabase
  participant M as Caixa de e-mail
  participant H as index.html
  participant NP as new-password.html
  P->>FP: E-mail
  FP->>SB: resetPasswordForEmail(email, retorno para a Home)
  FP-->>P: "If that email has an account, a reset link is on its way."
  SB->>M: "Reset your ÉireHome Flow password"
  P->>M: Clica em "Choose a new password"
  M->>H: Abre a Home com o token de recuperação
  SB-->>H: evento PASSWORD_RECOVERY
  H->>NP: redireciona (a sessão fica salva no navegador)
  P->>NP: Nova senha + confirmação
  NP->>SB: updateUser({ password })
  NP-->>P: vai ao Dashboard com o aviso "Your password has been changed."
```

Quem já está logado usa o mesmo `new-password.html` pelo botão "Change password" de My profile. Sem sessão, a página explica como pedir um novo link.

## 8. Menu da conta

1. Logado, o topo mostra o círculo com as iniciais.
2. Clique: abre o menu (nome, e-mail, Dashboard, My profile, Sign out). Para trocar a senha, a pessoa entra em My profile e usa "Change password".
3. Fecha com clique fora, Esc ou ao escolher uma opção.

## 9. Editar o perfil (profile.html)

1. O nome vem preenchido.
2. Nome inválido fica vermelho ("Enter your first and last name.").
3. "Save changes" grava `full_name` no Supabase; chega o evento `USER_UPDATED`, as iniciais do topo se atualizam e aparece "Your profile has been updated."

## 10. Sair

"Sign out" (menu ou Perfil) encerra a sessão e apaga o progresso deste navegador. O progresso continua na conta. No Dashboard, no Perfil e em Nova senha, a pessoa volta à Home com o aviso "You have signed out..."; nas outras páginas, o aviso aparece ali mesmo.

## 11. Pessoa que volta

- **Sem conta:** progresso e calculadora restaurados do `localStorage`; "Resume my journey".
- **Com conta, no mesmo navegador:** sessão restaurada (`INITIAL_SESSION`) e progresso somado com o da nuvem.
- **Com conta, em outro aparelho:** ao entrar, o progresso da nuvem aparece.

## 12. Casos de borda

| Caso | Comportamento |
|---|---|
| Aberto via `file://` | Header, footer e lista de etapas não carregam; o console explica que é preciso servir por HTTP |
| `localStorage` bloqueado | Funciona, mas o progresso dura só a visita |
| Biblioteca do Supabase não carrega | Contas desligadas nessa visita; páginas de conta e etapa de conta avisam |
| Link do e-mail expirado ou já usado | Home mostra aviso vermelho fixo e limpa o endereço |
| `?next=` com endereço estranho | Ignorado; só são aceitos nomes de página do próprio site (ex.: `journey.html#step-aip-0`) |
| Falha ao ler o progresso da nuvem ao entrar | A etapa de conta é marcada só neste navegador; nada é gravado na conta, para não apagar o progresso salvo lá |
| Etapa 1 feita sem os números neste navegador (marcada à mão antes, ou outro aparelho) | A jornada pede "Open the calculator and choose Save to my journey"; o Dashboard mostra "Not saved yet"; a calculadora mostra "Save to my journey" |
| Página logada acessada sem login | Cartão "Sign in to see this page..." com links que voltam para a página |
| Etapa aberta e página recarregada | O `#step-id` reabre a mesma etapa |
| Visitante com versão antiga em cache | Páginas carregam CSS e JS com `?v=` (página nova busca scripts novos); o guia e os partials são sempre conferidos com o servidor; os scripts toleram partes que faltam (ver TRD, seção 10) |
