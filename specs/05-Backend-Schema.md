# Backend Schema

Produto: ÉireHome Flow · Versão do documento: 1.6 · Última revisão: 29/09/2026

O único backend é o **Supabase** (Auth + Postgres + Storage + uma Edge Function). O site é estático e fala com o Supabase direto do navegador, usando a chave publicável. Toda a proteção de dados é feita por Row Level Security (RLS). A única exceção é o formulário de contato: ele passa pela Edge Function `contact` (seção 2.3), que usa a chave `service_role` dentro do Supabase e envia e-mail pelo Resend.

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
  raw_user_meta_data jsonb  → { "full_name": "Rodrigo Brigido", "display_name"?, "avatar_url"?, "name"?, "picture"? }
  ...
        │ 1
        │
        │ 0..1
public.progress
  user_id    uuid         PK, FK → auth.users(id) ON DELETE CASCADE
  done       jsonb        NOT NULL DEFAULT '{}'
  updated_at timestamptz  NOT NULL DEFAULT now()

public.contact_messages (sem ligação com auth.users; só a Edge Function "contact" lê e grava)
  id, created_at, name, email, topic, message, locale, ip_hash, emailed
```

### 2.1 `auth.users`
Tabela interna do Supabase Auth. O site grava apenas:
- `email` e senha (hash), via `signUp`;
- `user_metadata.full_name`, o nome digitado no cadastro (via `options.data`) e alterado no perfil (via `updateUser({ data })`);
- `user_metadata.display_name`, o nome definido em My profile (a partir de 28/09/2026). Tem prioridade sobre `full_name`, porque cada login com Google regrava `full_name`, `name`, `avatar_url` e `picture` com os dados da conta Google.

Quem entra com Google não tem senha. O Supabase guarda a identidade Google em `auth.identities` e copia nome, e-mail e o link da foto para `user_metadata` (o site não usa a foto).

### 2.1.1 Função `public.delete_my_account()`
Deixa a própria pessoa apagar a conta em My profile. `security definer` (roda com os direitos de quem a criou, que pode apagar em `auth.users`), `set search_path = ''`, e sem parâmetros: só apaga `auth.uid()`, então ninguém consegue apagar a conta de outra pessoa. `EXECUTE` só para `authenticated` (tirado de `public` e `anon`). O SQL está no `SETUP-CONTAS.md`, seção 2.1. Apagar em `auth.users` leva junto `public.progress` (cascade), `auth.identities`, `auth.sessions` e os tokens de atualização. Não pode haver arquivos no Storage em nome da pessoa (o site não usa Storage).

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

### 2.3 `public.contact_messages` e a Edge Function `contact`
As mensagens do formulário de ``contact.html``. O SQL está no ``SETUP-CONTAS.md``, seção 8.

| Coluna | Tipo | O que é |
|---|---|---|
| ``id`` | ``bigint`` identity, PK | |
| ``created_at`` | ``timestamptz`` | Quando chegou |
| ``name`` | ``text``, 1 a 80 caracteres | Nome digitado |
| ``email`` | ``text``, 3 a 254 | E-mail para a resposta |
| ``topic`` | ``text`` | Um de ``guide``, ``calculator``, ``account``, ``correction``, ``idea``, ``misc`` |
| ``message`` | ``text``, 1 a 1500 | A mensagem |
| ``locale`` | ``text`` | Idioma do site ao enviar (``pt``, ``de``...) ou vazio |
| ``ip_hash`` | ``text`` | HMAC-SHA256 do IP, com a chave ``service_role`` como segredo: conta as mensagens por hora sem guardar o IP |
| ``emailed`` | ``boolean`` | Se o e-mail pelo Resend saiu |

- **RLS ligado e sem nenhuma política**, e ``revoke all`` de ``anon`` e ``authenticated``: pelo site ou pela API, ninguém lê nem grava. Só a função, com ``service_role``, que ignora o RLS.
- **Função** (``supabase/functions/contact/index.js``, colada no painel com **Verify JWT desligado**): aceita só ``POST`` de ``https://codebybrigido.github.io`` e de ``localhost``/``127.0.0.1`` (CORS). Descarta sem erro quem preenche o campo escondido ``website`` (robôs); confere os campos (400); recusa a sexta mensagem do mesmo IP em uma hora (429); manda o e-mail pelo Resend (``from`` ``onboarding@resend.dev``, ``to`` eirehomeflow@gmail.com, ``reply_to`` quem escreveu) e grava a linha com ``emailed``. Responde 200 se o e-mail ou a cópia funcionou, 502 se os dois falharam.
- **Segredos:** ``SUPABASE_URL`` e ``SUPABASE_SERVICE_ROLE_KEY`` o Supabase já dá à função; ``RESEND_API_KEY`` é colado em **Edge Functions → Secrets**. Nenhum deles vai para o repositório.
- **Retenção:** 2 anos depois da última resposta (Privacy Policy); apagar com ``delete from public.contact_messages where created_at < now() - interval '2 years';``.

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

O ID é `<slug da fase>-<posição na fase, a partir de 0>`, gerado a partir da ordem das etapas no `docs/guide.html`. Os IDs não mudam com o idioma: o mesmo `progress.done` vale em qualquer um dos 9 idiomas, e a tabela abaixo mostra os títulos em inglês, a fonte dos textos.

| ID | Etapa | Tipo |
|---|---|---|
| `preparation-0` | Calculate my buying power | obrigatória, automática (`data-auto="calculator"`: marcada ao salvar a calculadora) |
| `preparation-1` | Confirm the 10% deposit | obrigatória |
| `preparation-2` | Set aside cash for the extra costs | obrigatória |
| `preparation-3` | Keep the bank account clean for six months | obrigatória |
| `preparation-4` | Check Help to Buy eligibility | opcional |
| `preparation-5` | Create your ÉireHome Flow account | obrigatória, automática (`data-auto="account"`: marcada ao entrar na conta) |
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
- **Pode:** mudar título, texto, checklist, passo a passo, links, dica, tempo e custo de uma etapa (o ID não muda).
- **Pode:** mudar `data-auto` e `data-numbers` de uma etapa. Não há mudança no banco: `done` continua guardando só `true` por ID, e os números da calculadora nunca vão para a nuvem.
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

| Operação | Chamada (`core/account.js`) | Quando |
|---|---|---|
| Cadastro | `auth.signUp({ email, password, options: { emailRedirectTo, data: { full_name } } })` | `signup.html` |
| Login | `auth.signInWithPassword({ email, password })` | `signin.html` |
| Entrar com Google | `auth.signInWithOAuth({ provider: "google", options: { redirectTo, queryParams: { prompt: "select_account" } } })` | `signin.html` e `signup.html` |
| Google ligado? | `GET /auth/v1/settings` com o header `apikey` (chave publicável): `external.google` | `signin.html` e `signup.html` |
| Logout | `auth.signOut()` | Menu da conta e `profile.html` |
| Apagar a própria conta | `rpc("delete_my_account")` e depois `auth.signOut({ scope: "local" })` | `profile.html` |
| Pedir redefinição | `auth.resetPasswordForEmail(email, { redirectTo })` | `forgot-password.html` |
| Nova senha | `auth.updateUser({ password })` | `new-password.html` |
| Mudar o nome | `auth.updateUser({ data: { display_name, full_name } })` | `profile.html` |
| Ler progresso | `from("progress").select("done").eq("user_id", id).maybeSingle()` | Ao entrar |
| Gravar progresso | `from("progress").upsert({ user_id, done, updated_at })` | Ao entrar (soma) e a cada mudança |
| Mandar mensagem de contato | `fetch(SUPABASE_URL + "/functions/v1/contact", { method: "POST", headers: { apikey } })` (`pages/contact.js`, sem `Authorization`) | `contact.html` |

`emailRedirectTo` e `redirectTo` (também no Google) são sempre o endereço base do site (`Account.homeUrl()`, a pasta onde está o `index.html`). A Home trata o retorno: mostra o aviso de confirmação ou, no caso de senha, redireciona para `new-password.html`. Por isso as Redirect URLs só precisam do endereço base.

## 6. Configuração do Auth (painel)

| Onde | Configuração |
|---|---|
| Authentication → Sign In / Providers → Email | Email ativado; **Confirm email** ligado; **Minimum password length = 8** |
| Authentication → Sign In / Providers → Google | Ligado, com o **Client ID** e o **Client Secret** do Google Cloud. O segredo fica só aqui, nunca no repositório |
| Authentication → URL Configuration | **Site URL** = endereço de produção; **Redirect URLs** = produção + `http://localhost:8000/` (e qualquer outro endereço onde o site rode, ex.: Vercel) |
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

