## Why

A change anterior (`mensagens-erro-validacao-por-campo`, já arquivada) corrigiu as mensagens de
erro genéricas no cadastro/edição de jogador e clube, mas deixou de fora as demais telas com
formulário. Uma investigação de código confirmou que, das quatro telas restantes, duas têm erro de
validação de schema real, atribuível a um campo específico e **alcançável pela interface atual**:

- **Compra de jogador**: `club_id` ausente/inválido e `loyalty_until` fora do intervalo aceito
  (passado, ou mais de 1095 dias no futuro) já geram `400` de schema (`BuyRequest`), mas hoje caem
  no aviso genérico do topo porque o campo não está na lista de campos reconhecidos pelo tradutor
  de erros do backend, e o frontend não usa o erro por campo nesse formulário.
- **Escalação**: escalar o mesmo jogador em mais de uma posição (`player_ids` duplicados) já gera
  `400` de schema (`LineupUpdate`) com uma mensagem em formato de variável Python
  (`"player_ids não pode repetir ids."`), em vez de um texto natural em português.

As outras duas telas (alteração de condição, nova partida) foram avaliadas e descartadas: a
alteração de condição só teria erro de schema se o `condition` enviado estivesse fora do enum, algo
que a interface não permite hoje (os valores vêm de um seletor fixo); e a regra "mandante não pode
ser igual ao visitante" de nova partida é uma regra de negócio no service (`RequisicaoInvalidaError`,
400), não uma validação de schema — tratá-la como erro de campo exigiria mudar de camada onde a
regra vive, o que não foi pedido e está fora do escopo desta change.

## What Changes

- O tradutor de erros de validação do backend (`core/validation_errors.py`) passa a reconhecer
  `club_id`, `loyalty_until` e `player_ids` como campos válidos, e a tratar os tipos de erro do
  Pydantic que faltavam (`greater_than`/`less_than` para ids de referência; `too_short`/`too_long`
  para listas), com mensagens específicas em português para esses campos.
- A checagem de intervalo de `loyalty_until` (data futura, até 1095 dias) deixa de ser uma regra
  "sem dono" (`model_validator`) e passa a ser uma validação do próprio campo (`field_validator`),
  já que não depende de nenhum outro campo — ela já pode ser atribuída a `loyalty_until`
  corretamente.
- A mensagem de `player_ids` duplicados passa de um texto técnico (`"player_ids não pode repetir
  ids."`) para um texto natural em português.
- No formulário de compra de jogador, os erros de `club_id` e `loyalty_until` devolvidos pela API
  passam a aparecer junto aos campos correspondentes (o campo "Clube", e os dois campos de
  data/hora da fidelidade, já que ambos representam o mesmo campo da API), em vez de só no aviso
  genérico do topo.
- Na escalação, nenhuma mudança de estrutura no frontend é necessária: o aviso de erro já existente
  na tela passa a mostrar a mensagem natural (graças à mudança de texto no backend), sem precisar de
  um campo específico para destacar — a duplicidade não aponta para uma única vaga da escalação.
- Nenhuma regra de negócio, faixa de valor ou código de status HTTP muda — só a forma como um erro
  já calculado é comunicado.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `api-conventions`: o requirement "Códigos de erro e corpo de recusa padronizados" ganha cenários
  cobrindo `club_id` (compra) e `player_ids` (escalação) como campos atribuíveis em `errors`,
  confirmando que o contrato genérico já escrito também se aplica a esses endpoints.
- `frontend-erros-formulario`: o requirement "Mapeamento de erros de campo da API no formulário"
  passa a cobrir também o formulário de compra de jogador (`club_id`, `loyalty_until`), além de
  jogador e clube.

## Impact

- Backend: `backend/src/mercado_jogadores/core/validation_errors.py`,
  `backend/src/mercado_jogadores/mercado/schemas.py` (`BuyRequest`),
  `backend/src/mercado_jogadores/liga/schemas.py` (`LineupUpdate`), testes de integração de
  `backend/tests/integration/test_mercado_api.py` e `test_liga_api.py`.
- Frontend: `frontend/src/features/mercado/BuyPlayerModal.jsx`. `ClubLineup.jsx` não precisa de
  mudança (ver "What Changes").
- Nenhum endpoint, contrato de sucesso, cálculo ou regra de negócio muda.
