## ADDED Requirements

### Requirement: Edição de nome e sigla do clube
O sistema SHALL permitir editar `name` e `acronym` de um clube existente via `PUT /clubs/{id}`,
exigindo os dois campos juntos (mesmo que só um deles mude), com as mesmas regras de formato de
`name` e `acronym`, a mesma regra de correspondência sigla↔nome e a mesma regra de unicidade do
cadastro (RN10) — exceto que, ao verificar duplicidade, o próprio clube sendo editado SHALL ser
ignorado (ele pode manter seu nome ou sua sigla atuais sem ser recusado por colidir consigo mesmo).
Nenhum outro campo do clube (`cash`, elenco) SHALL mudar por esse endpoint, e nenhuma operação de
exclusão de clube é adicionada por esta capability — a política de nunca deletar um clube continua
valendo.

#### Scenario: Edição válida atualiza nome e sigla
- **WHEN** o cliente edita um clube existente, mudando `name` de "Águias FC" para "Águias EC" e
  `acronym` de "AGU" para "AEC"
- **THEN** a API responde `200` com o clube atualizado (`name` "Águias EC", `acronym` "AEC"), com
  `cash`, `squad_value` e `net_worth` inalterados

#### Scenario: Salvar sem mudar nome e sigla não é recusado por duplicidade consigo mesmo
- **WHEN** o cliente edita um clube enviando o mesmo `name` e o mesmo `acronym` que ele já tem
- **THEN** a API responde `200`, sem recusar por duplicidade

#### Scenario: Nome duplicado de outro clube é recusado
- **WHEN** já existe um clube "Delta FC" e o cliente tenta editar outro clube para também se chamar
  "Delta FC" (ignorando maiúsculas/minúsculas)
- **THEN** a API responde `409` com `message`, e nada é alterado

#### Scenario: Sigla duplicada de outro clube é recusada
- **WHEN** a sigla "DEL" já pertence a outro clube e o cliente tenta editar um clube para usar essa
  sigla
- **THEN** a API responde `409` com `message`, e nada é alterado

#### Scenario: Sigla que não corresponde ao novo nome é recusada
- **WHEN** o cliente edita o `name` de um clube para "Tubarões EC" mantendo um `acronym` que não
  corresponde às primeiras letras do novo nome, na ordem certa
- **THEN** a API responde `400` com `message`, e nada é alterado

#### Scenario: Clube inexistente responde 404
- **WHEN** o cliente tenta editar um `clube_id` que não existe
- **THEN** a API responde `404` com `message`

#### Scenario: Edição não muda caixa nem elenco
- **WHEN** um clube com `cash` 261,15 e jogadores no elenco é editado (só nome e sigla)
- **THEN** a resposta traz o mesmo `cash` e o mesmo `squad_value`/`net_worth` de antes da edição
