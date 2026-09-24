# ÉireHome Flow

Guia educativo para quem vai comprar o primeiro imóvel na Irlanda: seis fases e 31 etapas, da poupança para a entrada até a mudança, com calculadora de poder de compra e progresso salvo na conta.

**Site publicado:** https://codebybrigido.github.io/EireHomeFlow/

Última revisão: 24/09/2026

## Pastas

| Pasta | O que tem |
|---|---|
| `docs/` | O site. É a pasta publicada pelo GitHub Pages: o que entra na `main` vai ao ar em poucos minutos. |
| `specs/` | A fonte de verdade do projeto: requisitos, arquitetura, telas, fluxos, banco, plano e design system. |
| `supabase/email-templates/` | Os e-mails de confirmação e de nova senha, para colar no painel do Supabase. |
| `tests/` | Os testes automáticos (`npm test`). |
| `tools/` | Servidor local (`npm start`) e as ferramentas do `?v=`. |
| `.github/` | O GitHub Actions, que confere cada Pull Request. |
| `_original-Backup/` | O arquivo original do Claude Design, antes da reestruturação. Só consulta. |

## Rodar no computador

Precisa do [Node.js](https://nodejs.org/) 20.1 ou mais novo (o GitHub Actions usa o 22). Na pasta do repositório, na primeira vez:

```bash
npm install
```

Depois, para abrir o site:

```bash
npm start
```

e abra `http://localhost:8000/`.

No Windows, se o PowerShell disser que a execução de scripts está desabilitada, use o Git Bash ou o Prompt de Comando (cmd), ou rode uma vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

Quem tem Python também pode usar `python -m http.server 8000 --directory docs`, mas no Windows algumas instalações do Python enviam os `.js` com o tipo errado e os módulos não carregam (cabeçalho e etapas em branco); por isso o recomendado é `npm start`. O site precisa de um servidor porque cabeçalho, rodapé e etapas são carregados por `fetch`: abrir o `index.html` com duplo clique não funciona.

## Conferências automáticas

| Comando | O que faz |
|---|---|
| `npm test` | Testes da calculadora (valores de referência do TRD), do progresso, da validação, da formatação e das ferramentas |
| `npm run lint` | ESLint: `import` esquecido, variável não declarada, erros comuns |
| `npm run check:versions` | Confere se todo CSS e JS usa o mesmo `?v=` |
| `npm run bump` | Troca o `?v=` em todos os arquivos pela data de hoje. Use depois de mudar CSS ou JS. Segunda mudança no mesmo dia: `npm run bump -- AAAAMMDD` com um número novo (ex.: a data de amanhã) |
| `npm run check` | Lint, testes e versões juntos, igual ao GitHub Actions em cada Pull Request |

## Trabalhar em equipe

1. Atualize a sua cópia antes de começar: `git pull`.
2. Crie um branch para cada mudança: `git switch -c nome-da-mudanca`.
3. Faça a mudança, confira no navegador e atualize os documentos de `specs/` afetados (regra 1 abaixo).
   Mudou algum arquivo `.css` ou `.js`? Rode `npm run bump`. Antes de enviar, rode `npm run check`: é o mesmo que o GitHub vai conferir no Pull Request.
4. Envie o branch (`git push -u origin nome-da-mudanca`) e abra um Pull Request no GitHub.
5. Outra pessoa revisa, e o Pull Request entra na `main`. Só então a mudança vai para o site.

Nunca coloque senhas ou chaves secretas no repositório. A única chave que pode ficar aqui é a publicável, em `docs/js/config.js`.

## Documentos

| # | Documento | Responde a | Quando consultar |
|---|---|---|---|
| 01 | [PRD](specs/01-PRD.md) | O quê e por quê: problema, público, requisitos, fora de escopo | Antes de aceitar ou recusar qualquer ideia nova |
| 02 | [TRD](specs/02-TRD.md) | Como: arquitetura, arquivos, estado, fórmulas, segurança, testes | Antes de mexer no código |
| 03 | [UI/UX Design](specs/03-UI-UX-Design.md) | Telas, estados, textos, acessibilidade, tom de voz | Antes de mudar uma tela ou escrever texto |
| 04 | [App Flow](specs/04-App-Flow.md) | Caminhos do usuário, do primeiro acesso à conta e à senha | Antes de mudar navegação, regras de desbloqueio ou login |
| 05 | [Backend Schema](specs/05-Backend-Schema.md) | Supabase: tabelas, segurança, auth, e-mails, IDs das etapas | Antes de mexer no banco, no login ou na lista de etapas |
| 06 | [Implementation Plan](specs/06-Implementation-Plan.md) | O que já foi feito, o que falta e em que ordem | No início de cada sessão de trabalho |
| 07 | [Design System](specs/07-Design-System.md) | Cores, tipografia, espaçamentos, componentes | Antes de criar ou mudar qualquer componente visual |

Também em `specs/`:
- [AUDITORIA.md](specs/AUDITORIA.md): auditoria de 23/09/2026 e os itens ainda em aberto.
- [SETUP-CONTAS.md](specs/SETUP-CONTAS.md): passo a passo do Supabase (tabela, login, chaves, e-mails, SMTP).

## Regras para não sair da rota

1. **Documento primeiro, código depois.** Uma mudança de comportamento só entra se o documento correspondente for atualizado no mesmo trabalho.
2. **Se o código e o documento divergirem**, o código mostra o que existe hoje e o documento mostra o que foi combinado. Decida qual está certo e corrija o outro na mesma hora.
3. **Nada entra no site sem passar pelo PRD.** Ideia nova que não está no PRD vai primeiro para "Questões em aberto" ou "Fora de escopo".
4. **Os IDs das etapas são permanentes** (veja o Backend Schema). Mudar a ordem das etapas dentro de uma fase apaga o progresso salvo dos usuários.
5. **Textos seguem o guia de tom de voz** do UI/UX Design: inglês britânico e irlandês, sem travessões, sem clichês.
6. **Cada documento tem "Última revisão"** no topo. Atualize a data quando mudar o conteúdo.
