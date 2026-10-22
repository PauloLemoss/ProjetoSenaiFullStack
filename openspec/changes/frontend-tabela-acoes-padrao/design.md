## Context

O usuário pediu um padrão universal de ações (Editar/Excluir sempre visíveis, fluxo de edição e de
exclusão padronizados) para "todas as telas de listagem do sistema (seja Clubes, Jogadores,
Partidas, etc.)". Esta seção registra a verificação, entidade por entidade, do que o contrato de API
já fixado pelo desafio realmente suporta, para que a decisão de aplicar o padrão só a jogadores
fique rastreável.

Rotas registradas hoje (`backend/src/mercado_jogadores/*/router.py`):
- `jogadores/router.py`: `GET`, `POST`, `GET /{id}`, `PUT /{id}`, `PATCH /{id}/condition`,
  `DELETE /{id}`.
- `clubes/router.py`: só `GET` e `POST`. Sem `PUT`/`PATCH`/`DELETE`.
- `liga/router.py`: `POST /matches`, `GET /matches`, `GET /matches/{id}`, `GET /standings`, mais
  `PUT`/`GET` de `/clubs/{id}/lineup` (escalação, não é "editar uma partida"). Sem `PUT`/`DELETE` de
  partida.
- `mercado/router.py`: `POST /players/{id}/buy`, `POST /players/{id}/sell`,
  `GET /clubs/{id}/transactions` (+ export). Sem `PUT`/`DELETE` de transação.

Isso bate com as regras de domínio já documentadas no projeto: `clubes` nunca são excluídos e, até
aqui, só mudavam por `UPDATE` interno de caixa (nunca por um formulário de edição genérico);
`transacoes` e `partidas`/`duelos_partida` são logs imutáveis, sem `UPDATE` nem `DELETE` depois de
criados (RN17, RN20); `escalacoes` é a única tabela com `DELETE` real, mas isso já é coberto pela
tela de escalação, não por "editar/excluir uma escalação" como registro de listagem.

Depois de apresentar esse recorte ao usuário, a decisão (ver `clubes-edicao/proposal.md`) foi
adicionar edição de nome/sigla de clube no backend, mantendo a exclusão de clube proibida. Esta
change de frontend passa a cobrir Jogadores (Editar + Excluir) e Clubes (só Editar), e continua sem
tocar Partidas, Classificação e o histórico de transações, cujas regras de imutabilidade (RN17,
RN20) não foram reabertas pelo usuário.

## Goals / Non-Goals

**Goals:**
- Tornar Editar, Alterar condição e Excluir sempre visíveis na tabela de jogadores, em vez de
  escondidos no menu "...".
- Tornar Editar sempre visível na tabela de clubes, consumindo o `PUT /clubs/{id}` de
  `clubes-edicao`.
- Deixar explícito, com evidência no código do backend, por que o padrão não se estende a Partidas,
  Classificação e histórico de transações — para a próxima pessoa (ou agente) que revisar isso não
  precisar refazer a investigação.

**Non-Goals:**
- Não adiciona Editar/Excluir em Partidas, Classificação ou histórico de transações.
- Não adiciona ícone de Excluir em Clubes — a exclusão de clube continua proibida.
- Não adiciona nenhum endpoint novo em `backend/` por esta change (o endpoint de edição de clube
  vem de `clubes-edicao`, uma change de backend separada).
- Não muda o conjunto de campos editáveis de um jogador (continua nome, posição, agilidade e idade,
  por regra do enunciado — F04) nem os campos editáveis de um clube (continuam nome e sigla, por
  `clubes-edicao`).

## Decisions

### Mover Editar/Excluir (e depois Alterar condição) para ícones fixos, manter só Detalhes no menu "..."
A primeira versão desta change cobria só "ícones de Alterar e Excluir", citados assim pelo pedido
original — não *todas* as ações. `PlayersTable.jsx` (de `frontend-redesign-tailwind`) tinha as
quatro ações (Detalhes, Editar, Alterar condição, Excluir) dentro de um menu "..." mais um botão
"Comprar" separado. Depois de discutir o fluxo de "Alterar condição" com o usuário (é um Update de
um campo só, usado com frequência, acoplado à própria linha da listagem — igual Editar/Excluir), ele
pediu para promover essa ação também a ícone fixo. A versão final: Editar, Alterar condição e
Excluir saem do menu como três ícones fixos ao lado de "Comprar"; só "Detalhes" continua no menu
"...".

