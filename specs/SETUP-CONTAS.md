# Como ativar as contas (Supabase)

O código das contas já está pronto. Enquanto `docs/js/config.js` estiver vazio, o site mostra "Accounts are not switched on yet", e a etapa **"Create your ÉireHome Flow account"** (a última da fase 1) não pode ser concluída. Como ela é obrigatória, **ninguém consegue concluir as etapas da fase 2 em diante até as contas estarem ativas**. A leitura de todas as etapas continua liberada.

Leva uns 15 minutos.

## 1. Criar o projeto
1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e clique em **New project**.
2. Em **Region**, escolha **West EU (Ireland)**, para os dados ficarem na Irlanda.
3. Guarde a senha do banco num gerenciador de senhas; o site não precisa dela.

## 2. Criar a tabela do progresso
No painel do projeto, abra **SQL Editor**, cole o bloco abaixo e clique em **Run**:

```sql
create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  done jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "Users read their own progress" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users add their own progress" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users update their own progress" on public.progress
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
```

As políticas de *row level security* garantem que cada pessoa só leia e grave o próprio progresso. Ao apagar um usuário, o progresso dele é apagado junto.

### 2.1 Deixar a pessoa apagar a própria conta
O botão "Delete my account" de My profile precisa desta função. Cole no **SQL Editor** e clique em **Run**:

```sql
-- Lets a signed-in person delete their own account from My profile.
-- It takes no arguments and only ever deletes the caller (auth.uid()).
-- Their progress row goes with it (on delete cascade), and so do their sessions.
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = '
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
```

Sem essa função, o botão mostra "Deleting accounts from the site is not switched on yet" e manda a pessoa escrever para eirehomeflow@gmail.com. Para apagar uma conta à mão: **Authentication → Users → Delete user**.

## 3. Configurar o login
Em **Authentication → Sign In / Providers**:
- **Email** deve estar ativado.
- Deixe **Confirm email** ligado. A pessoa recebe um link de confirmação antes de conseguir entrar.

Em **Authentication → URL Configuration**:
- **Site URL:** `https://codebybrigido.github.io/EireHomeFlow/`
- **Redirect URLs:** adicione `https://codebybrigido.github.io/EireHomeFlow/` e também `http://localhost:8000/`, para testar no computador.

Sem o endereço público nessa lista, os links dos e-mails de confirmação e de senha, e a volta do login com Google, não voltam para o site. Se o site também rodar em outro endereço (por exemplo na Vercel), acrescente esse endereço também.

### 3.1 Entrar com Google
O site já tem o botão "Continue with Google". Ele só aparece quando o Google está ligado no Supabase.

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e, em **APIs e serviços → Tela de consentimento OAuth**, preencha o nome do app (ÉireHome Flow), o e-mail de suporte e o domínio `codebybrigido.github.io`.
2. Em **Credenciais → Criar credenciais → ID do cliente OAuth**, escolha **Aplicativo da Web**:
   - **Origens JavaScript autorizadas:** `https://codebybrigido.github.io` e `http://localhost:8000`;
   - **URIs de redirecionamento autorizados:** `https://dyfxstpbzmihtmccaezs.supabase.co/auth/v1/callback`.
3. No Supabase, em **Authentication → Sign In / Providers → Google**, ligue o Google e cole o **Client ID** e o **Client Secret**.
4. O **Client Secret** fica só no painel do Supabase. Nunca o coloque em `docs/js/config.js` nem em nenhum arquivo do repositório.
5. Teste: `signin.html` → "Continue with Google" → escolha a conta → você volta ao Dashboard já logado, com as suas iniciais no topo.

Enquanto o app estiver em modo de teste no Google Cloud, só os e-mails cadastrados como testadores conseguem entrar. Para liberar para todos, publique o app na tela de consentimento.

## 4. Colar as chaves no site
Em **Project Settings → API Keys**, copie:
- a **Project URL** (algo como `https://abcd1234.supabase.co`);
- a chave **publishable** (`sb_publishable_...`) ou, em projetos antigos, a **anon public**.

Cole as duas em `docs/js/config.js`:

```js
export const SUPABASE_URL = "https://abcd1234.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_...";
```

Mantenha o `export`: `docs/js/core/account.js` importa esses dois nomes, e sem ele nenhum script de página carrega.

Essa chave foi feita para ficar pública no navegador; quem protege os dados são as políticas do passo 2. **Nunca** coloque a chave `service_role` (ou `secret`) nesse arquivo nem em nenhum outro arquivo do repositório.

