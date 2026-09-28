# 08 · Internacionalização (i18n)

Última revisão: 28/09/2026

Como o site aparece em vários idiomas, como adicionar textos novos sem quebrar nenhum idioma e como adicionar um idioma novo.

---

## 1. Resumo

- O **inglês é a fonte**. Todo texto nasce em `docs/locales/en/<namespace>.json`. Os outros idiomas traduzem esses arquivos.
- O site continua **HTML, CSS e JavaScript puros**, sem framework e sem build. As traduções são arquivos JSON estáticos, servidos pelo próprio GitHub Pages.
- **Nenhuma tradução automática acontece no site.** Os textos são escritos antes e revisados no Pull Request. Nada que a pessoa lê ou digita vai para um serviço de tradução.
- Na primeira visita, o site segue o idioma do navegador. Uma escolha feita no menu de idiomas fica salva e **nunca é substituída** pela detecção.
- `npm run check:i18n` (dentro de `npm run check` e do CI) falha quando falta tradução, sobra chave, os números mudam entre idiomas ou o HTML não bate com o inglês.

## 2. Idiomas

Registro único em `docs/js/lib/locales.js`.

| Código (pasta) | Tag | Nome no menu | Status |
|---|---|---|---|
| `en` | en-IE | English | complete (fonte) |
| `pt` | pt-BR | Português (Brasil) | complete |
| `es` | es-ES | Español | complete |
| `fr` | fr-FR | Français | complete |
| `de` | de-DE | Deutsch | complete |
| `it` | it-IT | Italiano | complete |
| `pl` | pl-PL | Polski | complete |
| `ro` | ro-RO | Română | complete |
| `lt` | lt-LT | Lietuvių | complete |

- **complete:** todos os textos traduzidos, o que o `check:i18n` garante. Só esses aparecem no menu e são escolhidos pela detecção.
- **draft:** tradução em andamento. **Nunca é anunciado** (não aparece no menu e a detecção ignora). O que falta aparece em inglês. Para revisar, abra qualquer página com `?lang=<código>`. Hoje nenhum idioma está em `draft`.
- Um idioma só vira `complete` quando o `check:i18n` passa com ele assim. Se um texto novo entrar em inglês e faltar num idioma completo, o CI falha: traduza ou volte o idioma para `draft`.

## 3. Arquivos

```
docs/
├── locales/<código>/<namespace>.json   # os textos
├── js/i18n-boot.js                     # runtime: script clássico no <head>, antes do CSS
├── js/core/i18n.js                     # como os scripts usam: t(), money(), date()...
├── js/core/language.js                 # o menu de idiomas do cabeçalho
└── js/lib/locales.js                   # a lista de idiomas e de namespaces
tools/
├── i18n.js                             # funções puras: carimbar o HTML e validar tudo
├── i18n-project.js                     # lê os arquivos do projeto
├── stamp-i18n.js                       # npm run i18n
└── check-i18n.js                       # npm run check:i18n
```

### Namespaces

Cada página baixa só o que usa, e só do idioma dela (mais o inglês, como reserva).

| Namespace | Conteúdo | Páginas |
|---|---|---|
| `common` | Cabeçalho, rodapé, menu de idiomas, avisos, portão das páginas logadas, rótulos e erros de formulário, erros do Supabase, saudações | Todas |
| `home` | Página inicial | `index.html` |
| `guide` | As 6 fases e os 31 passos (título, tempo, custo, texto, checklist, como fazer, links, dica, texto alternativo da imagem) e a página do guia | `guide.html`, `index.html`, `journey.html`, `dashboard.html` |
| `journey` | Minha jornada: caminho, painel do passo, "seus números" | `journey.html` |
| `calculator` | Calculadora: campos, dicas, quadro de custos, veredito | `calculator.html` |
| `authentication` | Entrar, criar conta, esqueci a senha, nova senha, Google | As 4 páginas de conta |
| `account` | Painel e Meu perfil | `dashboard.html`, `profile.html` |
| `legal` | Moldura das páginas legais e os resumos traduzidos | `privacy.html`, `terms.html` |

A página declara os namespaces em `<html lang="en-IE" data-i18n-ns="common calculator">`. O validador confere se toda chave usada pela página ou pelo script dela está num namespace declarado. Módulos de `js/core/` só usam `common`, e `js/lib/` não usa textos (é puro: devolve códigos, e a página traduz).

### Formato do JSON

```json
{
  "save": { "label": "Save to my journey" },
  "years": { "one": "{count} year", "other": "{count} years" },
  "checklist": ["First item", "Second item"],
  "note": "You are signed in as {email}.",
  "terms": "Read <a href=\"terms.html\">the terms</a>."
}
```

