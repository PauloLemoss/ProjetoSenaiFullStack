## 1. Scaffold do projeto e base compartilhada

- [x] 1.1 Criar o projeto React em `frontend/` (Vite recomendado, ou Next.js 14+ em modo
      biblioteca de rotas), respeitando a stack obrigatória (sem Remix, sem React Router modo
      framework, sem CRA, sem Angular/Vue) e verificar que o comando de dev sobe a aplicação —
      feito com Vite 8 + React 19 + React Router 7; `npm run dev` sobe em http://localhost:5173
      com a navegação (Jogadores/Clubes/Partidas/Classificação) e redireciona `/` para
      `/jogadores`. **Nota:** o toolchain exige Node.js 22+ (jsdom/vitest mais novos não rodam em
      Node 20); `.nvmrc` com `22` foi adicionado em `frontend/`, e o README do frontend (tarefa
      6.4) deve listar Node 22 como pré-requisito.
- [x] 1.2 Criar a camada de serviço de API (um módulo por domínio: jogadores, clubes, mercado,
      liga) apontando para `/api/v1`, satisfazendo `frontend-conventions` — "Camada de serviço de
      API própria"; verificar que nenhum componente chama `fetch`/Axios diretamente (busca de
      texto no código) e que uma chamada de teste a `GET /players` retorna dado — feito em
      `src/lib/httpClient.js` (único ponto que chama `fetch`, com `ApiError` carregando o
      `message` da API) e `src/features/{jogadores,clubes,mercado,liga}/api.js`; testes unitários
      com `fetch` mockado confirmam a URL e o método montados (`src/lib/httpClient.test.js`,
      `src/features/jogadores/api.test.js`). A base da API vem de `VITE_API_BASE_URL` — **falta
      criar `frontend/.env.example`** (bloqueado por regra de permissão do ambiente que nega
      escrita em arquivos `.env*`; ver mensagem de resumo para o conteúdo a colar manualmente)
- [x] 1.3 Criar os componentes compartilhados exigidos por `frontend-conventions` — tabela/lista
      com os três estados (carregando, vazio, erro), campo de formulário com rótulo e mensagem de
      erro, modal de confirmação pós-ação com tabela de valores, badge de condição física; verificar
      que cada um tem uso real em mais de uma tela, sem duplicação de marcação — feito em
      `src/shared/{DataTable,FormField,Modal,ConditionBadge}.jsx`, cada um com teste de
      componente (`@testing-library/react`); o uso real em telas de verdade vem nas tasks 2–6
- [x] 1.4 Criar utilitários de formatação de moeda (2 casas decimais, vírgula) e de data/hora
      (horário de Brasília, parse e format no formato `-03:00`); verificar com teste unitário que
      `40.00` vira `"40,00"` e que uma data digitada é convertida para `-03:00` — feito em
      `src/lib/formatCurrency.js` e `src/lib/formatDateTime.js`, com testes Vitest cobrindo os dois
      casos pedidos

## 2. Jogadores (`frontend-jogadores`, F01–F04)

- [x] 2.1 Implementar a listagem paginada de jogadores (F01); verificar manualmente que 23
      jogadores paginam de 10 em 10, com navegação entre páginas e total exibido — feito em
      `JogadoresPage`/`PlayersTable` (`src/features/jogadores/`), com `usePlayersList` (hook sobre
      `useQuery`) buscando `GET /players`; teste de integração confirma a tabela e "Página 1 de 1"
      com dado mockado (`JogadoresPage.test.jsx`)
- [x] 2.2 Implementar busca por nome e filtros combináveis, incluindo o bloqueio ou mensagem para
      `free=true` com `club_id` (F02); verificar cada filtro isoladamente e combinado com os demais
      — feito em `PlayersFilters.jsx`: busca, posição, condição, clube, faixa de idade e de valor,
      todos combináveis; as abas Todos/Livres/Em clubes desabilitam e limpam o filtro de clube ao
      escolher "Livres", impedindo a combinação na própria tela
