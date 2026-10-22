## Why

O frontend já está funcionalmente completo (`frontend-especificacao-inicial`, 24/24 tarefas), mas a
UI é pouco profissional e usa CSS puro sem nenhum design system: a tela de Jogadores (e as demais)
fica com fundo escuro indesejado sempre que o sistema operacional do usuário está em modo escuro —
`frontend/src/index.css` declara `color-scheme: light dark` e segue a preferência do SO via
`@media (prefers-color-scheme: dark)` — além de inputs/selects nativos sem estilo, falta de
hierarquia visual, sidebar sem destaque de rota ativa e nenhum cartão/sombra/espaçamento
consistente. Além disso, a rota `/` hoje só redireciona direto para `/jogadores`
(`frontend/src/App.jsx`); não existe uma tela inicial de verdade. Esta change formaliza, como
specs, a melhoria visual de todas as telas do frontend com Tailwind CSS, fundo claro forçado
(independente da preferência do SO) e uma nova tela inicial.

## What Changes

- Adoção do Tailwind CSS no projeto `frontend/` (configuração, tokens de tema) como base de todo o
  redesign visual, substituindo o CSS puro por feature.
- Fixação do tema claro em toda a aplicação, removendo a adaptação automática ao modo escuro do
  sistema operacional.
- Redesign visual dos componentes compartilhados (`src/shared`): tabela de lista, campo de
  formulário, modal e badge de condição, com uma linguagem visual única (paleta, tipografia,
  espaçamento, cartões com sombra, estados de foco visíveis).
- Redesign visual da navegação (`AppShell`): sidebar com indicação clara da rota ativa, hierarquia
  visual de marca e seções.
- **Nova tela inicial (`/`)**: hoje a rota raiz só redireciona para `/jogadores`; passa a existir
  uma tela de início/dashboard com atalhos para Jogadores, Clubes, Partidas e Classificação.
- Redesign visual de todas as telas e modais existentes (jogadores, clubes, mercado, liga),
  mantendo os requisitos funcionais já especificados em `frontend-especificacao-inicial` — nenhuma
  regra de negócio, campo, endpoint ou comportamento muda, só a camada visual.
- Nenhum código é escrito nesta etapa — só specs (requisitos de design verificáveis), design
  (decisões de arquitetura visual/stack) e tasks (passos para uma implementação futura).

## Capabilities

### New Capabilities
- `frontend-design-system`: adoção do Tailwind, tokens de tema (paleta clara, tipografia,
  espaçamento, sombra, raio de borda), fixação do tema claro e os requisitos visuais dos
  componentes compartilhados (tabela, campo de formulário, modal, badge) usados por todas as
  telas.
- `frontend-index`: nova tela inicial (`/`), com visão geral e atalhos para os módulos do sistema,
  substituindo o redirecionamento direto para `/jogadores`.
- `frontend-jogadores-visual`: requisitos visuais da listagem/filtros/tabela de jogadores e dos
  modais de cadastro, edição, condição, exclusão e detalhes.
- `frontend-clubes-visual`: requisitos visuais da listagem de clubes, do formulário de criação e da
  página do clube (indicadores financeiros, elenco, escalação).
- `frontend-mercado-visual`: requisitos visuais dos modais de compra e de venda.
- `frontend-liga-visual`: requisitos visuais da tela de partida (duelos e placar) e da
  classificação.

### Modified Capabilities
(nenhuma — as capabilities funcionais de `frontend-especificacao-inicial` ainda não foram
arquivadas em `openspec/specs/`; esta change não altera nenhum requisito funcional existente, só
adiciona requisitos de camada visual, em capabilities novas e separadas)

## Impact

- `frontend/package.json`, `frontend/vite.config.js`: nova dependência e configuração do Tailwind
  (e PostCSS, se exigido pela versão instalada).
- `frontend/src/index.css`: tokens de tema via Tailwind, remoção do `@media
  (prefers-color-scheme: dark)` e do `color-scheme: light dark`.
- `frontend/src/app/AppShell.jsx`, `AppShell.css`: redesign da navegação; nova rota `/` deixa de
  redirecionar e passa a renderizar a tela inicial (`frontend/src/App.jsx`).
- `frontend/src/shared/*`: redesign visual dos componentes compartilhados.
- `frontend/src/features/{jogadores,clubes,mercado,liga}/*`: redesign visual das telas e modais,
  sem mudança de comportamento ou de chamadas à API.
- Nenhum código de `backend/` é afetado; nenhum contrato de API muda.
- Serve de base para uma change futura de implementação do redesign em `frontend/`.
