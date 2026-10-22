# api-conventions Specification

## Purpose
Define as regras de validação de entrada, os códigos de erro e as convenções de resposta que
valem para **todos** os endpoints da API (`/api/v1`), independente do domínio (jogadores,
clubes, mercado ou liga), conforme "📏 Premissas e regras gerais" do enunciado.

## Requirements

### Requirement: Corpo da requisição deve ser um objeto JSON
O sistema SHALL recusar com `400` qualquer corpo de requisição que não seja um objeto JSON válido
(RN/V1). Em pedidos sem corpo (consultas, exclusão), um corpo enviado SHALL ser ignorado.

#### Scenario: Corpo é um array
- **WHEN** o cliente envia `POST /players` com corpo `[]`
- **THEN** a API responde `400` com um objeto JSON contendo `message` não vazio, e nada é gravado

#### Scenario: Corpo é um valor simples
- **WHEN** o cliente envia `POST /players` com corpo `"x"` ou `10`
- **THEN** a API responde `400` com `message`, e nada é gravado

#### Scenario: JSON malformado
- **WHEN** o cliente envia um corpo que não é JSON válido (sintaxe quebrada)
- **THEN** a API responde `400` com `message`, e nada é gravado

### Requirement: Normalização de campos de texto antes de validar e gravar
Em todo campo de texto livre (nome, busca), o sistema SHALL remover espaços no início e no fim e
colapsar espaços repetidos em um só, antes de validar o tamanho e gravar (V4). Caracteres de
controle (tabulação, quebra de linha) SHALL ser recusados com `400`. Texto que fica vazio depois
da normalização conta como ausente.

#### Scenario: Espaços redundantes são normalizados
- **WHEN** o cliente envia o campo de nome como `"  Meia   Zeta "`
- **THEN** o valor é gravado como `"Meia Zeta"`

#### Scenario: Caractere de controle é recusado
- **WHEN** o cliente envia um campo de texto contendo um caractere de tabulação ou quebra de linha
- **THEN** a API responde `400` com `message`

#### Scenario: Texto vazio após normalização conta como ausente
- **WHEN** o cliente envia um campo de nome obrigatório como `"   "`
- **THEN** a API trata o campo como ausente e responde conforme a regra de campo obrigatório

### Requirement: Valores de lista são comparados exatamente, sem normalizar caixa
O sistema SHALL aceitar valores de enum (lista) exatamente como definidos no enunciado, com a
mesma caixa (maiúsculas/minúsculas) exigida (V5). Um valor com caixa diferente SHALL ser
recusado com `400`, nunca convertido.

#### Scenario: Valor de enum em minúsculas é recusado
- **WHEN** o cliente envia um campo de enum como `"ata"` em vez de `"ATA"`
- **THEN** a API responde `400` com `message`

### Requirement: Campo obrigatório ausente ou nulo é recusado
O sistema SHALL recusar com `400` qualquer requisição em que um campo obrigatório esteja ausente
ou seja `null` (V6).

#### Scenario: Campo obrigatório ausente
- **WHEN** o cliente envia um corpo sem um campo obrigatório do endpoint
- **THEN** a API responde `400` com `message`, e nada é gravado

#### Scenario: Campo obrigatório nulo
- **WHEN** o cliente envia um campo obrigatório explicitamente como `null`
- **THEN** a API responde `400` com `message`, e nada é gravado

### Requirement: Campos controlados pelo sistema são ignorados sem erro
O sistema SHALL ignorar, sem gerar erro, qualquer campo que o próprio sistema calcule ou controle
(como `id`, valores em moeda, indicadores calculados) e qualquer campo que não pertença ao
endpoint, inclusive campos com nome fora do snake_case esperado (V7). Se o campo obrigatório
correspondente não vier por causa disso, a requisição SHALL ser recusada pela regra de campo
obrigatório (V6).

#### Scenario: Campo calculado enviado no corpo é ignorado
- **WHEN** o cliente envia um campo controlado pelo sistema (ex.: um valor em moeda) no corpo de
  uma requisição de criação ou edição
- **THEN** a API ignora esse campo sem erro e calcula/gravação segue a regra de negócio do
  endpoint, não o valor enviado

#### Scenario: Nome de campo fora do snake_case é tratado como inexistente
- **WHEN** o cliente envia um campo com nome em outro formato (ex.: camelCase) no lugar de um
  campo esperado em snake_case
