## Why

O usuário pediu um "padrão universal" de ações para todas as telas de listagem (Clubes, Jogadores,
Partidas etc.): coluna final fixa com ícones de Alterar e Excluir, edição que carrega o formulário
preenchido e volta para a listagem ao salvar, e exclusão que nunca é imediata — sempre com
confirmação e validação de vínculos no banco, com mensagem clara se a exclusão não puder acontecer.

Conferindo o contrato de API já fixado pelo desafio (`backend/src/mercado_jogadores/*/router.py`,
espelhado em `openspec/specs/*/spec.md`), só **jogadores** tinha, até aqui, endpoint de edição (`PUT
/players/{id}`) e de exclusão (`DELETE /players/{id}`). Depois de revisar as opções com o usuário:
- **Clubes**: ganha edição de nome/sigla via a change `clubes-edicao` (`PUT /clubs/{id}`, nova).
  Exclusão de clube continua proibida — essa parte do padrão (ícone de Excluir) não se aplica a
  Clubes, por decisão explícita do usuário de manter a política de nunca deletar um clube.
- **Partidas** e **histórico de transações**: continuam só com `GET`/`POST`
  (`liga/router.py`, `mercado/router.py`). São logs imutáveis por definição (RN17 e RN20): depois de
  criados, nunca recebem `UPDATE` nem `DELETE`. Mudar isso contrariaria regra de negócio fechada pelo
  enunciado do desafio e arriscaria o roteiro de correção automatizado da API (B1) — fora do escopo
  desta change.
- **Classificação**: não é uma lista de registros editáveis — é uma view calculada a partir de
  partidas e clubes (`GET /standings`), sem identidade própria para editar ou excluir.

Esta change aplica o padrão a Jogadores (Editar + Excluir, já suportado hoje) e a Clubes (só Editar,
depois que `clubes-edicao` existir); Partidas, Classificação e o histórico de transações continuam
fora, pelos motivos acima.

## What Changes

- Na tabela de jogadores, os botões "Editar" e "Excluir" deixam de ficar só dentro do menu "..." e
  passam a aparecer como ícones sempre visíveis numa coluna final fixa (ao lado de "Comprar", quando
  o jogador for livre); "Detalhes" e "Alterar condição" continuam no menu "..." (não fazem parte do
  padrão pedido).
- Formaliza como requisito testável o que já é o comportamento atual: editar carrega o formulário
  preenchido com os dados do jogador, e salvar fecha o formulário e atualiza a listagem sem navegar
  para outro lugar (não há tela de edição separada — é sempre um modal sobre a própria listagem).
- Formaliza como requisito testável que excluir nunca é imediato (sempre pede confirmação), que o
  botão de excluir não aparece para jogador com clube (o vínculo que impede a exclusão, RN09), e que
  qualquer recusa da API aparece como mensagem clara no modal de confirmação.
- Na tabela de Clubes, adiciona um ícone de Editar sempre visível (sem ícone de Excluir — exclusão
  de clube continua proibida), abrindo um modal de edição de nome/sigla pré-preenchido, consumindo o
  `PUT /clubs/{id}` de `clubes-edicao`.
- **Não aplica o padrão a Partidas, Classificação nem ao histórico de transações** — ver "Why" e
  `design.md` para o raciocínio completo.
- **Depende de `clubes-edicao`** (change de backend) para o endpoint `PUT /clubs/{id}` existir antes
  da parte de Clubes desta change poder ser implementada de verdade (a parte de Jogadores não
  depende de nada novo).

## Capabilities

### New Capabilities
- `frontend-crud-acoes-padrao`: ícones fixos de Editar (e Excluir, quando aplicável) nas tabelas de
  jogadores e de clubes, e os fluxos padrão de edição (formulário preenchido, sem navegação) e
  exclusão (confirmação, vínculo bloqueando, mensagem clara) para as entidades que suportam essas
  operações no backend.

### Modified Capabilities
(nenhuma — as capabilities funcionais de `frontend-especificacao-inicial` não mudam; esta change só
reorganiza a interação das tabelas de jogadores e de clubes e formaliza comportamento já existente)

## Impact

- `frontend/src/features/jogadores/PlayersTable.jsx` (mover Editar/Excluir para ícones fixos)
- `frontend/src/features/clubes/ClubesTable.jsx` (ícone de Editar)
- `frontend/src/features/clubes/ClubEditModal.jsx` (novo, modal de edição de nome/sigla)
- `frontend/src/features/clubes/api.js` (nova função `updateClub`, consumindo `PUT /clubs/{id}`)
- `frontend/src/shared/Icon.jsx` (ícones novos: lápis para "Editar", lixeira para "Excluir")
- Nenhum código de `backend/` é afetado por esta change (o endpoint vem de `clubes-edicao`).
