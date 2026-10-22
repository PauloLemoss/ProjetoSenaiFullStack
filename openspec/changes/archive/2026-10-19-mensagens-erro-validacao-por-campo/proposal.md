## Why

Hoje, quando um formulário de cadastro/edição envia um dado que viola uma regra de validação do
backend (ex.: idade fora da faixa, soma dos atributos técnicos acima do limite, potencial menor
que o maior atributo, sigla de clube que não corresponde ao nome), a API responde `400` e o
frontend mostra só um banner genérico fixo: "Dado ou parâmetro inválido." — sem indicar qual campo
está errado nem o que precisa ser corrigido. O usuário não consegue saber o que ajustar no
formulário e precisa adivinhar.

A causa é que `main.py` do backend intercepta todo `RequestValidationError` do Pydantic e descarta
a lista de erros por campo que o próprio Pydantic já monta (`exc.errors()`), substituindo-a por uma
mensagem fixa igual para qualquer violação de schema. As mensagens específicas em português já
existem nos validators do domínio (jogador e clube) mas nunca chegam ao cliente. Esta change não é
exigida pelo barema de correção do desafio (que não avalia o texto de `message` em validação de
formulário, só em recusas de regra de negócio dependente de dados gravados — ver `design.md`), mas
é uma melhoria de usabilidade pedida explicitamente, de baixo risco e sem mudança de regra de
negócio.

## What Changes

- A resposta `400` de erro de validação de schema (jogador e clube, criação e edição) passa a
  incluir, além do `message` agregado já existente, uma lista estruturada de erros por campo
  (nome do campo e mensagem em português explicando o que precisa ser corrigido), cobrindo tanto
  as regras cruzadas (`model_validator`) quanto as faixas simples de campo (`Field(ge=.., le=..)`
  de idade e atributos técnicos).
- Os formulários de cadastro/edição que hoje só mostram o banner genérico do `Modal` passam a
  exibir cada erro de campo devolvido pela API junto ao campo correspondente, reaproveitando o
  componente que já faz isso para a validação local (um campo só, antes do envio). O banner
  genérico continua existindo, como aviso complementar e único canal para erros que não mapeiam a
  um campo (ex.: `404`/`409`/`5xx`).
- Nenhuma regra de negócio, faixa, combinação de campos ou código de status HTTP muda — só a forma
  como um erro já calculado é comunicado ao usuário.

## Capabilities

### New Capabilities
- `frontend-erros-formulario`: requisito de que os formulários de cadastro/edição mapeiem os erros
  de campo devolvidos pela API (quando presentes) para o campo correspondente na interface, em vez
  de só um banner genérico de topo.

### Modified Capabilities
- `api-conventions`: o requisito "Códigos de erro e corpo de recusa padronizados" passa a exigir
  que, quando a recusa `400` vier de validação de schema com um ou mais campos identificáveis, o
  corpo inclua também uma lista de erros por campo, mantendo o `message` agregado já exigido hoje.

## Impact

- Backend: `backend/src/mercado_jogadores/main.py` (handler de `RequestValidationError`),
  `backend/src/mercado_jogadores/jogadores/schemas.py`, `backend/src/mercado_jogadores/clubes/schemas.py`
  (mensagens de validação por campo), testes de integração de jogadores e clubes.
- Frontend: `frontend/src/lib/httpClient.js`, `frontend/src/shared/useAsyncAction.js`,
  `frontend/src/shared/FormField.jsx` (reaproveitado, sem mudança estrutural), e os modais de
  cadastro/edição de jogador e clube (`PlayerCreateModal.jsx`, `PlayerEditModal.jsx`,
  `ClubCreateModal.jsx`, `ClubEditModal.jsx`).
- Nenhum endpoint, contrato de sucesso, cálculo ou regra de negócio muda.
