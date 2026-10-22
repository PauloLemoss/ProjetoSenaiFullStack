## Context

Ver `proposal.md` — "Why" para o problema e os arquivos atuais. Resumo técnico do estado atual:

- `backend/src/mercado_jogadores/main.py`, handler de `RequestValidationError` (linhas 62-69):
  descarta `exc.errors()` e sempre devolve `{"message": "Dado ou parâmetro inválido."}`.
- `backend/src/mercado_jogadores/jogadores/schemas.py` (`JogadorCreate`/`JogadorUpdate`) e
  `backend/src/mercado_jogadores/clubes/schemas.py` (`ClubeCreate`/`ClubeUpdate`): têm
  `Field(ge=.., le=..)` para faixas simples e `@model_validator(mode="after")` para regras
  cruzadas (soma de atributos, potencial vs. maior atributo, agilidade vs. idade, sigla vs. nome).
  Um `model_validator(mode="after")` que levanta `ValueError` gera, em `exc.errors()`, um item com
  `loc: ()` (raiz do modelo) — sem campo associado.
- Frontend: `httpClient.js` só repassa `body.message`; `useAsyncAction.js` só expõe
  `errorMessage` (string); `FormField.jsx` já sabe desenhar erro junto ao campo, mas só recebe erro
  de `validation.js` (client-side); `Modal.jsx` mostra o `error` recebido como aviso geral no topo.
  Os quatro modais de cadastro/edição (`PlayerCreateModal`, `PlayerEditModal`, `ClubCreateModal`,
  `ClubEditModal`) seguem o mesmo padrão: `useAsyncAction` → `errorMessage` → `Modal error={...}`.

## Goals / Non-Goals

**Goals**
- Toda violação de validação de schema no cadastro/edição de jogador e clube chega ao usuário com
  uma mensagem específica, e, quando atribuível a um campo, junto a esse campo.
- Reaproveitar os componentes existentes (`FormField`, `Modal`) sem mudar sua estrutura pública.

**Non-Goals**
- Não altera nenhuma faixa, soma, combinação de campos ou código de status HTTP — só a forma como
  o erro já calculado é comunicado.
- Não exige telas de listagem/filtro (ex.: filtros de `GET /players`) a consumir `errors` — elas
  não têm o problema reportado; se a resposta delas ganhar `errors` incidentalmente (mesmo handler
  compartilhado), isso é inofensivo e não exige mudança de frontend.
- Não estende o mapeamento por campo aos modais de condição, compra, escalação ou nova partida:
  eles não têm violações de faixa numérica por campo vindas da API (são seleção de opção/enum ou
  regra de negócio `404`/`409`), então o aviso geral já resolve, como hoje.

## Decisions

### 1. Formato do corpo de erro: `message` continua, `errors` é aditivo
`{"message": "<primeira mensagem específica ou mensagem agregada>", "errors": [{"field": "age" |
null, "message": "..."}]}`. Mantém compatibilidade: qualquer consumidor que só lê `message` (ex.:
barema, que só confere presença de `message` não vazio — "o texto da mensagem não é avaliado" e
"outros campos são permitidos", README "2.5"/barema) continua funcionando sem mudança. `errors` só
aparece em recusas `400` originadas de `RequestValidationError`; `404`/`409` (via `ErroDeDominio`)
continuam só com `message`, sem `errors` — não têm violação "por campo" no mesmo sentido.

**Alternativa descartada**: devolver só `errors` e abandonar `message`. Rejeitada porque quebraria
o contrato hoje exigido (`message` não vazio, B02/V9) e qualquer teste existente que leia
`message`.

### 2. Tradução de `exc.errors()` para mensagens em português, por `type`
Novo módulo `backend/src/mercado_jogadores/core/validation_errors.py` com uma função que recebe a
lista de `exc.errors()` do Pydantic e devolve a lista `errors` do corpo de resposta:
- Para `type` em `value_error` (validators customizados, cross-field ou de campo): a mensagem já
  está em português no `ctx`/`msg` (Pydantic v2 prefixa `"Value error, "` em `msg`; a tradução
  remove esse prefixo e usa o texto original do `raise ValueError(...)`, sem reescrever nada).
- Para `type` em `greater_than_equal`/`less_than_equal` (faixas de `Field(ge=.., le=..)`) e
  `string_too_short`/`string_too_long` (tamanho de texto) e `missing` (campo obrigatório ausente):
  uma tabela estática `(modelo, campo) -> (rótulo em português, faixa/tamanho)` gera uma mensagem
  completa (“Idade deve ser um número inteiro de 16 a 45.”), reaproveitando os rótulos e faixas que
  já existem nos comentários/labels do frontend (`TECHNICAL_ATTRIBUTE_FIELDS`, labels dos
  `FormField`) para manter o texto consistente dos dois lados.
- Para qualquer outro `type` sem entrada na tabela (ex.: schemas de query string não cobertos por
  esta change): mensagem genérica construída a partir de `ctx` do próprio Pydantic (ainda
  específica ao campo, só não com o texto refinado manualmente) — nunca a antiga string fixa.
- `field`: usa o último segmento de `loc` quando ele corresponde a um nome de campo do schema
  (ex.: `loc = ("age",)` ou `("body", "age")` → `"age"`); usa `null` quando `loc` é vazio (erro de
  `model_validator(mode="after")` que não foi migrado para `field_validator`, ver decisão 3) ou
  aponta para algo que não é campo do formulário (ex.: corpo que não é um objeto JSON).

**Alternativa descartada**: usar uma biblioteca de internacionalização de erros do Pydantic.
Rejeitada por ser uma dependência nova para um conjunto pequeno e fixo de mensagens, que o projeto
já escreve manualmente em português nos validators.

