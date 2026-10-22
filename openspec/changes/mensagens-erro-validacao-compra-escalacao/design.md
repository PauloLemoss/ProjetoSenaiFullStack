## Context

Ver `proposal.md` para o porquê. Estado atual confirmado rodando os schemas diretamente (não só
lendo o código):

- `BuyRequest` (`backend/src/mercado_jogadores/mercado/schemas.py:33-56`):
  - `club_id` ausente → Pydantic gera `{"type": "missing", "loc": ["club_id"], ...}`.
  - `club_id = 0` → `{"type": "greater_than", "loc": ["club_id"], "ctx": {"gt": 0}, ...}` — tipo
    que `traduzir_erros_de_validacao` **não trata hoje** (só trata `greater_than_equal`/
    `less_than_equal`), caindo no fallback genérico com texto técnico.
  - `loyalty_until` no passado ou acima do limite → `{"type": "value_error", "loc": [], ...}`
    (hoje `field: null`), porque a checagem está num `@model_validator(mode="after")` que só lê
    `self.loyalty_until` — não depende de nenhum outro campo, apesar de estar escrita como regra
    "cruzada".
- `LineupUpdate` (`backend/src/mercado_jogadores/liga/schemas.py:32-47`):
  - `player_ids` duplicados → `{"type": "value_error", "loc": ["player_ids"], "msg": "Value error,
    player_ids não pode repetir ids.", ...}` — já atribuído ao campo certo, só falta o campo estar
    na allowlist de `validation_errors.py` e o texto da mensagem está em formato de nome de
    variável Python, não português natural.
  - Lista com menos de 5 ids → `{"type": "too_short", "loc": ["player_ids"], "ctx": {"min_length":
    5, "actual_length": 4}, ...}` — tipo também não tratado hoje, mas inalcançável pela UI atual:
    `ClubLineup.jsx` só habilita "Salvar escalação" quando as 5 vagas estão preenchidas
    (`allFilled`), então esse erro só ocorreria chamando a API diretamente, não pela tela.
- `core/validation_errors.py` tem um allowlist fixo (`_CAMPOS_DO_FORMULARIO`) só com os campos de
  jogador/clube — qualquer `loc` fora dessa lista vira `field: null`, mesmo quando o Pydantic já
  aponta o campo certo.

## Goals / Non-Goals

**Goals**
- `club_id` e `loyalty_until` (compra) e `player_ids` (escalação) passam a ser reconhecidos pelo
  tradutor de erros, com mensagens específicas em português, sem texto técnico.
- O formulário de compra mostra o erro de `club_id` e `loyalty_until` junto aos campos certos.

**Non-Goals**
- Não altera a tela de escalação (`ClubLineup.jsx`): a duplicidade de `player_ids` não aponta para
  uma vaga específica (o schema só sabe "há um id repetido na lista", não "nas vagas X e Y"), então
  não há onde destacar um campo mais específico do que o aviso que já existe hoje. A melhoria ali é
  só a mensagem (natural, não "player_ids não pode repetir ids."), que já aparece automaticamente
  no aviso existente assim que o backend mudar o texto — nenhuma mudança de frontend é necessária.
- Não trata `too_short`/`too_long` de `player_ids` como um caso prioritário — é inalcançável pela
  UI atual (botão de salvar desabilitado com menos de 5 titulares). A tradução recebe uma mensagem
  razoável mesmo assim (ver decisão 2), só não ganha um teste de interface dedicado.
- Não altera a tela de alteração de condição nem a de nova partida (ver `proposal.md`, "Why", para
  a justificativa de cada uma).
- Não muda nenhuma regra de negócio, faixa de valor ou código de status HTTP.

## Decisions

### 1. Mover a checagem de intervalo de `loyalty_until` para `field_validator`
`_validar_intervalo_de_loyalty_until` (hoje `@model_validator(mode="after")`) só lê
`self.loyalty_until` — não precisa de `ValidationInfo.data` de nenhum outro campo. Convertê-la em
`@field_validator("loyalty_until", mode="after")` faz o Pydantic atribuir `loc=("loyalty_until",)`
nativamente, sem precisar de nenhuma lógica extra de atribuição manual (diferente do caso
"potencial" da change anterior, que genuinamente precisava de dados de outros campos).

**Alternativa descartada**: manter em `model_validator` e tentar inferir o campo por correspondência
de texto da mensagem. Rejeitada por ser frágil (quebraria se o texto da mensagem mudasse) e
desnecessária, já que a regra não depende de nenhum outro campo.

### 2. Allowlist e mensagens específicas em `validation_errors.py`
- `_CAMPOS_DO_FORMULARIO` ganha `club_id`, `loyalty_until`, `player_ids`.
- `_ROTULO_POR_CAMPO` ganha `club_id` → "Clube", `loyalty_until` → "Fim da fidelidade",
  `player_ids` → "Jogadores escalados".
