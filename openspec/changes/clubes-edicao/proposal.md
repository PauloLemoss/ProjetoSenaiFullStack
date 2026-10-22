## Why

O usuário quer que a tela de Clubes siga o mesmo padrão de ações de Editar que a tela de Jogadores
(`frontend-tabela-acoes-padrao`). Hoje o backend só tem `GET /clubs` e `POST /clubs` — não existe
jeito de editar um clube já criado. Depois de avaliar as opções com o usuário (ver conversa que
originou esta change), a decisão foi: adicionar edição de nome e sigla (`PUT /clubs/{id}`), mantendo
a exclusão de clube proibida, como já é hoje (`clubes` SHALL nunca ser deletado — política de
deleção documentada no projeto).

## What Changes

- Novo endpoint `PUT /clubs/{id}` que permite editar `name` e `acronym` de um clube existente, com
  as mesmas regras de formato, correspondência sigla↔nome e unicidade já usadas no cadastro (RN10) —
  exceto que o próprio clube não compete como duplicado dele mesmo ao salvar sem mudar nome/sigla.
- Nenhum outro campo do clube (`cash`, elenco) muda por esse endpoint.
- Nenhum endpoint de exclusão de clube é adicionado — a política de nunca deletar clube continua
  valendo.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `clubes`: adiciona a edição de nome/sigla de um clube existente (`PUT /clubs/{id}`), reaproveitando
  as regras de validação de formato e a regra de correspondência sigla↔nome já usadas no cadastro
  (RN10); os demais requisitos da capability (criação, listagem, consulta com elenco) não mudam.

## Impact

- `backend/src/mercado_jogadores/clubes/schemas.py`: novo schema de entrada para edição (reaproveita
  os validadores de formato de `ClubeCreate`).
- `backend/src/mercado_jogadores/clubes/service.py`: novo método `editar` no `ClubeService`, com a
  verificação de unicidade excluindo o próprio clube.
- `backend/src/mercado_jogadores/clubes/router.py`: novo `PUT /clubs/{id}`.
- `backend/tests/`: testes do service (repositório fake) e de integração do novo endpoint.
- Frontend consumidor deste endpoint fica em `frontend-tabela-acoes-padrao` (change separada, já
  existente), que ganha o ícone de Editar na tela de Clubes assim que este endpoint existir.