### 3. Mover regras cruzadas atribuíveis a um único campo de `model_validator` para `field_validator`
Pydantic v2 só atribui `loc` a um campo quando o erro vem de um validador daquele campo. Hoje as
regras "potencial não pode ser menor que o maior atributo" (+ a variante de idade ≥ 33) e
"agilidade máxima 85 com idade ≥ 35" vivem em `@model_validator(mode="after")`, sem campo. Como
`field_validator` em modo `after` recebe, via `ValidationInfo.data`, os campos já validados do
mesmo request (na ordem de declaração do modelo), a correção é:
- `JogadorCreate`: mover a regra de potencial para um `field_validator("potential")` — `potential`
  já é o último campo declarado, então `pace`/`shooting`/`passing`/`dribbling`/`defending`/
  `physical`/`age` já estão em `info.data`. Resultado: erro com `field: "potential"`.
- `JogadorCreate`/`JogadorUpdate`: mover a regra de agilidade para um `field_validator("agility")`,
  reordenando a declaração dos campos do modelo para `age` vir antes de `agility` (mudança só na
  ordem de declaração em Python — não muda o formato aceito do corpo JSON, que não depende de
  ordem de chaves). Resultado: erro com `field: "agility"`.
- `ClubeCreate`/`ClubeUpdate`: mover a regra de sigla-corresponde-ao-nome para um
  `field_validator("acronym")` — `name` já é declarado antes de `acronym`, nenhuma reordenação
  necessária. Resultado: erro com `field: "acronym"`.
- A regra "soma dos seis atributos não pode passar de 480" continua em
  `model_validator(mode="after")`: depende de seis campos, sem um único dono natural — fica com
  `field: null` (ver spec `api-conventions`, cenário "sem campo único").

**Alternativa descartada**: criar uma exceção customizada que carregue o nome do campo e
pós-processar `exc.errors()` tentando recuperá-la. Rejeitada porque Pydantic v2 descarta atributos
extras de exceções levantadas dentro de validators — só preserva `loc`/`msg`/`type`/`ctx` — então
qualquer informação de campo precisa vir do próprio mecanismo de `loc`, daí mover para
`field_validator`.

### 4. Frontend: erro de campo some a mensagem genérica do aviso geral só quando mapeado a um campo
`httpClient.js` passa a devolver, em `ApiError`, também a lista `errors` (quando presente no corpo).
`useAsyncAction.js` expõe `fieldErrors` (objeto `{ [campo]: mensagem }`, construído a partir dos
itens de `errors` com `field` não nulo) além de `errorMessage`. Os quatro modais mesclam
`fieldErrors` com o objeto `errors` local (validação de um campo só), dando prioridade ao erro mais
recente (o retorno da API, por ser mais específico que a validação client-side de intervalo, já que
o próprio envio só acontece depois da validação local passar). `errorMessage` continua sendo
passado ao `Modal` como aviso geral, mas seu conteúdo já é a mensagem certa (não mais a genérica),
cobrindo os casos sem campo (`field: null`, `404`, `409`).

**Alternativa descartada**: substituir o aviso geral por uma lista de erros no topo do modal (ex.:
"corrija: Idade, Potencial"). Rejeitada por duplicar a informação que já aparece junto a cada campo
e divergir do padrão visual existente (`FormField`/`Modal`) sem necessidade.

## Risks / Trade-offs

- [Risco] Reordenar campos nos schemas Pydantic poderia, em tese, mudar alguma mensagem de erro
  combinada quando múltiplos campos falham ao mesmo tempo (Pydantic para de rodar validators
  depois que um campo já falhou, então um campo que dependia de outro que falhou antes não roda
  sua checagem cruzada) → Mitigação: cada `field_validator` cruzado já verifica, antes de aplicar a
  regra, se os campos dos quais depende estão presentes em `info.data` (podem faltar se a validação
  deles falhou antes); se não estiverem, a checagem cruzada é pulada nesse campo — o erro do campo
  que já falhou sozinho é suficiente, evita um erro confuso de campo que nem foi validado ainda.
- [Risco] Testes de integração existentes que montam cenários de erro `400` podem precisar de
  ajuste se dependerem de algum detalhe do corpo de erro atual → Mitigação: já confirmado que
  nenhum teste faz assert do texto "Dado ou parâmetro inválido." nem do formato exato do corpo além
  de `status_code` e `message` truthy (ver investigação em `backend/tests/integration/
  test_jogadores_api.py` e `test_clubes_api.py`); essa change só adiciona o campo `errors`, não
  remove nem muda `message`.
- [Risco] Confusão sobre se esta change é exigida pelo barema de correção → Não é: o barema
  (`barema.md`, linha 284) só avalia o `message` da API para recusas `409`/`404` dependentes de
  dados gravados, nunca para validação de formulário (`400`); e aceita campos extras no corpo de
  recusa (README, linha 242: "outros campos são permitidos"). Sem risco de regressão de nota.

## Migration Plan

Mudança aditiva, sem migração de dados nem de banco. Ordem recomendada (ver `tasks.md`):
1. Backend: módulo de tradução de erros + ajuste dos schemas (reordenar/mover validators) +
   handler de `main.py` + testes de integração.
2. Frontend: `httpClient.js`/`useAsyncAction.js` (camada comum) antes dos quatro modais, para que
   cada modal só precise consumir `fieldErrors` já pronto.
3. Verificação manual com os dois cenários das imagens que motivaram esta change (cadastro de
   jogador "Paulo" violando a regra de potencial) antes de considerar concluído.

Rollback: reverter os commits desta change; nenhuma migração de schema de banco está envolvida.
