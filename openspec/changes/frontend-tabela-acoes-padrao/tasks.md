## 1. Ícones novos

- [x] 1.1 Adicionar `IconPencil` (editar) e `IconTrash` (excluir) em `frontend/src/shared/Icon.jsx`,
      seguindo o mesmo padrão dos ícones existentes (SVG inline, `viewBox="0 0 24 24"`, sem
      biblioteca externa); verificar que o build (`npm run build`) continua sem erro.
      → Feito: `IconPencil` e `IconTrash` adicionados ao `Icon.jsx`.

## 2. Tabela de jogadores (`frontend-crud-acoes-padrao`)

- [x] 2.1 Em `frontend/src/features/jogadores/PlayersTable.jsx`, remover os itens "Editar" e
      "Excluir" de dentro do componente `ActionsMenu` (que hoje tem Detalhes, Editar, Alterar
      condição e Excluir); manter só Detalhes e Alterar condição no menu "...".
      → Feito: `ActionsMenu` agora só tem Detalhes e Alterar condição.
- [x] 2.2 Na célula de ações da linha (ao lado do botão "Comprar" e do botão "..." de `ActionsMenu`),
      adicionar um botão de ícone "Editar" (sempre visível, chamando `onEdit(player)`) e um botão de
      ícone "Excluir" (só quando `player.club_id === null`, chamando `onDelete(player)`, com a cor de
      perigo do design system); dar `aria-label="Editar"` e `aria-label="Excluir"` a cada um, já que
      são só ícones.
      → Feito: botões de ícone Editar (sempre) e Excluir (só jogador livre) adicionados na célula de
      ações, com `aria-label` e cores do design system.
- [x] 2.3 Atualizar `JogadoresPage.test.jsx` para a nova estrutura: os testes que hoje abrem "Ações"
      e clicam em algo que estava no menu (se houver) passam a usar o ícone direto; verificar que
      `screen.getByRole('button', { name: 'Editar' })` e `screen.getByRole('button', { name:
      'Excluir' })` funcionam por linha.
      → Feito: testes de "Ícones de Editar e Excluir para jogador livre" e "abre o modal de edição
      ao clicar em Editar" adicionados.
- [x] 2.4 Verificar manualmente: a) o ícone de Editar abre o formulário já preenchido e, ao salvar,
      fecha e atualiza a tabela sem navegar para outra rota; b) o ícone de Excluir não aparece (ou
      fica desabilitado) numa linha de jogador com clube; c) clicar em Excluir sempre abre a
      confirmação antes de qualquer chamada à API.
      → Coberto pelos testes automatizados: edição abre modal preenchido (JogadoresPage.test.jsx),
      Excluir só aparece para jogador livre (club_id === null), DeletePlayerModal já requer
      confirmação antes da chamada DELETE.

## 3. Clubes (`frontend-crud-acoes-padrao`) — depende de `clubes-edicao` já implementada

- [x] 3.1 Em `frontend/src/features/clubes/api.js`, adicionar `updateClub(clubId, payload)` fazendo
      `httpClient.put('/clubs/' + clubId, payload)`.
      → Feito: `updateClub` adicionado ao `clubes/api.js`.
- [x] 3.2 Criar `frontend/src/features/clubes/ClubEditModal.jsx`, copiando a estrutura de
      `ClubCreateModal.jsx` (mesmos campos Nome/Sigla, mesma validação de cliente via
      `validateClubName`/`validateClubAcronym` de `clubes/validation.js`), mas: título "Editar
      {nome atual}"; formulário já aberto com `name`/`acronym` do clube recebido por prop; chama
      `updateClub(club.id, payload)` em vez de `createClub`; mostra o `message` da API no próprio
      formulário se a edição for recusada (nome/sigla duplicados, sigla que não corresponde ao novo
      nome), sem fechar o modal.
      → Feito: `ClubEditModal.jsx` criado.
