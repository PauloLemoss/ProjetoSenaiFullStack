## 1. Backend — tradução de erros por campo

- [x] 1.1 Criar `backend/src/mercado_jogadores/core/validation_errors.py` com a função que recebe
      `exc.errors()` do Pydantic e devolve a lista `errors` (`{"field": str | None, "message":
      str}`), cobrindo os `type` descritos em `design.md` (decisão 2): `value_error` (remove o
      prefixo `"Value error, "`), `greater_than_equal`/`less_than_equal`,
      `string_too_short`/`string_too_long`, `missing`, e um fallback genérico para os demais tipos.
      Verificar com um teste unitário do próprio módulo (sem subir a API) cobrindo pelo menos um
      caso de cada `type` listado.
- [x] 1.2 Na mesma função, extrair `field` do último segmento de `loc` quando ele for um nome de
      campo válido do schema, e `null` quando `loc` for vazio ou apontar para algo que não é campo
      (ex.: corpo que não é objeto). Verificar com teste unitário cobrindo `loc = ("age",)`,
      `loc = ("body", "age")` e `loc = ()`.
- [x] 1.3 Em `backend/src/mercado_jogadores/jogadores/schemas.py`, mover a regra "potencial não
      pode ser menor que o maior atributo" (e a variante de idade ≥ 33) de
      `_validar_regras_cruzadas` (`model_validator`) para um `field_validator("potential")`,
      usando `ValidationInfo.data` para os seis atributos técnicos e a idade já validados (ver
      `design.md`, decisão 3). Verificar rodando os testes existentes de `JogadorCreate` e
      confirmando que a violação continua recusada, agora com `loc = ("potential",)` em
      `exc.errors()` (checar em um teste novo ou existente que inspecione o erro bruto do Pydantic,
      não só o status HTTP).
- [x] 1.4 Em `backend/src/mercado_jogadores/jogadores/schemas.py`, reordenar a declaração de
      `age` para antes de `agility` em `JogadorCreate` e `JogadorUpdate`, e mover a regra
      "agilidade máxima 85 com idade ≥ 35" para um `field_validator("agility")` usando
      `info.data["age"]`. Verificar que o corpo JSON continua aceito com `age`/`agility` em
      qualquer ordem de chaves (teste de integração existente não deve quebrar) e que o erro passa
      a ter `loc = ("agility",)`.
- [x] 1.5 Em `backend/src/mercado_jogadores/clubes/schemas.py`, mover a regra
      "`acronym` deve ser formado por três letras do nome" de `_validar_sigla_corresponde_ao_nome`
      (`model_validator`) para um `field_validator("acronym")` usando `info.data["name"]`.
      Verificar que o erro passa a ter `loc = ("acronym",)`.
- [x] 1.6 Manter a regra "soma dos seis atributos não pode passar de 480" em
      `model_validator(mode="after")` em `JogadorCreate` (sem mudança de campo — permanece
      `field: null` no corpo de erro). Verificar que a mensagem continua "A soma dos seis atributos
      não pode passar de 480." em `exc.errors()`.
- [x] 1.7 Em cada `field_validator` cruzado criado nas tarefas 1.3-1.5, pular a checagem cruzada
      quando os campos dos quais ela depende não estiverem em `info.data` (porque falharam antes na
      validação de faixa simples), em vez de levantar um erro confuso sobre um campo que ainda nem
      foi validado (ver `design.md`, "Risks"). Verificar com um teste que envia, por exemplo,
      `pace` fora da faixa junto com `potential` inválido e confirma que o erro de `potential` não
      aparece quando `pace` já falhou sozinho.

## 2. Backend — handler central e formato da resposta

- [x] 2.1 Em `backend/src/mercado_jogadores/main.py`, atualizar o handler de
      `RequestValidationError` para usar `validation_errors.py` e devolver
      `{"message": <primeira mensagem ou mensagem agregada>, "errors": [...]}` em vez do texto fixo
      "Dado ou parâmetro inválido.". Verificar manualmente com uma requisição `POST /api/v1/players`
      inválida (ex.: `age: 10`) e conferir o novo corpo da resposta.