**Alternativa considerada:** tirar também "Detalhes" do menu, deixando as quatro ações visíveis na
linha. Mais literal ao espírito de "ações visíveis", mas "Detalhes" é uma ação de leitura (abre uma
visão só de consulta), diferente das outras três (que mudam dado); manter só ela no menu "..." evita
competir por espaço com "Comprar" e as colunas de dados já densas da tabela (ver
`frontend-jogadores-visual`), sem esconder nenhuma ação que muda estado do jogador atrás de um menu.

### Novos ícones: lápis (Editar), lixeira (Excluir) e um ícone de pulso/atividade (Alterar condição) em `src/shared/Icon.jsx`
Seguindo a decisão já registrada em `frontend-redesign-tailwind/design.md` ("Sem biblioteca de
ícones"), os três ícones são SVGs inline simples, no mesmo arquivo `Icon.jsx` dos demais. O ícone de
Alterar condição usa uma linha de pulso/ECG (`IconActivity`), associando visualmente a ação à
condição física do jogador — o mesmo conceito que o badge de condição já usa (ponto colorido), só
que como ação, não como exibição de estado.

### Clube: ícone de Editar na tabela, reaproveitando o `ClubCreateModal` como `ClubEditModal`
`ClubEditModal.jsx` é um componente novo, mas copia a estrutura de `ClubCreateModal.jsx`
(`FormField` de nome e sigla, mesma validação de formato no cliente via `validateClubName`/
`validateClubAcronym` já existentes em `clubes/validation.js`) — só troca `createClub` por uma nova
`updateClub(id, payload)` em `clubes/api.js`, e abre com os campos já preenchidos com os valores
atuais do clube, em vez de vazios. Recusas que dependem do banco (nome/sigla duplicados de outro
clube, sigla que não corresponde ao novo nome) não são bloqueadas no cliente: o pedido é enviado e o
`message` da API aparece no formulário, do mesmo jeito que `ClubCreateModal` já faz hoje.

**Alternativa considerada:** reaproveitar `ClubCreateModal` como o mesmo componente para os dois
fluxos (criar e editar), com uma prop `club` opcional. Mais enxuto em número de arquivos, mas mistura
dois textos de título/botão ("Novo clube" vs. "Editar clube") e duas chamadas de API diferentes
(`createClub` vs. `updateClub`) num único componente — rejeitada em favor de dois componentes
pequenos e diretos, no mesmo espírito de `PlayerCreateModal`/`PlayerEditModal`, que já são separados
no projeto.

### Exclusão não aplicável a Partidas/Classificação/Transações: documentar, não implementar
Em vez de simplesmente ignorar os itens de Partidas/Classificação/Transações do pedido original, a
exclusão fica documentada (aqui e em `proposal.md`) com a evidência concreta (rotas registradas,
regras de negócio já fechadas pelo enunciado) — para o caso de o usuário ou uma correção futura
perguntar "por que essas telas não têm os botões". Clubes já não está mais nessa lista: depois de
perguntado, o usuário decidiu adicionar edição (não exclusão) de clube — ver `clubes-edicao`.

**Alternativa considerada:** propor ao usuário adicionar os endpoints que faltam também em Partidas
e no histórico de transações. Rejeitada sem perguntar nesta change porque alteraria RN17 e RN20, que
são regras de negócio explícitas do enunciado do desafio (projeto de estudo de caso com API fechada
e corrigida por script automatizado), diferente do que aconteceu com Clubes, onde não havia uma
regra de imutabilidade explícita sendo quebrada — só a ausência de um endpoint de edição.

## Risks / Trade-offs

- [Trade-off] Separar só Editar/Excluir do menu "..." deixa duas ações "fixas" e duas "escondidas"
  na mesma linha em Jogadores, uma assimetria que colocar as quatro ações como ícones evitaria —
  aceito porque segue literalmente o que foi pedido, sem aumentar escopo por conta própria.
- [Risco] A parte de Clubes desta change depende de `clubes-edicao` já estar implementada (endpoint
  `PUT /clubs/{id}` existindo) → Mitigação: implementar e mergear `clubes-edicao` antes (ou junto)
  da parte de Clubes desta change; a parte de Jogadores não tem essa dependência e pode ser feita
  antes, de forma independente.
