## Purpose

Define as telas de jogadores do frontend: listagem com paginação, busca, filtros e ordenação,
exclusão de jogador livre, cadastro, edição e alteração de condição física, conforme F01–F04 do
barema. Depende da capability de backend `jogadores` para os campos e as regras que essas telas
consomem, e de `frontend-conventions` para as regras transversais (camada de API, estados de
lista, mensagens, formulários).

## ADDED Requirements

### Requirement: Tabela de jogadores com paginação e total (F01)
A tela de listagem de jogadores (`GET /players`) SHALL mostrar, em tabela, `name`, `position`,
`overall`, `agility`, `age`, `condition`, `base_value`, `market_value` e o clube do jogador (nome
ou sigla, "Livre" quando `club_id` for nulo). A tela SHALL paginar com 10 jogadores por página,
com navegação entre páginas e o total de jogadores encontrados (`meta.total_items`).

#### Scenario: Página intermediária mostra 10 jogadores e o total
- **WHEN** 23 jogadores atendem aos filtros aplicados e a tela está na página 1
- **THEN** a tabela mostra 10 jogadores, a navegação permite ir à página 2 e 3, e o total exibido é
  23

#### Scenario: Jogador sem clube mostra "Livre"
- **WHEN** um jogador tem `club_id` nulo
- **THEN** a coluna de clube mostra "Livre"

#### Scenario: Jogador com clube mostra o nome ou a sigla do clube
- **WHEN** um jogador tem `club_id` não nulo
- **THEN** a coluna de clube mostra o nome ou a sigla do clube correspondente

### Requirement: Busca por nome e filtros combináveis (F02)
A tela SHALL oferecer busca por nome (`search`, ignorando maiúsculas, minúsculas e acentos) e
filtros por posição, condição, só livres (`free`), clube (`club_id`), faixa de idade
(`min_age`/`max_age`) e faixa de valor de mercado (`min_value`/`max_value`), combináveis entre si e
aplicados sem recarregar a página. A combinação de `free=true` com um filtro de clube SHALL seguir
a regra de recusa previsível definida em `frontend-conventions`.

#### Scenario: Busca ignora acentos e caixa
- **WHEN** o usuário busca por "joao"
- **THEN** jogadores com nome "João Silva" aparecem no resultado

#### Scenario: Filtros de posição, condição, idade e valor combinados
- **WHEN** o usuário aplica filtro de condição "Mal condicionado", faixa de idade 18 a 30 e faixa
  de valor de mercado 10,00 a 60,00 ao mesmo tempo
- **THEN** a tabela mostra só os jogadores que atendem aos três filtros combinados, com os filtros
  ativos visíveis e um botão para limpá-los

#### Scenario: Filtro por clube junto com paginação continua navegável
- **WHEN** o usuário filtra por um clube com mais de 10 jogadores
- **THEN** a tabela pagina normalmente dentro do resultado filtrado, com o total refletindo só os
  jogadores desse clube

### Requirement: Ordenação da listagem de jogadores (F02)
A tela SHALL oferecer ordenação por nome (padrão), por valor de mercado (crescente e decrescente),
por idade (crescente e decrescente) e por posição, aplicada via `sort` na API, sem reordenar os
dados no cliente.

#### Scenario: Ordenar por valor de mercado decrescente
- **WHEN** o usuário escolhe "maior valor de mercado"
- **THEN** a tabela mostra os jogadores na ordem devolvida pela API com `sort=value_desc`

#### Scenario: Ordenar por posição usa a ordem devolvida pela API
- **WHEN** o usuário escolhe ordenar por posição
- **THEN** a tabela mostra os jogadores na ordem devolvida pela API (`sort=position`), sem
  reordenar alfabeticamente no cliente

### Requirement: Excluir jogador livre com confirmação (F03)
A tela SHALL mostrar o botão Excluir somente nas linhas de jogadores livres (`club_id` nulo); o
clique SHALL abrir uma confirmação antes de enviar `DELETE /players/{id}`; depois da exclusão
(`204`), o jogador SHALL sair da lista sem recarregar a página.

#### Scenario: Jogador com clube não mostra o botão Excluir
- **WHEN** um jogador tem `club_id` não nulo
- **THEN** a linha dele não mostra o botão Excluir (ou mostra desabilitado)

#### Scenario: Confirmação exclui o jogador e ele sai da lista
- **WHEN** o usuário clica em Excluir num jogador livre e confirma
- **THEN** a API responde `204`, e o jogador some da tabela sem a página recarregar

### Requirement: Cadastro de jogador com os sete indicadores (F04)
O formulário de cadastro (`POST /players`) SHALL pedir `name`, `position`, `agility`, `age` e os
sete indicadores (`pace`, `shooting`, `passing`, `dribbling`, `defending`, `physical`,
`potential`), todos obrigatórios. O valor base e o `overall` SHALL não aparecer no formulário —
são calculados pela API e exibidos só depois do cadastro, na confirmação e na tabela.

#### Scenario: Formulário pede os campos obrigatórios do cadastro
- **WHEN** o usuário abre o formulário de novo jogador
- **THEN** ele vê campos para nome, posição, agilidade, idade e os sete indicadores, sem campo
  para valor base ou overall

#### Scenario: Valor base e overall aparecem só depois de salvar
- **WHEN** o cadastro é concluído com sucesso
- **THEN** a tela mostra o valor base e o overall calculados pela API, nunca calculados no
  formulário

### Requirement: Edição de jogador (F04)
O formulário de edição (`PUT /players/{id}`) SHALL permitir alterar apenas `name`, `position`,
`agility` e `age`, exigindo os quatro campos mesmo que só um mude; os sete indicadores e o valor
base SHALL não aparecer editáveis. Mudar a posição de um jogador com clube e informar idade menor
que a atual SHALL seguir a regra de recusa previsível definida em `frontend-conventions`.

#### Scenario: Edição envia os quatro campos
- **WHEN** o usuário altera só a agilidade de um jogador e salva
- **THEN** a tela envia `PUT /players/{id}` com `name`, `position`, `agility` e `age`, mantendo os
  três primeiros iguais aos atuais

#### Scenario: Idade menor que a atual é impedida ou mostra o message
- **WHEN** o usuário tenta salvar uma idade menor que a idade atual do jogador
- **THEN** a tela impede o envio mostrando o motivo, ou envia o pedido e mostra o `message` da API

### Requirement: Alteração de condição física (F04)
A tela SHALL oferecer uma ação própria para alterar a `condition` do jogador entre `APTO`,
`MAL_CONDICIONADO` e `DOENTE` (`PATCH /players/{id}/condition`), com confirmação de sucesso; a
transição direta de `DOENTE` para `APTO` SHALL seguir a regra de recusa previsível definida em
`frontend-conventions`.

#### Scenario: Alterar condição para Mal condicionado
- **WHEN** o usuário altera a condição de um jogador `APTO` para `MAL_CONDICIONADO`
- **THEN** a API responde `200`, e a tela mostra a condição nova sem recarregar a página

#### Scenario: Transição DOENTE para APTO segue a regra de recusa previsível
- **WHEN** o usuário tenta alterar a condição de um jogador `DOENTE` direto para `APTO`
- **THEN** a tela impede a ação mostrando o motivo, ou envia o pedido e mostra o `message` da API
