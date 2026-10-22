## Why

A tela inicial atual (`frontend/src/features/home/HomePage.jsx`) exibe apenas um título simples e
quatro cartões básicos, sem reproduzir a identidade visual completa do mockup da tela inicial da
marca **Passe** (`docs/mockup-tela-inicial.png`): moldura com desenho do campo de futebol em SVG ao
fundo (`Pitch`), cabeçalho com logo `P` e nome `Passe`, pílula de status da `Liga Fictícia 2026`
(com o líder atual quando houver pontuação na classificação), seção hero com título `"Gestão da
liga, do mercado à classificação"`, botão primário `Iniciar →` e atalho de teclado `Enter`, barra de
indicadores rápidos (`jogadores`, `livres`, `clubes`, `partidas`, `Não precisa de login`) alimentada
pelos dados reais da API, os 6 cartões numerados (`01 Jogadores` a `06 Liga`) representando o fluxo
completo do sistema e o rodapé com o fuso horário (`Liga Fictícia 2026 · Horário de Brasília
(UTC-3)`).

## What Changes

- Redesign completo de `frontend/src/features/home/HomePage.jsx` (e estilos dedicados em
  `frontend/src/features/home/PasseLanding.css`), seguindo o layout do mockup da tela inicial
  **Passe** com campo de futebol em SVG ao fundo.
- Manutenção integral do `AppShell` (navegação lateral, contadores, lista rápida de clubes e modal
  de criação de clube) ao redor da `HomePage` na rota `/`.
- Integração de todos os elementos interativos da tela inicial com a navegação SPA (`useNavigate` do
  `react-router-dom`) e atalho de teclado (`Enter`), sem recarregar a página:
  - Botão `Iniciar →`, botão `Enter` e tecla `Enter` do teclado navegam para `/jogadores`.
  - Os 6 cartões de etapas (`01 Jogadores`, `02 Clubes`, `03 Compra`, `04 Venda`, `05 Histórico`,
    `06 Liga`) navegam para as rotas correspondentes do sistema (`/jogadores`, `/clubes`,
    `/partidas`) e continuam acessíveis por clique e teclado.
- Alimentação dos contadores da barra de estatísticas (`jogadores`, `livres`, `clubes`, `partidas`)
  e do líder na pílula de status diretamente a partir dos retornos da API (`GET /players`,
  `GET /players?free=true`, `GET /clubs`, `GET /matches`, `GET /standings`), sem recalcular nenhuma
  regra de negócio no frontend.
- Atualização dos testes automatizados (`HomePage.test.jsx` e `App.test.jsx`) para cobrir a nova
  interface, os contadores da API e os fluxos de navegação.

## Capabilities

### New Capabilities
(nenhuma — evolui a capability `frontend-index`)

### Modified Capabilities
- `frontend-index`: atualiza o layout e os elementos visuais e interativos da tela inicial (`/`)
  para o design **Passe** com campo de futebol ao fundo, botão `Iniciar →` / `Enter`, barra de
  estatísticas em tempo real da API e os 6 cartões numerados das etapas do sistema, preservando a
  integração com o `AppShell`.

## Impact

- `frontend/src/features/home/HomePage.jsx` e `frontend/src/features/home/PasseLanding.css`:
  implementação do novo layout e interações da tela inicial.
- `frontend/src/features/home/HomePage.test.jsx` e `frontend/src/App.test.jsx`: atualização dos
  testes automatizados de componente.
- Nenhum código de `backend/` é alterado e nenhum contrato de API muda.
