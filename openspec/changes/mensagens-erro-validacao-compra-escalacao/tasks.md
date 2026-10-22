## 1. Backend — tradutor de erros e schemas

- [x] 1.1 Em `backend/src/mercado_jogadores/core/validation_errors.py`, adicionar `club_id`,
      `loyalty_until` e `player_ids` a `_CAMPOS_DO_FORMULARIO`, e seus rótulos a
      `_ROTULO_POR_CAMPO` ("Clube", "Fim da fidelidade", "Jogadores escalados"). Verificar com um
      teste unitário que `_campo_de_loc` devolve esses nomes em vez de `None` para
      `loc=("club_id",)`, `loc=("loyalty_until",)` e `loc=("player_ids",)`.
- [x] 1.2 Criar `_MENSAGENS_PERSONALIZADAS` com as combinações `(campo, type)` descritas em
      `design.md` (decisão 2): `("club_id", "missing")`, `("club_id", "greater_than")`,
      `("player_ids", "too_short")`, `("player_ids", "too_long")`. Consultar esse dicionário antes
      dos ramos existentes em `traduzir_erros_de_validacao`. Verificar com testes unitários cobrindo
      cada uma das quatro combinações.
- [x] 1.3 Em `backend/src/mercado_jogadores/mercado/schemas.py`, mover
      `_validar_intervalo_de_loyalty_until` de `@model_validator(mode="after")` para
      `@field_validator("loyalty_until", mode="after")` (não depende de nenhum outro campo — ver
      `design.md`, decisão 1). Verificar que os testes existentes de `BuyRequest` continuam
      passando e que o erro passa a ter `loc=("loyalty_until",)` em vez de `loc=()`.
- [x] 1.4 Em `backend/src/mercado_jogadores/liga/schemas.py`, trocar o texto do `raise ValueError`
      em `_sem_ids_repetidos` de `"player_ids não pode repetir ids."` para um texto em português
      natural (ex.: "Não é possível escalar o mesmo jogador em mais de uma posição."). Antes de
      alterar, rodar `grep -rn "player_ids não pode repetir" backend/tests/` para confirmar se
      algum teste existente faz assert do texto antigo; se sim, atualizar esse teste junto.
      Verificar rodando a suíte de testes depois da mudança.
- [x] 1.5 (Achado na revisão) As mensagens de `_validar_intervalo_de_loyalty_until` em
      `backend/src/mercado_jogadores/mercado/schemas.py` ainda expunham o nome do campo cru
      ("loyalty_until precisa ser uma data futura.", "loyalty_until não pode passar de 1095 dias
      da compra."), violando a mesma regra da tarefa 1.4 e o requirement de `api-conventions`
      desta change ("nunca um texto técnico que exponha o nome interno de uma variável"). Corrigido
      para "O fim da fidelidade precisa ser uma data futura." e "O fim da fidelidade não pode
      passar de 1095 dias da compra."; removido também o parâmetro `info: ValidationInfo` não
      utilizado do mesmo validator (e o import correspondente). Verificado reproduzindo os dois
      cenários via schema direto e rodando a suíte completa (508 testes, lint e format-check sem
      falhas).

## 2. Backend — testes de integração

- [x] 2.1 Em `backend/tests/integration/test_mercado_api.py`, adicionar (ou ajustar) testes para:
      `club_id` ausente e `club_id = 0` na compra, confirmando `errors` com `field: "club_id"` e
      mensagem não vazia; `loyalty_until` no passado e acima de 1095 dias no futuro, confirmando
      `errors` com `field: "loyalty_until"`. Verificar rodando esses testes e confirmando que
      passam.
- [x] 2.2 Em `backend/tests/integration/test_liga_api.py`, adicionar (ou ajustar) um teste para
      escalar o mesmo jogador em duas vagas, confirmando `errors` com `field: "player_ids"` e a
      nova mensagem em português natural (não o texto técnico antigo). Verificar rodando esse teste
      e confirmando que passa.
- [x] 2.3 Rodar a suíte completa de testes do backend (`pytest`) e os comandos de lint/formatação
      do README do backend, e verificar que todos terminam sem falhas.

## 3. Frontend — compra de jogador

- [x] 3.1 Em `frontend/src/features/mercado/BuyPlayerModal.jsx`, desestruturar `fieldErrors` de
      `useAsyncAction` e aplicar `fieldErrors.club_id ?? errors.club_id` no `FormField` do campo
      "Clube". Verificar manualmente tentando comprar sem selecionar um clube (se a UI permitir
      chegar a esse estado) ou simulando a resposta da API, e confirmar a mensagem junto ao select.
- [x] 3.2 No mesmo arquivo, aplicar `fieldErrors.loyalty_until ?? errors.loyalty_date` no
      `FormField` de data e `fieldErrors.loyalty_until ?? errors.loyalty_time` no `FormField` de
      hora (ver `design.md`, decisão 4 — o mesmo erro aparece nos dois). Verificar manualmente
      comprando um jogador com uma data de fidelidade no passado e confirmando que a mensagem
      aparece junto aos dois campos.
- [x] 3.3 Confirmar que, para recusas de regra de negócio da compra (ex.: limite de 50% do caixa,
      clube sem caixa suficiente — `409`), o aviso geral do `Modal` continua mostrando a mensagem
      da API normalmente, sem nenhum campo marcado como erro.
- [x] 3.4 Rodar `npm run test`, `npm run lint`, `npm run format:check` e `npm run build` dentro de
      `frontend/` e verificar que os quatro terminam sem falhas.

## 4. Verificação final

- [x] 4.1 Verificar manualmente, com a aplicação rodando: tentar comprar um jogador com data de
      fidelidade no passado e confirmar que a tela mostra a mensagem certa junto aos campos de
      data/hora, em vez do aviso genérico antigo.
- [x] 4.2 Verificar manualmente, com a aplicação rodando: na escalação, tentar enviar (via chamada
      direta à API, já que a UI não permite repetir um jogador através dos seletores — ou ajustando
      temporariamente o estado para forçar o caso) uma escalação com o mesmo jogador em duas vagas,
      e confirmar que o aviso de erro mostra o texto em português natural, não mais
      "player_ids não pode repetir ids.".
- [x] 4.3 Rodar `openspec validate mensagens-erro-validacao-compra-escalacao --strict` e confirmar
      que a change continua válida após qualquer ajuste feito durante a implementação.