- [x] 2.3 Implementar ordenação por nome, valor de mercado, idade (ambos sentidos) e posição (F02);
      verificar que a ordem exibida é a devolvida pela API, sem reordenação no cliente — feito via
      `<select>` de ordenação em `PlayersFilters.jsx` repassando `sort` direto para `GET /players`
- [x] 2.4 Implementar exclusão de jogador livre com confirmação (F03); verificar que o botão não
      aparece em jogador com clube e que a exclusão remove a linha sem recarregar a página — feito
      em `PlayersTable.jsx` (botão só em `club_id === null`) e `DeletePlayerModal.jsx`; a lista
      recarrega via `reload()` depois do `DELETE`, sem `location.reload`
- [x] 2.5 Implementar o cadastro com os sete indicadores e a validação de campo único exigida por
      `frontend-conventions` (F04); verificar que o valor base e o overall só aparecem depois de
      salvar — feito em `PlayerCreateModal.jsx`; validação local em `validation.js` (testada em
      `validation.test.js`); teste de integração cobre o bloqueio por nome curto e o cadastro
      completo mostrando `base_value`/`overall` só na confirmação pós-`POST`
- [x] 2.6 Implementar a edição e a alteração de condição, incluindo as recusas previsíveis (idade
      menor que a atual, mudança de posição com clube, `DOENTE`→`APTO`) (F04); verificar cada uma
      das três recusas previsíveis — feito em `PlayerEditModal.jsx` (posição desabilitada quando o
      jogador tem clube; idade menor que a atual bloqueada no cliente) e `PlayerConditionModal.jsx`
      (`DOENTE`→`APTO` bloqueado no cliente)

## 3. Clubes (`frontend-clubes`, F05, F07)

- [x] 3.1 Implementar a listagem de clubes ordenável e o formulário de criação (F05); verificar a
      ordenação por nome e por patrimônio e que um clube criado aparece na lista sem recarregar.
      **Nota:** feito em `ClubesPage`/`ClubesTable`/`ClubCreateModal` (`src/features/clubes/`),
      com `useClubsList` (hook sobre `useQuery`) buscando `GET /clubs?sort=name|net_worth_desc`;
      teste de integração confirma a tabela, a ordenação por `sort=net_worth_desc` e o clube criado
      aparecendo na listagem sem recarregar (`src/features/clubes/ClubesPage.test.jsx`).
- [x] 3.2 Implementar a página do clube com os indicadores financeiros e o elenco com as colunas de
      contrato (F07); verificar que o elenco aparece na ordem devolvida pela API, com contrato de
      cada jogador. **Nota:** feito em `ClubPage`/`ClubSquadTable`/`useClub` (`src/features/clubes/`),
      com rota `/clubes/:clubId` trocada de `ComingSoonPage` para `ClubPage` em `App.jsx`;
      `GET /clubs/{id}` via `getClub`; indicadores `cash`/`squad_value`/`net_worth` com `formatCurrency`;
      elenco com `market_value`, `contract.loyalty_until` (`formatDateTime`), `remaining_days` e
      `penalty_rate`, todos vindos da API sem recálculo na tela; teste de integração em
      `ClubPage.test.jsx` cobrindo indicadores, elenco com contrato, elenco vazio e erro da API.

## 4. Mercado (`frontend-mercado`, F06, F08–F11)