- Chave usada no código: `namespace:caminho`, por exemplo `calculator:save.label` ou `guide:steps.aip-0.checklist.2` (itens de lista pelo índice).
- `{nome}`: valor preenchido pelo script. Números passados como número saem no formato do idioma (1,000 ou 1.000).
- Objeto só com `zero`, `one`, `two`, `few`, `many`, `other`: texto que muda com um número (`count`), escolhido por `Intl.PluralRules`. Cada idioma precisa das formas que usa nos números de 0 a 1000, mais `other`.
- Tags só em textos usados com `data-i18n-html`, e só `a`, `br`, `em`, `strong` e `span`. O runtime limpa o resto, e os links só podem ir para páginas do site, `mailto:` ou `https:`.

## 4. Como funciona no navegador

### Escolha do idioma

Na ordem:

1. `?lang=<código>` no endereço, ou um já aberto assim nesta aba (vale para qualquer idioma listado, inclusive rascunho).
2. A escolha feita no menu (`localStorage eirehome-locale`), se o idioma estiver completo.
3. Os idiomas do navegador (`navigator.languages`), o primeiro completo.
4. Inglês.

A detecção não grava nada: só a escolha no menu é salva. Assim, quem nunca escolheu passa a ver um idioma novo assim que ele ficar completo.

### Sem piscar em inglês

- `js/i18n-boot.js` é um script clássico no `<head>`, antes do CSS. Ele define `<html lang>` e `data-locale` e carrega os textos antes de a página ser desenhada.
- Os textos ficam copiados no `localStorage` (`eirehome-i18n:<código>:<namespace>`), marcados com a versão dos textos. Com a cópia, a tradução acontece **enquanto o HTML é lido**, com um `MutationObserver`, antes do primeiro desenho. Não há piscada, e a transição entre páginas continua suave.
- Sem cópia (primeira visita num idioma, ou depois de um deploy que mudou textos), a página fica escondida até os textos chegarem, por no máximo 3 segundos. Depois disso aparece em inglês.
- Depois que a página carrega, o runtime copia os outros namespaces do mesmo idioma. As páginas seguintes abrem traduzidas na hora.
- A versão dos textos (`MESSAGES_VERSION`) é uma impressão digital de todos os arquivos de `locales/`. O `npm run i18n` a grava no runtime, e ela vai no endereço de cada JSON: texto alterado é baixado de novo assim que o site é publicado.
- Os endereços são relativos ao próprio script, por isso funcionam em `/EireHomeFlow/` no GitHub Pages e em qualquer outra pasta.

### Conteúdo dinâmico e carregado depois

- Scripts usam `t()` de `js/core/i18n.js`. Todo texto montado em JS passa por ele.
- O guia buscado por outras páginas (`fetch("guide.html")`) é traduzido com `translate(doc)` antes de os passos serem lidos. A estrutura dos objetos dos passos continua a mesma.
- Elementos inseridos depois com atributos `data-i18n` são traduzidos pelo `MutationObserver`.
- Números, dinheiro, porcentagens e datas saem com `Intl`: `money(209851)` dá "€209,851" em inglês, "209.851 €" em alemão e romeno e "209 851 €" em francês, polonês e lituano. O polonês só separa milhares a partir de 5 dígitos ("1613 €"), e o lituano escreve a data como "2026 m. rugsėjo 28 d.". As regras e valores irlandeses não mudam: só a forma de escrever.

### Menu de idiomas

- No cabeçalho, antes de "Sign in" ou do círculo da conta: botão com globo e código (EN, PT...). A lista mostra cada idioma no próprio nome, com o nome no idioma atual embaixo (via `Intl.DisplayNames`) e o atual marcado.
- No celular, a lista abre em largura total sob o cabeçalho, como o menu da conta. Abaixo de 400px o botão mostra só o globo, para o cabeçalho continuar em 2 linhas em todos os idiomas. Até 880px o cabeçalho usa 2 linhas (marca e botões em cima, links embaixo).
- Com 9 idiomas, a lista passa da altura de telas baixas (celular deitado, notebook pequeno). Nesses casos ela rola dentro do menu, que para 16px antes do fim da tela.
- Escolher um idioma salva a escolha, apaga as cópias de outros idiomas, baixa os textos desta página e recarrega a página já traduzida.
- **Sem bandeiras:** idioma não é país (português do Brasil ou de Portugal? espanhol da Espanha ou do México?), e o Windows mostra as bandeiras emoji como letras. O código do idioma cumpre o papel com mais clareza.

