# Backend Schema

Produto: ÉireHome Flow · Versão do documento: 1.1 · Última revisão: 24/09/2026

O único backend é o **Supabase** (Auth + Postgres + Storage). O site é estático e fala com o Supabase direto do navegador, usando a chave publicável. Toda a proteção de dados é feita por Row Level Security (RLS).

## 1. Projeto

| Item | Valor |
|---|---|
| Project ref | `dyfxstpbzmihtmccaezs` |
| URL | `https://dyfxstpbzmihtmccaezs.supabase.co` |
| Região | West EU (Ireland), `eu-west-1` |
| Chave usada no site | publishable (`sb_publishable_...`), em `docs/js/config.js` |
| Chave que **nunca** vai para o site | `service_role` / `secret` |
| Biblioteca | `@supabase/supabase-js@2` (UMD, via jsDelivr) |

## 2. Modelo de dados

```
auth.users (gerenciada pelo Supabase)
  id                 uuid  PK
  email              text
  raw_user_meta_data jsonb  → { "full_name": "Rodrigo Brigido" }
  ...
        │ 1
        │
        │ 0..1
public.progress
  user_id    uuid         PK, FK → auth.users(id) ON DELETE CASCADE
  done       jsonb        NOT NULL DEFAULT '{}'
  updated_at timestamptz  NOT NULL DEFAULT now()
```

### 2.1 `auth.users`
Tabela interna do Supabase Auth. O site grava apenas:
- `email` e senha (hash), via `signUp`;
- `user_metadata.full_name`, o nome digitado no cadastro (via `options.data`) e alterado no perfil (via `updateUser({ data })`).

Nos modelos de e-mail, o nome fica disponível como `{{ .Data.full_name }}`.

### 2.2 `public.progress`
Uma linha por usuário com o mapa de etapas concluídas.

```sql
create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  done jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
```

Exemplo de linha:

```json
{
  "user_id": "3f1c...",
  "done": {
    "preparation-0": true,
    "preparation-1": true,
    "preparation-2": true,
    "preparation-3": true,
    "preparation-5": true,
    "aip-0": true,
    "search-1": false
  },
  "updated_at": "2026-09-24T10:31:07.221Z"
}
```

- Chave: ID da etapa (seção 4). Valor `true` = feita; `false` ou ausente = não feita.
- A linha é criada na primeira gravação (`upsert`) e substituída inteira a cada mudança.

## 3. Segurança (Row Level Security)

```sql
alter table public.progress enable row level security;

create policy "Users read their own progress" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users add their own progress" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users update their own progress" on public.progress
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
```

- Visitante sem login: `select` volta vazio e `insert` é recusado ("violates row-level security policy"). Isso foi verificado em 24/09/2026.
- Não existe política de `delete` para o usuário: ninguém apaga a própria linha pelo site. Apagar o usuário no painel apaga a linha por `cascade`.

## 4. IDs das etapas (permanentes)

O ID é `<slug da fase>-<posição na fase, a partir de 0>`, gerado a partir da ordem das etapas no `docs/guide.html`.

| ID | Etapa | Tipo |
|---|---|---|
| `preparation-0` | Calculate my buying power | obrigatória |
| `preparation-1` | Confirm the 10% deposit | obrigatória |
| `preparation-2` | Set aside cash for the extra costs | obrigatória |
| `preparation-3` | Keep the bank account clean for six months | obrigatória |
| `preparation-4` | Check Help to Buy eligibility | opcional |
| `preparation-5` | Create your ÉireHome Flow account | obrigatória (conta) |
| `aip-0` | Choose a bank direct or a broker | obrigatória |
| `aip-1` | Gather six months of bank statements | obrigatória |
| `aip-2` | Gather payslips and the Employment Detail Summary | obrigatória |
| `aip-3` | Evidence rent and savings | obrigatória |
| `aip-4` | Receive the AIP letter | obrigatória |
| `search-0` | Pick an area, check sold prices | obrigatória |
| `search-1` | Learn the Irish vocabulary | opcional |
| `search-2` | Book viewings | obrigatória |
| `search-3` | Log every bid | obrigatória |
| `search-4` | Reach Sale Agreed | obrigatória |
| `legal-0` | Hire a solicitor | obrigatória |
| `legal-1` | Book the structural survey | obrigatória |
| `legal-2` | Request the lender's valuation | obrigatória |
| `legal-3` | Take out mortgage protection and home insurance | obrigatória |
| `legal-4` | Sign contracts and pay the deposit | obrigatória |
| `keys-0` | Receive the final loan offer | obrigatória |
| `keys-1` | Draw down the funds | obrigatória |
| `keys-2` | Close and collect the keys | obrigatória |
| `keys-3` | Walk the snag list | opcional |
| `settling-0` | Switch the utilities into your name | obrigatória |
| `settling-1` | Register for Local Property Tax | obrigatória |
| `settling-2` | Set a furnishing budget by room | opcional |
| `settling-3` | Floors before furniture | opcional |
| `settling-4` | Measure for curtains and blinds | opcional |
| `settling-5` | Service the boiler and test the alarms | opcional |