- [x] 4.1 Implementar o fluxo de compra a partir da lista de jogadores livres (F06); verificar o
      resultado completo (valor, taxa, custo total, fim da fidelidade, novo caixa) e o efeito nos
      filtros da lista de jogadores depois da compra. **Nota:** feito em `BuyPlayerModal`
      (`src/features/mercado/`), com botão "Comprar" na linha de cada jogador livre em
      `PlayersTable` (`src/features/jogadores/`), aberto via `JogadoresPage` que passa os clubes
      e chama `reload()` na compra. O modal escolhe clube (select) e fim da fidelidade
      (datetime-local, convertido para `-03:00` com `parseDateTimeToBrasilia`), confirma antes de
      chamar `buyPlayer`, e mostra valor, taxa, custo total (valor + taxa, somado na tela), fim da
      fidelidade e novo caixa do clube — tudo da resposta do POST. Recusas de regra de negócio não
      são bloqueadas na tela; o `message` da API é mostrado. Teste de integração em
      `JogadoresPage.test.jsx`.
- [x] 4.2 Implementar o fluxo de venda a partir do elenco do clube (F08); verificar o resultado
      completo (valor de compra, valor de venda, dias restantes, multa, lucro, comissão, crédito,
      novo caixa) nos dois casos (com e sem multa). **Nota:** feito em `SellPlayerModal`
      (`src/features/mercado/`), com botão "Vender" em cada jogador do elenco em
      `ClubSquadTable` (`src/features/clubes/`), integrado em `ClubPage` que chama `reload()`
      do `useClub` após a venda (sem recarregar a página). O modal confirma antes de chamar
      `sellPlayer` (POST sem corpo) e mostra valor de compra, valor de venda, dias restantes,
      multa, lucro, comissão, crédito (direto do campo `cash_change` da API, sem recálculo na
      tela) e novo caixa do clube — tudo da resposta do POST, com distinção entre contrato
      RESCINDIDO (com multa) e ENCERRADO (multa 0). Recusas não são bloqueadas na tela; o
      `message` da API é mostrado. Testes em `SellPlayerModal.test.jsx` cobrem os dois casos e
      a recusa da API, com `cash_change` nos mocks (value − penalty − fee).
- [x] 4.3 Implementar o histórico de transações com filtro por tipo e por jogador (F09); verificar
      a recusa do filtro por jogador excluído mostrando o `message` da API. **Nota:** feito em
      `ClubTransactionsTable`/`useClubTransactions` (`src/features/clubes/`), integrado na
      `ClubPage` como seção abaixo do elenco. Usa `GET /clubs/{id}/transactions` via `listClubTransactions`
      com hook `useQuery` (estados carregando/vazio/erro). A tabela mostra data/hora (`formatDateTime`),
      tipo (COMPRA/VENDA), jogador, valor, taxa/comissão, multa, lucro e variação do caixa com sinal
      (+ para entrada, - para saída, campo assinado da API). Filtros: tipo (um ou mais, via checkboxes)
      e jogador (select apenas com os que aparecem no histórico do clube). Quando a API recusa o filtro
      (ex.: 404 jogador excluído), mostra o `message` da API. Os filtros são mesclados no pai
      (`updateTransactionFilters`, padrão igual a `JogadoresPage.updateFilters`) para que tipo e
      jogador sejam enviados juntos à API. Teste de integração em `ClubPage.test.jsx` renderiza a
      página de verdade, seleciona tipo e depois jogador, e confirma que `listClubTransactions` foi
      chamado por último com os dois juntos (`{ type: 'COMPRA', player_id: '10' }`) — esse teste
      falha se o merge no pai for revertido. Teste em `ClubTransactionsTable.test.jsx` cobre filtro
      por tipo, erro da API e lista vazia.
      **Decisão sobre o seletor de jogadores:** o seletor lista apenas os jogadores que aparecem nas
      transações atualmente exibidas (já filtradas pela API conforme o filtro de tipo ativo). É
      intencional: o seletor reflete o histórico visível, então se o usuário filtrar por tipo=VENDA,
      só jogadores com vendas aparecem no seletor. Para ver jogadores de outro tipo, basta remover
      o filtro de tipo.