### Armazenamento

Três chaves novas, todas descritas na Política de Privacidade (seção "Browser storage and cookies"):

| Chave | Onde | Para quê |
|---|---|---|
| `eirehome-locale` | localStorage | O idioma escolhido no menu |
| `eirehome-locale-preview` | sessionStorage | O idioma aberto com `?lang=`, só nesta aba |
| `eirehome-i18n:<código>:<namespace>` | localStorage | Cópia dos textos, para abrir traduzido na hora. Sem dados pessoais |

## 5. O que não se traduz

- **IDs e dados:** IDs dos passos, `data-slug`, valores salvos no Supabase (`progress.done`), chaves do `localStorage`, `data-action`, nomes de campos.
- **Lógica e regras:** fórmulas e constantes da calculadora (4×, 3,5×, 10%, faixas de 1%, 2% e 6%, IVA de 13,5% e 9%, Help to Buy até €30.000, 10% e 70%, teto de €500.000). O validador exige os **mesmos números** em cada tradução.
- **Nomes oficiais irlandeses** ficam em inglês, com explicação no idioma quando ajuda: Approval in Principle (AIP), Help to Buy, First Home Scheme, Revenue, myAccount, ROS, PAYE, DIRT, BER, LPT (Local Property Tax), EDS, Statement of Liability, Sale Agreed, gazumping, conveyancing, solicitor, Residential Property Price Register, Daft.ie, MyHome.ie, Engineers Ireland, SCSI, RGI. O Banco Central da Irlanda é traduzido.
- **A marca** "ÉireHome Flow" e o "XP" (marcados com `translate="no"`).
- **Páginas legais:** título, resumo ("The short version"), índice, quadro de ajuda e um aviso são traduzidos. O **texto integral** continua em inglês, dentro de `<div class="legal__body" lang="en-IE" data-i18n-source-only>`, e o aviso diz isso no idioma da pessoa. Motivo: é a versão que vale, e a política ainda tem itens em aberto (nome jurídico, endereço, escolhas marcadas com POLICY CHOICE). Traduzir o texto integral fica para depois de fechar esses itens.
- **E-mails do Supabase** (confirmação e nova senha) continuam em inglês: o Supabase envia um modelo por projeto.
- **Mensagens de erro desconhecidas do Supabase:** as comuns têm tradução (senha errada, e-mail não confirmado, conta existente, limite de tentativas, sessão expirada, rede). As outras aparecem em inglês para quem usa inglês e como "Algo deu errado" nos demais idiomas.

## 6. Glossário

Termos fixos em cada idioma. Mantenha-os ao traduzir textos novos.

| Inglês | pt | es | fr | de | it |
|---|---|---|---|---|---|
| My journey (menu) | Jornada | Mi camino | Parcours | Mein Weg | Percorso |
| My journey (texto) | Minha jornada | Mi camino | Mon parcours | Mein Weg | Il mio percorso |
| Calculator | Calculadora | Calculadora | Simulateur | Rechner | Calcolatore |
| Guide | Guia | Guía | Guide | Ratgeber | Guida |
| Step / Phase | Etapa / Fase | Paso / Fase | Étape / Phase | Schritt / Phase | Passo / Fase |
| Blocking step | Etapa obrigatória | Paso obligatorio | Étape obligatoire | Pflichtschritt | Passo obbligatorio |
| Deposit | Entrada | Entrada | Apport | Anzahlung | Anticipo |
| Mortgage | Financiamento | Hipoteca | Prêt immobilier | Hypothek | Mutuo |
| First-time buyer | Primeiro imóvel | Primera vivienda | Primo-accédant | Erstkäufer | Prima casa |
| Stamp duty | Imposto de selo | Impuesto de timbre | Droit de timbre | Stempelsteuer | Imposta di bollo |
| Solicitor | Advogado | Abogado | Avocat | Anwalt | Avvocato |
| Structural survey | Vistoria estrutural | Inspección estructural | Expertise du bâti | Bautechnisches Gutachten | Perizia strutturale |
| Bank valuation | Avaliação do banco | Tasación del banco | Évaluation de la banque | Wertgutachten der Bank | Valutazione della banca |
| Booking deposit | Sinal de reserva | Señal de reserva | Acompte de réservation | Reservierungsanzahlung | Caparra di prenotazione |
| Approval in Principle | Aprovação em Princípio (AIP) | Aprobación en Principio (AIP) | Accord de principe (AIP) | Grundsatzzusage (AIP) | Approvazione di massima (AIP) |
| Worth knowing | Bom saber | Conviene saber | Bon à savoir | Gut zu wissen | Buono a sapersi |
| Tratamento | você | tú | vous | Sie | tu |