## 5. Testar no seu computador
Na pasta do repositório (com Node.js 20.1 ou mais novo; na primeira vez, rode antes `npm install`):

```bash
npm start
```

Sem Node, `python -m http.server 8000 --directory docs` também serve, mas no Windows algumas instalações do Python enviam os `.js` com o tipo errado e os módulos não carregam (cabeçalho e etapas em branco); por isso o recomendado é `npm start`.

Abra `http://localhost:8000/`, clique em **Sign in → Create account**, confirme o e-mail pelo link e entre. Na Journey, a etapa da conta passa a poder ser concluída e a fase 2 destrava. Entrando com a mesma conta em outro navegador, o progresso aparece lá também.

## 6. E-mails com a cara do site
Os modelos estão em `supabase/email-templates/`. A logo fica em `docs/img/brand/eirehome-flow-logo.png` e é publicada pelo GitHub Pages junto com o site, então não precisa de bucket no Supabase. Os e-mails buscam a imagem neste endereço:
`https://codebybrigido.github.io/EireHomeFlow/img/brand/eirehome-flow-logo.png`

Se o endereço do site mudar (outro nome de repositório ou domínio próprio), troque esse endereço nos dois modelos e cole-os de novo no Supabase.

**a) Colar os modelos.** Em **Authentication → Emails → Templates**:

| Modelo no Supabase | Subject | Conteúdo (cole o arquivo inteiro em "Source") |
|---|---|---|
| **Confirm sign up** | `Confirm your email for ÉireHome Flow` | `supabase/email-templates/confirm-signup.html` |
| **Reset password** | `Reset your ÉireHome Flow password` | `supabase/email-templates/reset-password.html` |

Clique em **Save** em cada um. Os trechos `{{ .Email }}` e `{{ .ConfirmationURL }}` são preenchidos pelo Supabase; não os altere.

**b) Testar.** O envio padrão do Supabase só entrega para os e-mails dos membros da equipe do projeto e no máximo 2 por hora. Crie a conta com o seu e-mail e, para testar o outro modelo, use "Forgot your password?" na tela de login.

## 7. Senha forte
O site já exige, no cadastro e na troca de senha: **pelo menos 8 caracteres, 1 letra maiúscula e 1 caractere especial** (``! @ # $ % ^ & * ( ) _ + - = [ ] { } ; ' \ : " | < > ? , . / ` ~``), com uma lista que vai marcando cada requisito enquanto a pessoa digita.

No Supabase, em **Authentication → Sign In / Providers → Email**, defina **Minimum password length = 8**. A opção **Password requirements** não tem a combinação exata "maiúscula + especial". A mais próxima é "Lowercase, uppercase letters, digits and symbols", que também exige minúscula e número. Para ter essa trava no servidor também, acrescente "1 número" (e "1 minúscula") à regra do site, para as duas baterem.

## Antes de divulgar o site
- **E-mails:** o serviço de e-mail padrão do Supabase serve só para testes e tem limite baixo de envios por hora. Para uso real, configure um SMTP próprio em **Authentication → Emails → SMTP Settings** (por exemplo Gmail com senha de app, Brevo, Resend ou Postmark). A senha do SMTP fica só no painel do Supabase, nunca no repositório.
- **Plano gratuito:** projetos gratuitos são pausados depois de um período sem uso. Confira a política atual no painel e considere o plano pago quando houver usuários de verdade.
- **GDPR:** o site guarda dados pessoais (nome e e-mail). A Privacy Policy está em `docs/privacy.html`. Para apagar um usuário: **Authentication → Users → Delete user**.
- **Biblioteca:** o `docs/js/core/account.js` carrega o `@supabase/supabase-js@2` do jsDelivr, e só quando as chaves estão preenchidas. Para travar numa versão exata, troque `@2` pelo número da versão (por exemplo `@2.x.y`).

## Como funciona
- **Sem conta:** o progresso e os valores da calculadora ficam salvos no navegador (`localStorage`).
- **Ao entrar:** o progresso do navegador e o da conta são somados (uma etapa feita em qualquer um dos dois continua feita) e gravados na conta. Depois disso, cada etapa marcada ou desmarcada é salva na nuvem.
- **Ao sair (Sign out):** o progresso é removido deste navegador. Ele continua na conta e volta ao entrar de novo.
- Os valores da calculadora nunca saem do navegador.