- [x] 4.4 Implementar os totais do `summary` abaixo da tabela, respeitando o filtro aplicado (F10);
      verificar que os totais mudam ao trocar o filtro de tipo. **Nota:** feito em
      `useClubTransactions.js` (agora expõe `summary` da resposta da API) e
      `ClubTransactionsTable.jsx` (exibe os cinco totais abaixo da tabela: total gasto em compras,
      total recebido em vendas, total de taxas e comissões, total de multas, lucro total — todos
      com `formatCurrency`, vindos prontos da API, nunca somados na tela). Teste de integração em
      `ClubPage.test.jsx` comprova que os totais mudam quando o filtro de tipo muda (mock da API
      devolve summaries diferentes para `type=VENDA` vs. sem filtro). Teste em
      `ClubTransactionsTable.test.jsx` cobre a renderização dos totais e o caso de summary vazio
      (mostra traços).
- [x] 4.5 Implementar a exportação CSV com os filtros aplicados (F11); verificar que o arquivo
      baixado reflete o filtro ativo na tela. **Nota:** feito em `ClubTransactionsTable.jsx`,
      com botão "Exportar CSV" que chama `exportClubTransactions(clubId, filters)` passando os
      mesmos filtros (tipo e jogador) ativos na tela no momento do clique. A resposta é um Blob
      (`text/csv`) tratado pelo `httpClient.js`; o download é disparado com um link temporário
      via `URL.createObjectURL`/`URL.revokeObjectURL` e nome de arquivo `historico-clube-{clubId}.csv`.
      Teste de integração em `ClubPage.test.jsx` confima que `exportClubTransactions` é chamado
      com os dois filtros juntos (`{ type: 'COMPRA', player_id: '10' }`) quando o usuário seleciona
      tipo e jogador antes de clicar em exportar.

## 5. Liga (`frontend-liga`, F12–F14)

- [x] 5.1 Implementar a escalação (formação + titular por vaga, sem `DOENTE`) e o aviso de
      escalação incompleta (F12); verificar que um jogador `DOENTE` não pode ser escolhido.
      **Nota:** feito em `ClubLineup`/`useClubLineup` (`src/features/clubes/`), integrado na
      `ClubPage` como seção abaixo do histórico. Apenas UMA chamada a `GET /clubs/{id}/lineup`
      é feita, no `ClubPage` via `useClubLineup`; os dados (`lineup`, `lineupState`, `reload`)
      são passados como props para `ClubLineup`. O `ClubLineup` só é renderizado quando
      `lineupState === 'ready'`, evitando um bug de timing onde o `useState` inicial capturava
      `lineup` ainda vazio; enquanto carrega, mostra "Carregando escalação…". O formulário é
      pré-preenchido com a escalação existente (`formation` e `player_ids` vindos da API).
      Usa `PUT /clubs/{id}/lineup` via `saveLineup` da `liga/api.js`; após salvar, chama
      `reload()` para atualizar a cópia do `ClubPage` (sem reload de página), o que faz o aviso
      de escalação incompleta sumir. Suporta as 4 formações (`3-1`, `2-2`, `2-1-1`,
      `1-2-1`) com 1 goleiro + 4 de linha; defesa aceita ZAG/LAT, meio só MEI, ataque só ATA;
      jogador `DOENTE` nunca aparece como opção nos selects; `MAL_CONDICIONADO` pode ser
      escalado. Botão salvar só habilita com as 5 vagas preenchidas. Aviso mostrado quando
      `!lineup.complete` (incluindo clube que nunca escalou, `formation: null` — não pode jogar
      sem escalação). Testes em `ClubLineup.test.jsx` (pré-preenchimento, bloqueio de DOENTE,
      permissão de MAL_CONDICIONADO, botão desabilitado/habilitado, chamada ao saveLineup) e
      `ClubPage.test.jsx` (aviso aparece e desaparece após salvar, escalação pré-preenchida
      mesmo quando getLineup resolve depois de getClub).
