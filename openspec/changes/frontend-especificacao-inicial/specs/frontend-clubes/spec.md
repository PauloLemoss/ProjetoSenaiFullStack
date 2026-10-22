## Purpose

Define a listagem e a criação de clubes e a página do clube com seus indicadores financeiros e
elenco, conforme F05 e F07 do barema. Depende da capability de backend `clubes` para os campos e a
ordem que essas telas consomem, e de `frontend-conventions` para as regras transversais.

## ADDED Requirements

### Requirement: Listagem de clubes ordenável e criação (F05)
A tela de listagem de clubes (`GET /clubs`) SHALL mostrar, em tabela, `name`, `acronym`, `cash`,
`squad_value` e `net_worth`, ordenável por nome (padrão) e por patrimônio (ao menos do maior para
o menor), na ordem devolvida pela API, sem reordenar no cliente. A tela SHALL oferecer um
formulário de criação de clube com `name` e `acronym`.

#### Scenario: Lista ordenada por patrimônio, do maior para o menor
- **WHEN** o usuário escolhe ordenar por patrimônio
- **THEN** a tabela mostra os clubes na ordem devolvida por `GET /clubs?sort=net_worth_desc`

#### Scenario: Clube criado aparece na lista sem recarregar a página
- **WHEN** o usuário cria um clube com `name` e `acronym` válidos
- **THEN** a API responde `201`, e o clube novo aparece na listagem sem a página recarregar

#### Scenario: Nome ou sigla repetidos não são bloqueados na tela
- **WHEN** o usuário tenta criar um clube com um nome ou uma sigla já usados por outro clube
- **THEN** a tela envia o pedido normalmente e mostra o `message` devolvido pela API quando ela
  recusar com `409`, sem bloquear o envio antecipadamente

### Requirement: Página do clube com indicadores financeiros e elenco (F07)
A página do clube (`GET /clubs/{id}`) SHALL mostrar `cash`, `squad_value` e `net_worth`, e o
elenco na ordem devolvida pela API (GOL, ZAG, LAT, MEI, ATA, depois por nome), com o valor de
mercado de cada jogador e as colunas do contrato: fim da fidelidade (`loyalty_until`), dias
restantes (`remaining_days`) e percentual de multa (`penalty_rate`) se fosse vendido naquele
instante.

#### Scenario: Elenco mostra o contrato de cada jogador
- **WHEN** a página de um clube com jogadores comprados é aberta
- **THEN** cada jogador do elenco mostra valor de mercado, fim da fidelidade, dias restantes e
  percentual de multa, todos vindos da API, sem recalcular na tela

#### Scenario: Clube recém-criado mostra elenco vazio
- **WHEN** a página de um clube recém-criado, sem jogadores comprados, é aberta
- **THEN** a aba de elenco mostra o estado de lista vazia definido em `frontend-conventions`
