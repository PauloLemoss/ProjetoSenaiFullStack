## Context

A rota raiz (`/`) já renderiza `HomePage` dentro do `<Outlet />` de `AppShell`. O objetivo desta
change é aplicar o design completo da landing page **Passe** (conforme `docs/mockup-tela-inicial.png`
e o componente/CSS de referência) sem perder nenhuma funcionalidade existente da aplicação:
navegação lateral do `AppShell`, navegação SPA via React Router, leitura dos contadores reais da API
sem recálculo de regras de negócio no cliente e funcionamento offline (sem `@import` de fontes
externas da internet).

## Goals / Non-Goals

**Goals:**
- Reproduzir fielmente o visual da tela inicial **Passe** (moldura com `Pitch` SVG ao fundo, marca
  `Passe`, pílula de status `Liga Fictícia 2026`, hero `"Gestão da liga, do mercado à
  classificação"`, botões `Iniciar →` e `Enter`, linha de estatísticas, grade de 6 cartões
  numerados `01` a `06` e rodapé com horário de Brasília).
- Conectar todos os botões, atalho de teclado `Enter` e os 6 cartões às rotas do React Router
  (`/jogadores`, `/clubes`, `/partidas`, `/classificacao`) sem recarregar a página.
- Exibir contagens reais vindas da API (`jogadores`, `livres`, `clubes`, `partidas`) e o líder da
  liga no badge de status quando houver clube pontuado em `GET /standings`.
- Manter 100% de compatibilidade com `AppShell`, responsividade mobile (375 px sem rolagem
  horizontal da página), `oxlint`, `prettier` e suíte do `vitest`.

**Non-Goals:**
- Alterar qualquer endpoint do backend ou criar novas rotas na API.
- Remover ou esconder a navegação lateral (`AppShell`) na rota `/`.

## Decisions

1. **Estilos isolados com prefixo `.passe-*` em `PasseLanding.css` (sem `@import` externo)**
   - **Escolha**: manter as classes `.passe-*` em `frontend/src/features/home/PasseLanding.css`
     importado por `HomePage.jsx`, removendo `@import url('https://fonts.googleapis.com/...')` e
     ajustando `.passe-page` para preencher a área principal do `<main>` dentro do `AppShell` sem
     forçar `100vh` externo que conflite com a sidebar.
   - **Por quê**: evita dependência de rede externa no ambiente de avaliação e impede vazamento de
     estilo para as demais telas que usam utilitários Tailwind.

2. **Navegação SPA em todos os pontos de ação da tela inicial**
   - **Escolha**:
     - Botão `Iniciar →`, botão `Enter` e listener de tecla `Enter` (quando o foco não estiver em um
       input/modal ou outro botão específico) navegam para `/jogadores`.
     - Os 6 cartões (`01 Jogadores`, `02 Clubes`, `03 Compra`, `04 Venda`, `05 Histórico`,
       `06 Liga`) são elementos clicáveis (`<button type="button">`) que navegam via `useNavigate()`:
       - `01 Jogadores` e `03 Compra` → `/jogadores`
       - `02 Clubes`, `04 Venda` e `05 Histórico` → `/clubes`
       - `06 Liga` → `/partidas`
   - **Por quê**: preserva o comportamento de navegação por cartões na tela inicial e garante que
     nenhum botão ou card seja apenas decorativo.

3. **Contadores e líder lidos diretamente das respostas da API**
   - **Escolha**:
     - Total de jogadores: `meta.total_items` de `GET /players?page=1&limit=1` (via `listPlayers`).
     - Total de jogadores livres: `meta.total_items` de `GET /players?page=1&limit=1&free=true`.
     - Total de clubes: `clubs.length` de `GET /clubs` (via `listClubs`).
     - Total de partidas: `matches.length` de `GET /matches` (via `listMatches`).
     - Líder da liga (opcional na pílula do topo): primeiro item de `GET /standings` (via
       `getStandings`) quando a lista tiver ao menos um clube com `points > 0`, exibindo
       `líder: {club_name}, {points} pontos` exatamente como devolvido pela API.
   - **Por quê**: respeita rigorosamente a regra de qualidade do código do frontend (nenhuma regra
     de negócio recalculada na tela) e mantém compatibilidade com mocks parciais nos testes.
