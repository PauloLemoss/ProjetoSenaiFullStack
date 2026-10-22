## 1. Estilização e Estrutura Visual da Tela Inicial

- [x] 1.1 Criar `frontend/src/features/home/PasseLanding.css` com o layout da moldura `.passe-frame`,
      campo SVG `.passe-pitch`, marca `.passe-brand`, pílula `.passe-status`, seção `.passe-hero`,
      botões `.passe-primary` e `.passe-login`, indicadores `.passe-stats`, grade de 6 cartões
      `.passe-features`/`.passe-card`, rodapé `.passe-footer` e media queries responsivas (sem
      `@import` externo e sem rolagem horizontal em 375 px).
- [x] 1.2 Atualizar `frontend/src/features/home/HomePage.jsx` com o componente `Pitch` (SVG do campo
      ao fundo), os 6 cartões numerados (`01` a `06`) com ícones SVG limpos, os botões `Iniciar →` e
      `Enter` (incluindo atalho de teclado `Enter`) e integração com `useNavigate()`.

## 2. Integração com Dados da API e Testes

- [x] 2.1 Conectar os contadores da barra `.passe-stats` (`jogadores`, `livres`, `clubes`,
      `partidas`) e o líder opcional da pílula `.passe-status` às chamadas da camada de API
      (`listPlayers`, `listClubs`, `listMatches`, `getStandings`), com fallback seguro quando algum
      endpoint não estiver mockado nos testes unitários.
- [x] 2.2 Atualizar `frontend/src/features/home/HomePage.test.jsx` e `frontend/src/App.test.jsx` e
      validar `openspec validate redesign-tela-inicial-passe --strict`, `npm run lint`,
      `npm run format:check`, `npm run test` e `npm run build`.