- Novo dicionário `_MENSAGENS_PERSONALIZADAS: dict[tuple[str, str], str]`, consultado antes dos
  outros ramos de `traduzir_erros_de_validacao`, com as combinações `(campo, type)` que não se
  encaixam bem nos templates existentes (faixa numérica, tamanho de texto):
  - `("club_id", "missing")` → "Selecione um clube."
  - `("club_id", "greater_than")` → "Selecione um clube válido." (cobre `club_id <= 0`; o limite
    superior de `club_id` é um id de 32 bits, não um dado de negócio — não precisa de mensagem
    própria, cai no fallback genérico se algum dia for violado, caso raro e sem valor de UX)
  - `("player_ids", "too_short")` e `("player_ids", "too_long")` → mensagem reaproveitando
    `TITULARES_POR_ESCALACAO` (`liga/schemas.py`): "A escalação precisa ter exatamente 5
    titulares." (inalcançável pela UI hoje, ver "Non-Goals", mas evita texto técnico se a API for
    chamada diretamente)
  - `loyalty_until` não precisa de entrada aqui: o `value_error` já carrega a mensagem certa em
    português (só precisava do campo correto, resolvido pela decisão 1 + allowlist).
  - `player_ids` duplicados também não precisa de entrada aqui — é tratado pela decisão 3 (mudança
    direto na mensagem do `raise` no schema), não por uma tradução pós-hoc.

**Alternativa descartada**: generalizar o tratamento de `greater_than`/`less_than` com uma tabela de
faixas como a de `age`/`pace`/etc. Rejeitada porque `club_id` não é uma faixa de negócio (é só "é
um id válido?") — uma mensagem do tipo "Clube deve ser um número inteiro de 1 a 2147483647." seria
mais confusa do que "Selecione um clube.", já que o campo é um `<select>`, não um número digitado.

### 3. Mensagem de `player_ids` duplicados em português natural
Em `LineupUpdate._sem_ids_repetidos` (`liga/schemas.py`), trocar o texto do `raise ValueError`
de `"player_ids não pode repetir ids."` para algo como `"Não é possível escalar o mesmo jogador em
mais de uma posição."`. Como o tradutor de erros já repassa o texto de `value_error` tal como
escrito no `raise` (só removendo o prefixo que o Pydantic adiciona), mudar a mensagem aqui já
resolve tanto o `errors[]` quanto o aviso geral do frontend — sem precisar de nenhuma entrada em
`_MENSAGENS_PERSONALIZADAS`.

### 4. Frontend: compra mapeia `club_id` e `loyalty_until`; escalação não muda
`BuyPlayerModal.jsx` passa a desestruturar `fieldErrors` de `useAsyncAction` e aplicar
`fieldErrors.club_id ?? errors.club_id` no campo "Clube", e `fieldErrors.loyalty_until ??
errors.loyalty_date` / `fieldErrors.loyalty_until ?? errors.loyalty_time` nos dois campos de
data/hora — o mesmo erro de `loyalty_until` aparece nos dois, porque a API valida um único campo
que a tela representa como dois inputs, e não há como saber qual dos dois o usuário digitou errado.

`ClubLineup.jsx` não muda: o parágrafo de erro que já existe (`errorMessage`, antes dos botões)
continua mostrando o `message` agregado, que já é a mensagem específica (decisão 3) — só deixa de
ser um texto técnico. Não há um campo de formulário único para destacar a duplicidade entre vagas.

**Alternativa descartada**: tentar destacar visualmente, no campo visual da escalação (ou nos
`<select>` de cada vaga), quais duas vagas têm o jogador repetido. Rejeitada porque o erro do
schema não informa quais posições/índices colidiram (só que existe uma colisão na lista), então
qualquer tentativa de apontar vagas específicas seria uma suposição da interface, não um dado vindo
da API — fora do que esta change (comunicar o erro que a API já calcula) se propõe a fazer.

## Risks / Trade-offs

- [Risco] Mover `_validar_intervalo_de_loyalty_until` para `field_validator` muda a ordem relativa
  de execução em relação a outras validações do mesmo campo → Mitigação: é o único validator do
  campo além do `BeforeValidator` de parse (`_parsear_loyalty_until`), que roda antes (`mode=
  "before"`); não há conflito de ordem.
- [Risco] Mudar o texto do `raise` em `_sem_ids_repetidos` poderia quebrar algum teste que faça
  assert do texto antigo → Mitigação: checar com grep antes de alterar (ver `tasks.md`); se existir,
  o teste deve ser atualizado para o novo texto, não revertido.
- [Risco] Confusão sobre se esta change é exigida pelo barema → Não é, pela mesma razão documentada
  na change anterior: o barema só avalia `message` em recusas `409`/`404` dependentes de dados
  gravados, nunca em validação de formulário.

## Migration Plan

Mudança aditiva, sem migração de dados. Ordem: backend (schemas + tradutor + testes) antes do
frontend (só `BuyPlayerModal.jsx`), igual ao padrão da change anterior. Rollback: reverter os
commits; nenhuma migração de banco envolvida.