- **THEN** a API ignora o campo enviado e, se o campo esperado correspondente não vier, recusa a
  requisição pela regra de campo obrigatório ausente

### Requirement: Recurso ou id inexistente responde 404
O sistema SHALL responder `404` quando o caminho da URL não corresponder a um endpoint do
enunciado, ou quando o id de um recurso na URL não existir (V8). Um id na URL que não seja um
inteiro positivo escrito só com dígitos, sem zeros à esquerda, ou que passe de 2.147.483.647,
SHALL também contar como inexistente (`404`).

#### Scenario: Caminho inexistente
- **WHEN** o cliente faz uma requisição a um caminho que não existe no enunciado
- **THEN** a API responde `404` com `message`

#### Scenario: Id na URL em formato inválido
- **WHEN** o cliente faz uma requisição com um id na URL que não é um inteiro positivo sem zeros
  à esquerda (ex.: `abc`, `0`, `-1`, `1.5`, `01`)
- **THEN** a API responde `404` com `message`

#### Scenario: Id na URL acima do limite
- **WHEN** o cliente faz uma requisição com um id na URL maior que 2.147.483.647
- **THEN** a API responde `404` com `message`

### Requirement: Códigos de erro e corpo de recusa padronizados
O sistema SHALL usar `400` para dado, formato ou parâmetro inválido, `404` para recurso
inexistente e `409` para regra de negócio violada (V9), nunca combinando dois motivos de erro na
mesma resposta. Toda recusa SHALL responder com um objeto JSON contendo o campo `message` (texto
não vazio), sem stack trace, com o cabeçalho `Content-Type: application/json`. Nenhuma recusa
SHALL gravar qualquer dado.

Quando a recusa `400` vier de validação de schema de entrada (corpo ou query inválidos, faixa de
campo numérico violada, valor combinando campos de forma inválida), o corpo SHALL incluir também o
campo `errors`: uma lista de objetos `{"field": <nome do campo ou null>, "message": <texto não
vazio>}`, um por violação detectada. `field` SHALL ser o nome do campo exatamente como o cliente o
enviou (ex.: `age`, `potential`, `acronym`) quando a violação for atribuível a um único campo, e
`null` quando a regra depender de mais de um campo sem um campo único ao qual atribuí-la (ex.: soma
de múltiplos atributos). Cada `message` em `errors` SHALL ser um texto específico em português
explicando o que precisa mudar para a requisição ser aceita, nunca um texto genérico fixo
igual para qualquer violação. O `message` agregado do nível raiz continua obrigatório e não vazio,
mas deixa de ser a única fonte de informação sobre o que falhou. Recusas `404` e `409` SHALL
continuar sem o campo `errors` (ele só se aplica a validação de schema recusada com `400`).

#### Scenario: Recusa de regra de negócio
- **WHEN** uma requisição viola uma regra de negócio do domínio (ex.: limite de caixa, estado de
  contrato)
- **THEN** a API responde `409` com um objeto JSON contendo `message` não vazio, e nada é gravado

#### Scenario: Nenhuma informação de implementação vaza na recusa
- **WHEN** qualquer requisição é recusada (`400`, `404` ou `409`)
- **THEN** o corpo da resposta não contém stack trace nem detalhes internos de implementação

#### Scenario: Violação de faixa de um campo numérico identifica o campo
- **WHEN** o cliente envia `POST /players` com `age` igual a 10 (fora da faixa de 16 a 45) e os
  demais campos válidos
- **THEN** a API responde `400` com `message` não vazio e `errors` contendo um item com
  `field: "age"` e uma mensagem específica informando a faixa aceita (16 a 45)

#### Scenario: Violação de regra cruzada atribuível a um campo
- **WHEN** o cliente envia `POST /players` com os atributos técnicos `pace=20`, `shooting=35`,
  `passing=89`, `dribbling=90`, `defending=5`, `physical=80` e `potential=80` (potencial menor que
  o maior atributo técnico, 90)
- **THEN** a API responde `400` com `errors` contendo um item com `field: "potential"` e a mensagem
  "O potencial não pode ser menor que o maior atributo.", em vez da mensagem genérica "Dado ou
  parâmetro inválido."