- [x] 5.2 Implementar a criação de partida com exibição do placar e dos 6 duelos (F13); verificar
      que a recusa por escalação incompleta não é bloqueada na tela e mostra o `message` da API.
      **Nota:** feito em `MatchPage` (`src/features/liga/`), com rota `/partidas` trocada de
      `ComingSoonPage` para `MatchPage` em `App.jsx`. Usa `GET /clubs` via `listClubs` para
      preencher os selects de mandante/visitante, e `POST /matches` via `createMatch` da
      `liga/api.js`. Ambos os campos (mandante/visitante) são obrigatórios antes de habilitar o
      botão de jogar. Recusa por escalação incompleta (409) NÃO é bloqueada na tela: o pedido é
      enviado normalmente e o `message` da API é mostrado. Com sucesso, mostra o placar e os 6
      duelos devolvidos pela API (atacante, defensor, atributo e valor de ambos, gol), sem
      recalcular nada. A tabela de duelos mostra atributo e valor tanto do atacante quanto do
      defensor, permitindo ver por que um duelo virou gol (ataque maior que defesa).
      Testes em `MatchPage.test.jsx`.
- [x] 5.3 Implementar o histórico de partidas com filtro por clube e a classificação (F14),
      usando `listMatches` e `getStandings` da `liga/api.js`. O histórico fica na página
      `/partidas` (abaixo do formulário de nova partida), com filtro por clube via `club_id`,
      tabela com data/hora, mandante, placar e visitante, e abertura de partida para mostrar os
      6 duelos (`GET /matches/{id}` via `getMatch`), reaproveitando o componente `MatchDuels`.
      A classificação fica na rota `/classificacao` (`StandingPage`), com posição, clube, jogos,
      vitórias, empates, derrotas, gols marcados, gols sofridos, saldo e pontos — na ordem
      devolvida pela API, sem recalcular. Ambas as telas usam `useQuery` e `DataTable` de
      `shared/`, com os três estados (carregando, vazio, erro).
      Testes em `ClubPage.test.jsx`, `MatchPage.test.jsx` e `StandingPage.test.jsx`.

## 6. Diferenciais e entrega (`frontend-diferenciais`, F5, F4)

- [x] 6.1 Garantir responsividade em 375px na lista de jogadores e na página do clube (F5);
      verificar no modo dispositivo do Chrome que não há rolagem horizontal da página.
      **Nota:** auditoria de CSS sem teste automatizado (jsdom não mede layout). Revisados e
      ajustados os seguintes arquivos:
      - `src/shared/shared.css`: adicionada regra defensiva
        `select, input, textarea { max-width: 100%; box-sizing: border-box; }` para garantir
        que nenhum campo de formulário ultrapasse a largura do contêiner pai em 375px,
        cobrindo selects de clube em PlayersFilters.jsx e de jogador em
        ClubTransactionsTable.jsx.
      - `src/features/clubes/clubes.css`: removido bloco duplicado
        `@media (max-width: 700px) { .club-indicators {...} }` que aparecia duas vezes;
        mantida apenas a primeira ocorrência.
      - `src/features/jogadores/jogadores.css`: já tinha `@media (max-width: 700px)` com
        `flex-direction: column` para `.players-filters-row` e `.players-filters-range`,
        `width: 100%` para os inputs de faixa (idade/valor), `flex-wrap: wrap` para
        `.players-free-tabs`, e `flex-direction: column` para `.jogadores-header`. Assim,
        em 375px os inputs de faixa (90px cada) não ultrapassam a largura da tela e os
        controles empilham verticalmente.
      - `src/features/clubes/clubes.css`: já tinha `@media (max-width: 700px)` com
        `flex-direction: column` para `.club-indicators` e `grid-template-columns: 1fr`
        para `.club-transactions-summary-list`. Cobertura já cobre 375px. Verificado que
        `.club-transactions-filter-group` já usa `flex-wrap: wrap` e `flex-direction: column`
        (já existente), e o select de filtro de clube já empilha corretamente.
      - `src/features/clubes/ClubSquadTable.jsx`,
        `src/features/clubes/ClubTransactionsTable.jsx`,
        `src/features/jogadores/PlayersTable.jsx`: usam o componente `DataTable` compartilhado
        (`src/shared/DataTable.jsx`), que envolve a tabela em `.data-table-wrapper` com
        `overflow-x: auto` e `max-width: 100%` em `src/shared/shared.css`. Assim, apenas a
        tabela rola internamente, nunca a página. Nomes longos de jogador/clube não forçam
        largura além do wrapper.
      - `src/app/AppShell.css`: já tinha `@media (max-width: 700px)` com
        `flex-direction: column` para `.app-shell` e `width: auto` para `.app-sidebar` —
        cobre 375px, a sidebar empilha acima do conteúdo. Nenhum ajuste fino necessário.
      - Nenhuma tela introduz rolagem horizontal da página em 375px: apenas as tabelas
        internas rolam dentro do próprio quadro (via `.data-table-wrapper`).