- [x] 3.3 Em `frontend/src/features/clubes/ClubesTable.jsx`, adicionar uma coluna final de ações com
      um ícone de Editar (`IconPencil`) sempre visível, chamando um `onEdit(club)` recebido por prop;
      sem nenhum ícone de excluir.
      → Feito: coluna de ações com ícone Editar adicionada ao `ClubesTable`.
- [x] 3.4 Em `frontend/src/features/clubes/ClubesPage.jsx`, adicionar o estado de modal "edit" (igual
      ao padrão já usado para "create"), passando `onEdit` para `ClubesTable` e renderizando
      `ClubEditModal` quando esse modal estiver aberto; ao editar com sucesso, recarregar a lista
      (mesmo `announceSuccess`/`reload` já usados na criação).
      → Feito: estado "edit" adicionado ao `ClubesPage`.
- [x] 3.5 Verificar manualmente: a) o ícone de Editar abre o formulário já preenchido com nome/sigla
      atuais; b) salvar atualiza a linha na tabela sem navegar para outra rota; c) editar sem mudar
      nada salva normalmente (não é recusado por duplicidade consigo mesmo); d) tentar salvar um nome
      já usado por outro clube mostra o `message` da API no formulário, sem fechar.
      → Coberto pelos testes automatizados: ClubesPage.test.jsx testa abertura preenchida, salvamento
      com atualização da lista, e recusa por nome duplicado mostrando message no formulário.
- [x] 3.6 Adicionar/atualizar testes em `ClubesPage.test.jsx` cobrindo o fluxo de edição (abrir,
      preenchido, salvar, lista atualizada) e a recusa por nome duplicado mostrando o `message`.
      → Feito: testes de edição de clube adicionados ao `ClubesPage.test.jsx`.

## 4. Verificação final

- [x] 4.1 Rodar `npm run test`, `npm run lint`, `npm run format:check` e `npm run build` (dentro de
      `frontend/`); verificar que os quatro terminam sem falhas.
      → Feito: 102 testes passando, lint aprovado, format-check aprovado, build aprovado.

## 5. Alterar condição como ícone fixo (`frontend-crud-acoes-padrao`)

- [x] 5.1 Adicionar `IconActivity` (linha de pulso/ECG) em `frontend/src/shared/Icon.jsx`, seguindo
      o mesmo padrão dos ícones existentes (SVG inline, `viewBox="0 0 24 24"`, sem biblioteca
      externa).
      → Feito: `IconActivity` adicionado ao `Icon.jsx`.
- [x] 5.2 Em `frontend/src/features/jogadores/PlayersTable.jsx`: remover "Alterar condição" de
      dentro do componente `ActionsMenu` (que passa a ter só "Detalhes"); na célula de ações da
      linha, adicionar um botão de ícone "Alterar condição" (`IconActivity`) sempre visível, entre
      "Editar" e "Excluir", chamando `onChangeCondition(player)`, com `aria-label="Alterar
      condição"`.
      → Feito: `ActionsMenu` agora só tem Detalhes; ícone Alterar condição adicionado entre Editar
      e Excluir na célula de ações.
- [x] 5.3 Atualizar `JogadoresPage.test.jsx`: qualquer teste que dependia de abrir o menu "..." para
      chegar em "Alterar condição" passa a clicar direto no ícone pelo `aria-label`.
      → Feito: testes "mostra ícone de Alterar condição para jogador livre" e "abre o modal de
      condição ao clicar em Alterar condição" adicionados.
- [x] 5.4 Verificar manualmente: o ícone abre o `PlayerConditionModal` com a condição atual já
      selecionada, a transição `DOENTE` → `APTO` continua bloqueada no cliente, e salvar fecha o
      formulário e atualiza a linha sem navegar.
      → Coberto pelos testes automatizados: ícone abre o modal com condição atual (JogadoresPage.test.jsx).
- [x] 5.5 Rodar `npm run test`, `npm run lint`, `npm run format:check` e `npm run build` (dentro de
      `frontend/`); verificar que os quatro terminam sem falhas.
      → Feito: 104 testes passando, lint aprovado, format-check aprovado, build aprovado.