| Inglês | pl | ro | lt |
|---|---|---|---|
| My journey (menu e texto) | Moja droga | Drumul meu | Mano kelias |
| Calculator | Kalkulator | Calculator | Skaičiuoklė |
| Guide | Poradnik | Ghid | Gidas |
| Step / Phase | Krok / Etap | Pas / Etapă | Žingsnis / Etapas |
| Blocking step | Krok obowiązkowy | Pas obligatoriu | Privalomas žingsnis |
| Deposit | Wkład własny | Avans | Pradinis įnašas |
| Mortgage | Kredyt hipoteczny (kredyt) | Credit ipotecar (credit) | Būsto paskola (paskola) |
| First-time buyer | Pierwszy zakup | Prima locuință | Pirmas būstas |
| Stamp duty | Opłata skarbowa | Taxa de timbru | Žyminis mokestis |
| Solicitor | Prawnik | Avocat | Teisininkas |
| Structural survey | Inspekcja techniczna | Inspecție tehnică | Techninė apžiūra |
| Bank valuation | Wycena banku | Evaluarea băncii | Banko vertinimas |
| Booking deposit | Zaliczka rezerwacyjna | Avans de rezervare | Rezervacijos įnašas |
| Approval in Principle | Wstępna zgoda banku (AIP) | Aprobare de principiu (AIP) | Išankstinis banko pritarimas (AIP) |
| Worth knowing | Warto wiedzieć | Bine de știut | Verta žinoti |
| Tratamento | ty | tu | Jūs (formal, com maiúscula: Jūs, Jūsų, Jums) |

- Títulos dos passos: imperativo em polonês e romeno ("Wybierz", "Alege"), infinitivo em lituano ("Pasirinkti"), como numa lista de tarefas.
- Nas contagens do tipo "3 de 31 passos", a palavra vem antes dos números: "Kroki: {done} z {count}", "Pași: {done} din {count}", "Žingsniai: {done} iš {count}". Assim a frase fica certa com qualquer número, mesmo quando a forma do substantivo mudaria com ele.

Na primeira menção de um termo irlandês num texto, dá para pôr o original entre parênteses: "imposto de selo (stamp duty)".

## 7. Convenção obrigatória: todo texto novo

Vale para qualquer texto que alguém vê ou ouve: conteúdo, botões, rótulos, dicas, mensagens de erro, `aria-label`, `alt`, `placeholder`, `title`, `<title>` da página.

1. **Escreva em inglês** em `docs/locales/en/<namespace>.json`, no namespace da página (ou `common`, se aparece em várias).
2. **No HTML**, marque o elemento:
   - `data-i18n="ns:chave"` para texto simples (o elemento não pode ter outros elementos dentro);
   - `data-i18n-html="ns:chave"` para texto com link ou negrito;
   - `data-i18n-aria-label`, `data-i18n-alt`, `data-i18n-placeholder`, `data-i18n-title` ou `data-i18n-content` para atributos;
   - `translate="no"` para nomes que não se traduzem.

   Depois rode `npm run i18n`: ele copia o inglês do JSON para o HTML. Se mexeu num partial, rode também `npm run partials`.
3. **Nos scripts**, use `t("ns:chave", { valores })`. Nunca escreva a frase direto no código. Chave montada com variável só no formato `` t(`ns:grupo.${valor}.titulo`) ``, com uma variável simples dentro de `${}`, para o validador reconhecer.
4. **Traduza** a chave nova nos 8 idiomas completos. Durante o desenvolvimento, pode usar qualquer ferramenta de tradução e revisar o resultado; o site nunca traduz sozinho. Se não der para traduzir agora, o idioma volta para `draft` até alguém traduzir (e sai do menu).
5. **Rode `npm run check`.** O `check:i18n` mostra o que falta.
6. **Rode `npm run bump`**, porque o `npm run i18n` muda o `js/i18n-boot.js`.

Cuidados na tradução:

- Mantenha os `{nomes}`, as tags e os links iguais aos do inglês.
- Mantenha os **números**: o validador compara os números de cada texto com os do inglês, lidos no formato de cada idioma (€2,000 em inglês é 2.000 € em alemão). Número escrito por extenso no inglês fica por extenso na tradução.
- Mesma quantidade de "€" e "%".
- Sem travessão, sem "≈" e sem "…" (use "..."), como no tom de voz do site.
- Textos curtos do cabeçalho (menu e "Sign in") precisam caber no celular de 320px. Depois de mudar, confira em 320px e em 768px.
- Quando a concordância depende de outro número (por exemplo, "1 de 6 etapas"), escreva uma frase que funcione com o plural escolhido por `count`.

