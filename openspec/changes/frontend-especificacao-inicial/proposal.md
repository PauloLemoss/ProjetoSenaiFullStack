## Why

O backend está 100% implementado (4 módulos: jogadores, clubes, mercado, liga) e o frontend ainda
não existe — só há a pasta `frontend/docs/` com os mockups do Figma e `frontend/front.md` com um
mapeamento inicial Figma → requisito → endpoint. O barema de correção (`desafio-isi-dev-1/barema.md`)
reserva 40 pontos para o frontend (F1 a F5) e ainda não há nenhuma spec rastreável para esses
requisitos, ao contrário do backend, que já tem suas 6 capabilities documentadas em
`openspec/specs/`. Antes de escrever qualquer código React é preciso formalizar o que cada tela
deve fazer, citando o item do barema (F01–F14, F2, F3, F5) e a regra de negócio (RN01–RN21) que ela
cobre, do mesmo jeito que o backend já faz — assim a implementação segue um roteiro verificável em
vez de reinterpretar o Figma e o `front.md` ao sabor da hora.

## What Changes

- Criação de 6 capabilities novas de frontend, espelhando a organização que o backend já usa
  (`api-conventions`, `jogadores`, `clubes`, `mercado`, `liga`, `diferenciais-tecnicos`):
  - Regras transversais de qualidade de código e de usabilidade/feedback que valem para todas as
    telas (camada de API própria, componentes reutilizáveis, atualização sem recarregar a página,
    nenhuma regra de negócio recalculada na tela, validação dos 7 formulários, estados de
    carregamento/vazio/erro, mensagens de sucesso/recusa com proteção contra duplo clique,
    formatação de moeda e data).
  - Telas de jogadores: listagem com paginação/total, busca e filtros combináveis, ordenação,
    exclusão lógica (só jogador livre), cadastro/edição/alteração de condição.
  - Telas de clubes: listagem ordenada (nome ou patrimônio) e criação; página do clube com
    caixa/valor do elenco/patrimônio e elenco com contrato.
  - Telas de mercado: compra (a partir da lista de livres) e venda (a partir da página do clube),
    histórico de transações com filtros e totais do `summary`, exportação CSV.
  - Telas de liga: escalação (formação + titulares), nova partida com placar e 6 duelos, histórico
    de partidas e classificação.
  - Diferenciais de interface: responsividade em 375px, comando de testes do frontend e comandos
    de lint/format-check.
- Nenhum código é escrito nesta etapa — só as specs (requisitos verificáveis), o design (decisões
  de arquitetura/stack do frontend) e as tasks (passos para a implementação futura).
- Esta etapa não inclui o scaffold do projeto React: isso fica para uma próxima change, quando as
  imagens completas do Figma estiverem disponíveis para o design visual.

## Capabilities

### New Capabilities
- `frontend-conventions`: regras transversais a todas as telas do frontend — camada de serviço de
  API, reaproveitamento de componentes, atualização de dados sem reload, proibição de recalcular
  regra de negócio, validação dos 7 formulários antes de enviar, estados de carregamento/vazio/erro
  nas 6 telas de lista, mensagens de sucesso/recusa com proteção contra duplo clique, formatação de
  moeda e data (F2, F3).
- `frontend-jogadores`: tela de listagem de jogadores (tabela, paginação, total), busca e filtros
  combináveis, ordenação, exclusão de jogador livre com confirmação, cadastro, edição e alteração de
  condição física (F01–F04).
- `frontend-clubes`: listagem de clubes ordenada e formulário de criação; página do clube com
  indicadores financeiros e elenco com contrato (F05, F07).
- `frontend-mercado`: fluxo de compra e de venda de jogadores, histórico de transações com filtros e
  totais, exportação CSV (F06, F08–F11).
- `frontend-liga`: escalação de titulares, criação de partida com placar e duelos, histórico de
  partidas e classificação da liga (F12–F14).
- `frontend-diferenciais`: responsividade em 375px, comando de testes do frontend e comandos de
  lint/format-check (F5).

### Modified Capabilities
(nenhuma — todas as capabilities de backend ficam inalteradas; esta change só adiciona
capabilities de frontend)

## Impact

- Novo diretório `openspec/specs/frontend-conventions/`, `frontend-jogadores/`, `frontend-clubes/`,
  `frontend-mercado/`, `frontend-liga/` e `frontend-diferenciais/` (via delta desta change).
- Nenhum código de `backend/` ou `frontend/` é alterado por esta change.
- Serve de base para uma change futura de scaffold/implementação do projeto React em `frontend/`,
  que deverá seguir as specs aqui definidas.