### Regras para mudar etapas
- **Pode:** mudar título, texto, checklist, dica, tempo e custo de uma etapa (o ID não muda).
- **Pode:** acrescentar uma etapa **no fim** de uma fase (ela recebe o próximo índice).
- **Não pode sem migração:** inserir uma etapa no meio de uma fase, reordenar etapas, mover etapa entre fases ou mudar o `data-slug` de uma fase. Isso muda os IDs das etapas seguintes, e o progresso salvo passa a apontar para a etapa errada.
- Se for inevitável, escreva uma migração SQL que renomeie as chaves em `progress.done` e atualize esta tabela no mesmo trabalho. Exemplo:

```sql
-- exemplo: nova etapa inserida na posição 3 da fase aip.
-- aip-3 vira aip-4 e aip-4 vira aip-5. Renomeie do último para o primeiro,
-- senão uma chave sobrescreve a outra.
update public.progress
set done = (done - 'aip-4') || jsonb_build_object('aip-5', done->'aip-4')
where done ? 'aip-4';

update public.progress
set done = (done - 'aip-3') || jsonb_build_object('aip-4', done->'aip-3')
where done ? 'aip-3';
```

## 5. Operações feitas pelo site

| Operação | Chamada (`account.js`) | Quando |
|---|---|---|
| Cadastro | `auth.signUp({ email, password, options: { emailRedirectTo, data: { full_name } } })` | `signup.html` |
| Login | `auth.signInWithPassword({ email, password })` | `signin.html` |
| Logout | `auth.signOut()` | Menu da conta e `profile.html` |
| Pedir redefinição | `auth.resetPasswordForEmail(email, { redirectTo })` | `forgot-password.html` |
| Nova senha | `auth.updateUser({ password })` | `new-password.html` |
| Mudar o nome | `auth.updateUser({ data: { full_name } })` | `profile.html` |
| Ler progresso | `from("progress").select("done").eq("user_id", id).maybeSingle()` | Ao entrar |
| Gravar progresso | `from("progress").upsert({ user_id, done, updated_at })` | Ao entrar (soma) e a cada mudança |

`emailRedirectTo` e `redirectTo` são sempre o endereço base do site (`Account.homeUrl()`, a pasta onde está o `index.html`). A Home trata o retorno: mostra o aviso de confirmação ou, no caso de senha, redireciona para `new-password.html`. Por isso as Redirect URLs só precisam do endereço base.

## 6. Configuração do Auth (painel)

| Onde | Configuração |
|---|---|
| Authentication → Sign In / Providers → Email | Email ativado; **Confirm email** ligado; **Minimum password length = 8** |
| Authentication → URL Configuration | **Site URL** = endereço de produção; **Redirect URLs** = produção + `http://localhost:8000/` |
| Authentication → Emails → SMTP Settings | SMTP próprio (Gmail com senha de app, ou Brevo/Resend) |
| Authentication → Rate Limits | E-mails por hora: 30 (padrão com SMTP próprio) |
| Authentication → Emails → Templates | Modelos da seção 7 |

A regra de senha do site (maiúscula + especial) é validada no navegador. O Supabase não tem essa combinação exata no servidor. A opção mais próxima, "Lowercase, uppercase letters, digits and symbols", também exige minúscula e número. Se ela for ativada, a regra do site precisa ser ampliada no mesmo trabalho.

## 7. E-mails e marca

| Modelo no Supabase | Assunto | Arquivo |
|---|---|---|
| Confirm sign up | `Confirm your email for ÉireHome Flow` | `supabase/email-templates/confirm-signup.html` |
| Reset password | `Reset your ÉireHome Flow password` | `supabase/email-templates/reset-password.html` |

Variáveis usadas: `{{ .Email }}` e `{{ .ConfirmationURL }}`. Disponível e ainda não usada: `{{ .Data.full_name }}`.

**Logo:** `docs/img/brand/eirehome-flow-logo.png` (498×112 px, exibida a 220px de largura), publicada pelo GitHub Pages junto com o site. Não usa Storage do Supabase. URL nos modelos:
`https://codebybrigido.github.io/EireHomeFlow/img/brand/eirehome-flow-logo.png`
Se o endereço do site mudar, troque a URL nos dois modelos e cole-os de novo no Supabase.

**Limites de envio:**
- Envio padrão do Supabase: só para a equipe do projeto, 2 por hora.
- Gmail com senha de app: cerca de 500 por dia.
- Para produção, o recomendado é Brevo ou Resend com domínio próprio.

## 8. Privacidade e GDPR

- **Dados pessoais guardados:** nome, e-mail, hash da senha, datas de acesso (gerenciados pelo Supabase) e o mapa de etapas feitas.
- **Dados que nunca saem do navegador:** salário, poupança, presente, preço e tudo o mais da calculadora.
- **Localização:** Irlanda (eu-west-1).
- **Exclusão:** Authentication → Users → Delete user apaga o usuário e, por cascata, o progresso.
- **Pendente antes do lançamento:** política de privacidade, contato para pedidos de exclusão ou acesso, e prazo de retenção de contas inativas.

## 9. Evoluções previstas (não implementadas)

- Tabela de auditoria de mudanças no progresso, só se houver necessidade de suporte.
- Datas de conclusão por etapa (`done` como `{ id: timestamp }`), para um "streak" real por dias. Exige migração do formato de `done` e ajuste em `app.js`.
- Compartilhamento de progresso entre duas contas (casal): tabela `households` e políticas RLS próprias.
