# Especificações do ÉireHome Flow

Esta pasta é a fonte de verdade do projeto: o que o site é, para quem, como funciona e o que vem a seguir. Ela fica fora de `docs/` de propósito, para não ser publicada no GitHub Pages.

Última revisão: 24/09/2026

## Documentos

| # | Documento | Responde a | Quando consultar |
|---|---|---|---|
| 01 | [PRD](01-PRD.md) | O quê e por quê: problema, público, requisitos, fora de escopo | Antes de aceitar ou recusar qualquer ideia nova |
| 02 | [TRD](02-TRD.md) | Como: arquitetura, arquivos, estado, fórmulas, segurança, testes | Antes de mexer no código |
| 03 | [UI/UX Design](03-UI-UX-Design.md) | Telas, estados, textos, acessibilidade, tom de voz | Antes de mudar uma tela ou escrever texto |
| 04 | [App Flow](04-App-Flow.md) | Caminhos do usuário, do primeiro acesso à conta e à senha | Antes de mudar navegação, regras de desbloqueio ou login |
| 05 | [Backend Schema](05-Backend-Schema.md) | Supabase: tabelas, segurança, auth, e-mails, IDs das etapas | Antes de mexer no banco, no login ou na lista de etapas |
| 06 | [Implementation Plan](06-Implementation-Plan.md) | O que já foi feito, o que falta e em que ordem | No início de cada sessão de trabalho |
| 07 | [Design System](07-Design-System.md) | Cores, tipografia, espaçamentos, componentes | Antes de criar ou mudar qualquer componente visual |

Documentos relacionados na raiz do projeto:
- `AUDITORIA.md`: auditoria de 23/09/2026 e os itens ainda em aberto.
- `SETUP-CONTAS.md`: passo a passo do Supabase (chaves, tabela, e-mails, SMTP).

## Regras para não sair da rota

1. **Documento primeiro, código depois.** Uma mudança de comportamento só entra se o documento correspondente for atualizado no mesmo trabalho.
2. **Se o código e o documento divergirem**, o código mostra o que existe hoje e o documento mostra o que foi combinado. Decida qual está certo e corrija o outro na mesma hora.
3. **Nada entra no site sem passar pelo PRD.** Ideia nova que não está no PRD vai primeiro para "Questões em aberto" ou "Fora de escopo".
4. **Os IDs das etapas são permanentes** (veja o Backend Schema). Mudar a ordem das etapas dentro de uma fase apaga o progresso salvo dos usuários.
5. **Textos seguem o guia de tom de voz** do UI/UX Design: inglês britânico e irlandês, sem travessões, sem clichês.
6. **Cada documento tem "Última revisão"** no topo. Atualize a data quando mudar o conteúdo.