- [x] 2.2 Atualizar `backend/tests/integration/test_jogadores_api.py` e
      `backend/tests/integration/test_clubes_api.py`: para pelo menos um caso de recusa `400` já
      existente, adicionar asserts de que `errors` está presente, não vazio, e contém o `field`
      esperado com uma mensagem não vazia. Verificar rodando a suíte de testes de integração e
      confirmando que passa.
- [x] 2.3 Adicionar um teste de integração novo reproduzindo o cenário das imagens que motivaram
      esta change (jogador "Paulo": `pace=20, shooting=35, passing=89, dribbling=90, defending=5,
      physical=80, potential=80`) e verificar que a resposta `400` traz `errors` com
      `field: "potential"` e a mensagem "O potencial não pode ser menor que o maior atributo.".
      Verificar rodando esse teste e confirmando que passa.
- [x] 2.4 Rodar a suíte completa de testes do backend (`pytest`) e os comandos de lint/formatação
      informados no README do backend, e verificar que todos terminam sem falhas.

## 3. Frontend — camada comum de erro

- [x] 3.1 Em `frontend/src/lib/httpClient.js`, estender `ApiError` para carregar também `errors`
      (lista `{field, message}` do corpo da resposta, quando presente) e ajustar
      `parseErrorMessage`/`request` para repassá-la. Verificar com um teste unitário (ou manual,
      inspecionando o objeto `ApiError` lançado) confirmando que `error.errors` reflete o corpo da
      API.
- [x] 3.2 Em `frontend/src/shared/useAsyncAction.js`, expor `fieldErrors` (objeto `{ [campo]:
      mensagem }`, construído a partir de `error.errors` com `field` não nulo) além de
      `errorMessage`. Verificar com um teste existente ou novo do hook confirmando que, após uma
      chamada que rejeita com `errors`, `fieldErrors` reflete o mapeamento esperado.

## 4. Frontend — modais de cadastro/edição

- [x] 4.1 Em `frontend/src/features/jogadores/PlayerCreateModal.jsx`, mesclar `fieldErrors` (da API)
      com o objeto `errors` local (validação de um campo só) antes de passar a cada `FormField`,
      dando prioridade ao erro da API quando o mesmo campo tiver os dois. Verificar manualmente
      reproduzindo o cenário do jogador "Paulo" (ver `cadjogador.jpg`/`erroCad.jpg` na raiz do
      projeto) e confirmando que a mensagem "O potencial não pode ser menor que o maior atributo."
      aparece junto ao campo "Potencial", não mais só o banner genérico.
- [x] 4.2 Repetir o mesmo ajuste em `frontend/src/features/jogadores/PlayerEditModal.jsx`,
      `frontend/src/features/clubes/ClubCreateModal.jsx` e
      `frontend/src/features/clubes/ClubEditModal.jsx`. Verificar manualmente cada tela com um
      caso de violação de campo simples (ex.: nome de clube com dígito) e confirmar a mensagem
      junto ao campo correspondente.
- [x] 4.3 Conferir que, para recusas sem `errors` por campo (`404`/`409`, ou violação sem campo
      único como a soma dos atributos), o aviso geral do `Modal` continua mostrando a mensagem da
      API, sem nenhum campo marcado como erro. Verificar manualmente com um caso de `409` (ex.:
      nome de clube duplicado) e um caso de soma de atributos acima de 480.
- [x] 4.4 Rodar `npm run test`, `npm run lint`, `npm run format:check` e `npm run build` dentro de
      `frontend/` e verificar que os quatro terminam sem falhas.

## 5. Verificação final

- [x] 5.1 Verificar manualmente, com a aplicação rodando, os dois cenários das imagens que
      motivaram esta change (`cadjogador.jpg`, `erroCad.jpg`): cadastrar o jogador "Paulo" com os
      valores das imagens e confirmar que a tela agora mostra qual campo está errado e o que deve
      ser corrigido, em vez de "Dado ou parâmetro inválido.".
- [x] 5.2 Rodar `openspec validate mensagens-erro-validacao-por-campo --strict` e confirmar que a
      change continua válida após qualquer ajuste feito durante a implementação.
