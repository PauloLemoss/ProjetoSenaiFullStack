## 1. Tailwind e tokens de tema (`frontend-design-system`)

- [x] 1.1 Instalar `tailwindcss` e `@tailwindcss/vite`, registrar o plugin em
      `frontend/vite.config.js` e substituir `frontend/src/index.css` por `@import "tailwindcss";`
      mais o bloco `@theme` com os tokens de cor, tipografia, espaçamento e raio de borda definidos
      em `design.md`; verificar que `npm run dev` e `npm run build` terminam sem erro e que uma
      classe utilitária do Tailwind (ex.: `bg-surface`) aplica o estilo esperado numa página de
      teste.
- [x] 1.2 Remover `color-scheme: light dark` e o bloco `@media (prefers-color-scheme: dark)` de
      `index.css`; verificar manualmente, com o sistema operacional em modo escuro, que a tela
      continua com fundo claro ("Tema claro fixo", `frontend-design-system`).

## 2. Componentes compartilhados e navegação (`frontend-design-system`)

- [x] 2.1 Redesenhar `src/shared/DataTable.jsx` com Tailwind: cartão com sombra e cantos
      arredondados, cabeçalho destacado, estados de carregando/vazio/erro estilizados; verificar
      que os testes existentes (`DataTable.test.jsx`) continuam passando e que a tabela de
      jogadores mostra o novo visual.
- [x] 2.2 Redesenhar `src/shared/FormField.jsx` com Tailwind: estado de foco visível e erro em
      vermelho junto ao campo; verificar que `FormField.test.jsx` continua passando e que tabular
      até um campo mostra o contorno de foco.
- [x] 2.3 Redesenhar `src/shared/Modal.jsx` com Tailwind: sobreposição escurecida, cartão
      centralizado com sombra; verificar que `Modal.test.jsx` continua passando e que abrir
      qualquer modal (ex.: cadastro de jogador) mostra a sobreposição e o cartão centralizados.
- [x] 2.4 Redesenhar `src/shared/ConditionBadge.jsx` com as cores de status do tema (verde/âmbar/
      vermelho); criar os estilos de botão primário/secundário/perigo como classes utilitárias
      reaproveitadas (ex.: via um pequeno componente `Button`); verificar que
      `ConditionBadge.test.jsx` continua passando e que o botão "Excluir" usa a cor de perigo em
      pelo menos duas telas diferentes (jogadores e elenco do clube).
- [x] 2.5 Redesenhar `src/app/AppShell.jsx`/`AppShell.css` com Tailwind: marca com identidade
      visual, destaque forte do link da rota ativa, sidebar responsiva em 375px; verificar
      manualmente a navegação entre as quatro rotas e a ausência de rolagem horizontal em 375px.

## 3. Tela inicial (`frontend-index`)

- [x] 3.1 Criar a tela inicial (`src/features/home/HomePage.jsx` ou equivalente) com nome do
      sistema, descrição curta e quatro cartões de navegação (Jogadores, Clubes, Partidas,
      Classificação); trocar, em `frontend/src/App.jsx`, a rota `index` de
      `<Navigate to="/jogadores" replace />` para a nova tela; verificar manualmente que acessar
      `/` mostra a tela inicial (sem redirecionamento) e que cada cartão navega para a rota certa
      sem recarregar a página.
- [x] 3.2 Mostrar nos cartões de Jogadores e Clubes a contagem vinda de `meta.total_items` (`GET
      /players`) e da quantidade de itens de `GET /clubs`, sem nenhum cálculo adicional; verificar
      com um teste de integração que os números exibidos batem com os dados mockados da API.

## 4. Jogadores (`frontend-jogadores-visual`)

- [x] 4.1 Redesenhar `PlayersFilters.jsx` com Tailwind: campos em grade responsiva com rótulos
      visíveis, abas Todos/Livres/Em clubes como controle segmentado; verificar manualmente que os
      filtros continuam combináveis como antes (sem mudança de comportamento) e que a aba ativa tem
      destaque visual.
- [x] 4.2 Substituir o menu de ações de `PlayersTable.jsx` (`<details>`/`<summary>`) por um menu
      suspenso controlado em React, estilizado com Tailwind, fechando ao clicar fora ou pressionar
      Escape; atualizar `JogadoresPage.test.jsx`/`PlayersTable` conforme necessário para a nova
      interação; verificar que os testes passam e que a opção "Excluir" só aparece, com destaque de
      perigo, para jogador livre.
- [x] 4.3 Redesenhar os modais de jogador (`PlayerCreateModal`, `PlayerEditModal`,
      `PlayerConditionModal`, `DeletePlayerModal`, `PlayerDetailsModal`) com Tailwind, campos em
      grade responsiva no cadastro/edição e botão de perigo na confirmação de exclusão; verificar
      que os testes de integração existentes desses fluxos continuam passando.

## 5. Clubes (`frontend-clubes-visual`)

- [x] 5.1 Redesenhar `ClubesPage.jsx`/`ClubesTable.jsx`/`ClubCreateModal.jsx` com Tailwind,
      alinhando o botão "Novo clube" ao estilo do botão "Novo jogador"; verificar que
      `ClubesPage.test.jsx` continua passando.
- [x] 5.2 Redesenhar os indicadores financeiros de `ClubPage.jsx` (caixa, valor do elenco,
      patrimônio) como cartões lado a lado, empilhados em 375px; verificar manualmente a ausência
      de rolagem horizontal em 375px e que `ClubPage.test.jsx` continua passando.
