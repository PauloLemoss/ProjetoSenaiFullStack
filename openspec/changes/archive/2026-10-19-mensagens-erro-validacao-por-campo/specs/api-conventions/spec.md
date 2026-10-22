## MODIFIED Requirements

### Requirement: Códigos de erro e corpo de recusa padronizados
O sistema SHALL usar `400` para dado, formato ou parâmetro inválido, `404` para recurso
inexistente e `409` para regra de negócio violada (V9), nunca combinando dois motivos de erro na
mesma resposta. Toda recusa SHALL responder com um objeto JSON contendo o campo `message` (texto
não vazio), sem stack trace, com o cabeçalho `Content-Type: application/json`. Nenhuma recusa SHALL
gravar qualquer dado.

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