## 8. O validador: `npm run check:i18n`

Mostra quanto cada idioma tem traduzido e falha com a lista de problemas. Confere:

| Verificação | Exemplo de mensagem | Como resolver |
|---|---|---|
| Texto na página sem chave | `"Plain words" is shown without a translation key` | Adicionar ao JSON em inglês e marcar com `data-i18n` |
| Frase escrita direto num script | `looks like text for readers` | Passar para o JSON e usar `t()`. Mensagem só para desenvolvedores: `// i18n-ignore` na linha |
| Chave usada que não existe | `is not in locales/en/...` | Adicionar ao inglês |
| Chave em inglês sem uso | `is not used by any page or script` | Usar ou apagar |
| Chave fora dos namespaces da página | `which is not loaded here` | Mudar de namespace ou declarar em `data-i18n-ns` |
| HTML diferente do inglês | `Run npm run i18n` | Rodar `npm run i18n` |
| Idioma completo com texto faltando | `is marked complete, but N texts are not translated` | Traduzir, ou marcar como `draft` |
| Chave traduzida que não existe em inglês | `is not in English` | Apagar da tradução |
| `{nomes}`, tags ou tipo diferentes | `uses {x} but English uses {y}` | Igualar ao inglês |
| Números diferentes | `has the numbers [...] but English has [...]` | Corrigir o número ou o formato |
| Formas de plural | `needs a "few" form in pl` | Adicionar a forma |
| Travessão, "≈" ou "…" | `contains an em dash` | Trocar por hífen, "about" ou "..." |
| Lista de idiomas ou versão desatualizada no runtime | `Run npm run i18n` | Rodar `npm run i18n` |
| Página sem o runtime | `must load js/i18n-boot.js` | Pôr o `<script src="js/i18n-boot.js?v=...">` no `<head>`, antes do CSS |

Também avisa (sem falhar) quando uma tradução de 5 palavras ou mais é idêntica ao inglês.

## 9. Adicionar um idioma

1. Em `docs/js/lib/locales.js`, adicione `{ code, tag, name, status: "draft" }`. `code` é o nome da pasta (código ISO de 2 letras), `tag` a tag BCP 47 (ex.: `pl-PL`) e `name` o nome na própria língua.
2. Crie `docs/locales/<código>/` e traduza os namespaces, começando por `common`. Copie a estrutura do inglês.
3. `npm run i18n`, `npm run bump`, `npm run check`. O relatório mostra a porcentagem traduzida.
4. Revise no site com `?lang=<código>`, em 320px e em desktop.
5. Com 100% traduzido e revisado por quem fala a língua, mude para `status: "complete"`, rode `npm run i18n` e `npm run check`. O idioma aparece no menu e passa a ser detectado.
6. Confira se a fonte cobre o alfabeto (a Nunito cobre latim e latim estendido: polonês, romeno, lituano, tcheco, húngaro...). Alfabeto grego ou cirílico precisaria de outros arquivos de fonte.
7. Com mais de 9 idiomas, confira se o menu de idiomas continua usável em 320×480 (ele rola por dentro).

## 10. Testes

- `tests/i18n-runtime.test.js`: roda o `js/i18n-boot.js` num ambiente simulado. Cobre detecção, escolha salva nunca substituída, `?lang=`, rascunhos fora da detecção, cópias no navegador, endereços em `/EireHomeFlow/`, `t()` com valores, plural e reserva em inglês, links permitidos e a troca de idioma.
- `tests/i18n-tools.test.js`: carimbo do HTML, leitura de chaves, números por idioma e cada verificação do validador.
- `tests/format.test.js`: dinheiro, números, porcentagens e datas por idioma.
- Manual (TRD §12): cada página em pelo menos um idioma além do inglês, em 320, 375, 768 e 1280px; menu de idiomas pelo teclado (Esc fecha); console sem erros.

## 11. Limitações conhecidas e próximos passos

- As traduções foram escritas com cuidado e passam no validador, mas **ainda precisam de revisão por falantes nativos**, principalmente o vocabulário financeiro. Polonês, romeno e lituano são os mais novos e têm prioridade na revisão.
- Texto integral das páginas legais só em inglês (seção 5).
- E-mails do Supabase só em inglês.
- Com o JavaScript desligado, o site aparece em inglês (o HTML é o inglês).
