## 1. Schema de edição

- [x] 1.1 Em `backend/src/mercado_jogadores/clubes/schemas.py`, criar `ClubeUpdate` reaproveitando os
      validadores de `ClubeCreate` (formato de `name`, formato de `acronym`, correspondência
      sigla↔nome), sem duplicar a lógica de validação; adicionar um método equivalente a
      `para_dados_de_cadastro()` (ex.: `para_dados_de_edicao()`) devolvendo um novo dataclass
      `DadosEdicaoClube` (ou reaproveitando `DadosCadastroClube` se os campos forem idênticos);
      verificar com um teste em `tests/unit/test_clubes_schemas.py` que `ClubeUpdate` recusa os
      mesmos formatos inválidos que `ClubeCreate` já recusa (nome com dígito, sigla fora de ordem,
      etc.).
      → Feito: `ClubeUpdate` herda de `ClubeCreate` (todos os validadores reaproveitados) e
      `para_dados_de_edicao()` reaproveita `DadosCadastroClube` (campos idênticos).

## 2. Regra de negócio (service)

- [x] 2.1 Em `backend/src/mercado_jogadores/clubes/service.py`, adicionar `ClubeService.editar(id,
      dados)`: busca o clube (404 via `_obter_ou_falhar` se não existir), verifica duplicidade de
      nome e de sigla com os mesmos métodos do repositório já usados em `cadastrar`
      (`obter_por_nome_normalizado`, `obter_por_sigla`), ignorando o resultado quando o id do clube
      encontrado for igual ao do clube sendo editado; atualiza `nome`, `nome_normalizado` e `sigla`
      do clube e salva; devolve o clube atualizado com elenco/patrimônio (reaproveitando
      `_com_elenco`, igual a `cadastrar`/`consultar`).
      → Feito: `ClubeService.editar` implementado com verificação de unicidade excluindo o próprio
      clube (comparação de id em memória, sem novo método no repositório).
- [x] 2.2 Escrever testes de unidade em `tests/unit/test_clubes_service.py` (repositório fake, sem
      banco) cobrindo: edição válida; salvar sem mudar nome/sigla não falha por duplicidade consigo
      mesmo; nome duplicado de outro clube é recusado; sigla duplicada de outro clube é recusada;
      clube inexistente levanta `NaoEncontradoError`; `cash` e elenco não mudam depois da edição.
      → Feito: classe `TestEditar` com 6 testes, todos passando.

## 3. Endpoint

- [x] 3.1 Em `backend/src/mercado_jogadores/clubes/router.py`, adicionar `PUT /clubs/{clube_id}`
      (`status_code=200`, `response_model=ClubeComElencoRead` ou `ClubeRead`, conforme o que
      `editar` devolver), validando o id da URL como os demais endpoints (`validar_id_da_url`) e
      chamando `service.editar`.
      → Feito: `PUT /clubs/{clube_id}` adicionado, com `validar_id_da_url`, `ClubeUpdate` como
      schema de entrada e `ClubeComElencoRead` como resposta.
- [x] 3.2 Escrever um teste de integração em `tests/integration/test_clubes_api.py` cobrindo: edição
      válida responde `200` com os novos valores; nome duplicado responde `409`; sigla que não
      corresponde ao novo nome responde `400`; clube inexistente responde `404`; editar sem mudar
      nome/sigla responde `200` (não `409`).
      → Feito: classe `TestEdicaoDeClube` com 5 testes, todos passando.

## 4. Verificação final

- [x] 4.1 Rodar a suíte de testes do backend (`poetry run poe test`, dentro de `backend/`), o lint
      (`poetry run poe lint`) e a verificação de formatação (`poetry run poe format-check`);
      verificar que os três terminam sem falhas.
      → Feito: 485 testes passando, lint aprovado, format-check aprovado.