- [x] 5.3 Redesenhar `ClubSquadTable.jsx` e `ClubTransactionsTable.jsx` com Tailwind, botão
      "Vender" com cor de perigo e os totais do `summary` num cartão de resumo separado da tabela;
      verificar que `ClubTransactionsTable.test.jsx` continua passando.
- [x] 5.4 Redesenhar `ClubLineup.jsx` com Tailwind, destacando com cor e ícone de alerta o aviso de
      escalação incompleta; verificar manualmente o aviso com uma escalação incompleta.

## 6. Mercado (`frontend-mercado-visual`)

- [x] 6.1 Redesenhar `BuyPlayerModal.jsx` com Tailwind, resultado da compra num cartão de sucesso;
      verificar manualmente o fluxo de compra completo.
- [x] 6.2 Redesenhar `SellPlayerModal.jsx` com Tailwind, resultado da venda no mesmo padrão visual
      do resultado da compra; verificar que `SellPlayerModal.test.jsx` continua passando.

## 7. Liga (`frontend-liga-visual`)

- [x] 7.1 Redesenhar o formulário de nova partida e o resultado (placar e duelos) em
      `MatchPage.jsx`/`MatchDuels.jsx` com Tailwind, placar em destaque tipográfico e duelo com gol
      destacado visualmente; verificar que `MatchPage.test.jsx` continua passando.
- [x] 7.2 Redesenhar `StandingPage.jsx` com Tailwind, com destaque sutil nas primeiras posições da
      classificação, sem alterar a ordem devolvida pela API; verificar que `StandingPage.test.jsx`
      continua passando.

## 8. Limpeza e verificação final

- [x] 8.1 Remover `AppShell.css`, `jogadores.css`, `clubes.css` e `shared.css` depois que todas as
      telas que os usavam estiverem migradas para Tailwind; verificar por busca de texto que
      nenhuma tela ainda importa esses arquivos.
- [x] 8.2 Rodar a suíte de testes (`npm run test`), o lint (`npm run lint`) e a verificação de
      formatação (`npm run format:check`) do frontend; verificar que os três terminam sem falhas.
- [x] 8.3 Verificar manualmente, no modo dispositivo do Chrome em 375px de largura, a lista de
      jogadores e a página do clube (com o histórico de transações aberto): sem rolagem horizontal
      da página, com todas as ações continuando acessíveis (F5, `frontend-design-system`).

## 9. Refinamento do padrão visual pós-feedback (`frontend-design-system`, `frontend-jogadores-visual`)

- [x] 9.1 Criar os componentes compartilhados `Avatar`, `ProgressBar`, `PageHeader` e os ícones de
      linha em `src/shared/Icon.jsx`; reescrever `ConditionBadge.jsx` para o estilo ponto colorido +
      texto; verificar que `ConditionBadge.test.jsx` continua passando.
- [x] 9.2 Redesenhar `AppShell.jsx`: contador numérico por item de navegação (vindo de
      `meta.total_items`/tamanho das listas, sem cálculo no frontend), diretório de clubes com
      avatar e botão de novo clube, e barra lateral recolhível; verificar que `App.test.jsx`
      continua passando (nomes acessíveis dos links preservados com `aria-label`).
- [x] 9.3 Redesenhar `PlayersFilters.jsx`: busca com ícone de lupa, filtros de posição/condição/
      clube como pills com ícone e seta, abas Todos/Livres/Em clubes com contagem
      (`usePlayersTabCounts.js`, 3 chamadas a `GET /players?limit=1` com os demais filtros
      aplicados) e ordenação como pill própria; verificar manualmente que os filtros continuam
      combináveis como antes.
- [x] 9.4 Redesenhar `PlayersTable.jsx`: coluna "Jogador" com avatar + nome + posição por extenso,
      coluna "Agilidade" com `ProgressBar`, coluna "Clube" com selo de sigla, botão "Comprar" visível
      fora do menu "..." para jogador livre; atualizar `JogadoresPage.test.jsx` para a nova
      interação (sem o botão "Ações" antigo); verificar que a suíte de testes continua passando.
- [x] 9.5 Aplicar `PageHeader` (chip de ícone + título + subtítulo) em `JogadoresPage.jsx`,
      `ClubesPage.jsx`, `MatchPage.jsx` e `StandingPage.jsx`; verificar que os testes de cada uma
      continuam passando.
- [x] 9.6 Rodar `npm run test`, `npm run lint`, `npm run format:check` e `npm run build`; verificar
      que os quatro terminam sem falhas.

## 10. Atalho para a tela inicial (`frontend-design-system`)

- [x] 10.1 Adicionar um item de navegação "Início" no topo de `AppShell.jsx` (ícone `IconHome`, já
      existente em `src/shared/Icon.jsx` e sem uso), acima das seções "Mercado" e "Liga", apontando
      para `/`; verificar manualmente que o atalho aparece em todas as telas e que clicar nele leva
      para a tela inicial sem recarregar a página.
- [x] 10.2 Aplicar a mesma lógica de destaque de rota ativa dos demais itens de navegação ao item
      "Início" quando a rota atual for `/`; verificar manualmente o destaque ao abrir a tela inicial.
- [x] 10.3 Verificar que o item "Início" continua visível (ao menos como ícone) com a barra lateral
      recolhida, e que `App.test.jsx`/demais testes de navegação continuam passando depois do ajuste.