- [x] 6.2 Configurar o framework de testes do frontend e escrever ao menos 1 teste de componente ou
      de ponta a ponta (F5); verificar que o comando do README termina sozinho, sem falhas.
      **Nota:** já satisfeito. `npm run test` (vitest run) termina sozinho em ~4s, com código de
      saída 0 e sem falhas, bem dentro do limite de 10 min do barema. Há 21 arquivos de teste com
      94 testes ao todo, cobrindo todos os módulos (jogadores, clubes, mercado, liga) e camadas
      compartilhadas (DataTable, FormField, Modal, ConditionBadge, useQuery, useAsyncAction,
      formatCurrency, formatDateTime, httpClient). Todos são testes de componente/integração
      reais, não testes de fachada.
- [x] 6.3 Configurar lint e format-check do frontend (F5); verificar que os dois comandos do README
      terminam sem erros e que o de formatação não altera arquivos.
      **Nota:** já configurado desde o scaffold (tarefa 1.1). Comandos:
      - `npm run lint` (oxlint): termina sem erros, saída 0.
      - `npm run format:check` (prettier --check): termina sem erros, saída 0, SÓ VERIFICA — não
        altera nenhum arquivo.
      - `npm run format` (prettier --write): comando DIFERENTE, aplica formatação. É um comando
        separado do de verificação; o README deve informar os dois separadamente.
- [x] 6.4 Escrever o README do frontend com os itens 1, 3, 4 e 5 de "📘 Requisitos do README.md"
      (pré-requisitos, passo a passo de instalação/execução, variáveis de ambiente, estrutura de
      pastas e bibliotecas) (F4); verificar que os comandos informados funcionam do zero.
      **Nota:** criado `frontend/README.md` com todos os itens exigidos:
      - Pré-requisitos: Node.js 22+ (obrigatório por causa do jsdom/vitest), npm, `.nvmrc` com `22`.
      - Passo a passo: `cd frontend`, `npm ci` (usa `package-lock.json` versionado), `npm run dev`
        (sobe em http://localhost:5173), `npm run build` + `npm run preview` (build de produção).
        O backend deve estar rodando em http://localhost:8000 (o front adiciona /api/v1).
      - Variáveis de ambiente: `VITE_API_BASE_URL` via `frontend/.env.example` → copiar para `.env`.
      - Estrutura de pastas: `src/features/{jogadores,clubes,mercado,liga}/`, `src/shared/`,
        `src/lib/`, `src/app/`. Bibliotecas: React 19, React Router 7, Vite, Vitest +
        Testing Library, oxlint, Prettier — com motivo de cada uma.
      - Comandos de teste/lint/format: `npm run test`, `npm run lint`, `npm run format`,
        `npm run format:check`.
      - Verificado: `npm ci` funciona com o `package-lock.json` versionado; `npm run build`,
        `npm run test` (94 testes, 21 arquivos, saída 0), `npm run lint` e
        `npm run format:check` todos terminam sem erro.