**Idioma:** os e-mails saem sempre em inglês, mesmo para quem usa o site em outro idioma. O Supabase tem um modelo por projeto, e a conta não guarda o idioma da pessoa. E-mails em vários idiomas exigiriam guardar o idioma em `user_metadata` e usar condicionais no modelo ou um envio próprio (seção 9).

**Limites de envio:**
- Envio padrão do Supabase: só para a equipe do projeto, 2 por hora.
- Gmail com senha de app: cerca de 500 por dia.
- Para produção, o recomendado é Brevo ou Resend com domínio próprio.

## 8. Privacidade e GDPR

- **Dados pessoais guardados:** nome, e-mail, hash da senha, datas de acesso (gerenciados pelo Supabase) e o mapa de etapas feitas. Das mensagens de contato: nome, e-mail, assunto, mensagem, idioma e o HMAC do IP (seção 2.3), também entregues por e-mail pelo Resend (EUA; DPF e cláusulas contratuais padrão).
- **Dados que nunca saem do navegador:** salário, poupança, presente, preço e tudo o mais da calculadora. Também o idioma escolhido e as cópias dos textos traduzidos (`eirehome-locale`, `eirehome-locale-preview`, `eirehome-i18n:*`), que não têm dado pessoal.
- **Localização:** Irlanda (eu-west-1).
- **Exclusão:** Authentication → Users → Delete user apaga o usuário e, por cascata, o progresso.
- **Pendente antes do lançamento:** política de privacidade, contato para pedidos de exclusão ou acesso, e prazo de retenção de contas inativas.

## 9. Evoluções previstas (não implementadas)

- Tabela de auditoria de mudanças no progresso, só se houver necessidade de suporte.
- Datas de conclusão por etapa (`done` como `{ id: timestamp }`), se um dia o site mostrar uma sequência de dias ou um histórico. Exige migração do formato de `done` e ajuste em `lib/progress.js` e `core/sync.js`.
- Compartilhamento de progresso entre duas contas (casal): tabela `households` e políticas RLS próprias.
- E-mails de conta no idioma da pessoa: gravar o código do idioma em `user_metadata` no cadastro e escolher o texto no modelo (`{{ if eq .Data.locale "pt" }}`) ou mandar os e-mails por um serviço próprio.