#### Scenario: Violação de regra cruzada sem campo único usa field nulo
- **WHEN** o cliente envia `POST /players` com a soma dos seis atributos técnicos acima de 480
- **THEN** a API responde `400` com `errors` contendo um item com `field: null` e a mensagem "A
  soma dos seis atributos não pode passar de 480."

#### Scenario: Múltiplas violações na mesma requisição aparecem todas
- **WHEN** o cliente envia `POST /clubs` com `name` contendo um dígito e `acronym` com apenas 2
  letras
- **THEN** a API responde `400` com `errors` contendo dois itens, um para `field: "name"` e outro
  para `field: "acronym"`, cada um com sua mensagem específica

### Requirement: Criação de recurso responde 201 com Location
O sistema SHALL responder `201` em toda criação bem-sucedida de recurso, com o cabeçalho
`Location` apontando para o recurso criado (como caminho a partir da raiz do servidor, com o
prefixo `/api/v1`, ou como URL absoluta).

#### Scenario: Criação bem-sucedida
- **WHEN** um recurso é criado com sucesso
- **THEN** a resposta tem status `201` e o cabeçalho `Location` aponta para o recurso criado

### Requirement: Datas e horas no formato de Brasília (RN01)
Toda data e hora enviada à API SHALL usar o horário de Brasília, timezone-aware, no formato
`AAAA-MM-DDTHH:MM-03:00` (minutos, sem segundos). Um formato diferente, inclusive sem o `-03:00`,
SHALL ser recusado com `400`. Uma data ou hora inexistente, mesmo no formato certo (como
`2027-02-30T10:15-03:00` ou `2027-03-02T24:00-03:00`), SHALL também ser recusada com `400`, nunca
ajustada. As respostas SHALL trazer o formato `AAAA-MM-DDTHH:MM:SS-03:00` (com segundos). O
horário de Brasília SHALL ser sempre `-03:00`, sem horário de verão.

#### Scenario: Formato de entrada válido é aceito
- **WHEN** o cliente envia uma data e hora como `2027-03-02T10:15-03:00`
- **THEN** o valor é aceito e interpretado como aquele instante no horário de Brasília

#### Scenario: Entrada sem o offset -03:00 é recusada
- **WHEN** o cliente envia uma data e hora sem o sufixo `-03:00` (ex.: `2027-03-02T10:15`, ou com
  outro offset)
- **THEN** a API responde `400` com `message`

#### Scenario: Data inexistente é recusada
- **WHEN** o cliente envia `2027-02-30T10:15-03:00` (30 de fevereiro não existe)
- **THEN** a API responde `400` com `message`, nunca ajustando para outra data

#### Scenario: Hora inexistente é recusada
- **WHEN** o cliente envia `2027-03-02T24:00-03:00` (hora 24 não existe)
- **THEN** a API responde `400` com `message`

#### Scenario: Resposta traz o formato com segundos
- **WHEN** a API devolve uma data e hora gravada ou calculada
- **THEN** o valor vem no formato `AAAA-MM-DDTHH:MM:SS-03:00`, sempre com o offset `-03:00`

### Requirement: Campo inteiro do corpo recusa texto e fração (V2/V3)
Em todo campo do corpo de uma requisição documentado como inteiro em "Limites de cada campo", o
sistema SHALL recusar com `400` um valor que não seja um número JSON (ex.: uma string, mesmo que
só com dígitos, como `"15"`) e SHALL recusar com `400` um número com parte fracionária não nula
(ex.: `50.5`); um número com parte fracionária nula (ex.: `50.0`) SHALL ser aceito como o inteiro
correspondente (`50`). Esta regra vale para todo campo inteiro de corpo, inclusive os que
referenciam outro recurso por id (`club_id`, `player_ids`, `home_club_id`, `away_club_id`).

#### Scenario: String numérica em campo inteiro do corpo é recusada
- **WHEN** o cliente envia um campo inteiro do corpo como string, mesmo só com dígitos (ex.:
  `"club_id": "1"`)
- **THEN** a API responde `400` com `message`, e nada é gravado

#### Scenario: Número com parte fracionária não nula é recusado
- **WHEN** o cliente envia um campo inteiro do corpo como `50.5`
- **THEN** a API responde `400` com `message`

#### Scenario: Número com parte fracionária nula é aceito
- **WHEN** o cliente envia um campo inteiro do corpo como `50.0`
- **THEN** o valor é aceito como `50`
