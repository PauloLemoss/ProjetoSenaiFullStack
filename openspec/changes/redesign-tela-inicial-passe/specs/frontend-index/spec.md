## Purpose

Define o design visual e os comportamentos interativos da tela inicial (`/`) no padrão **Passe**
(`docs/mockup-tela-inicial.png`), mantendo a navegação lateral (`AppShell`), os contadores vindos
diretamente da API e os atalhos de navegação SPA para os módulos do sistema.

## ADDED Requirements

### Requirement: Identidade visual Passe com campo ao fundo na rota raiz
A rota raiz (`/`) SHALL renderizar a tela inicial dentro do `AppShell`, apresentando uma moldura
com o desenho de um campo de futebol em SVG ao fundo (`Pitch`), a marca **Passe** (ícone `P` e
título `Passe`), a pílula de status `Liga Fictícia 2026`, o título principal `"Gestão da liga, do
mercado à classificação"`, o subtítulo explicativo e o rodapé `"Liga Fictícia 2026 · Horário de
Brasília (UTC-3)"`.

#### Scenario: Acessar a raiz exibe o hero Passe sem redirecionar
- **WHEN** o usuário acessa `/`
- **THEN** a tela inicial mostra a marca "Passe", o título "Gestão da liga, do mercado à
  classificação" e mantém a navegação lateral do `AppShell` visível

### Requirement: Ação Iniciar e atalho Enter para entrar no mercado
A tela inicial SHALL exibir o botão primário `Iniciar →` e o botão secundário `Enter` (ao lado de
`"ou tecle"`). Clicar em qualquer um dos dois botões ou pressionar a tecla `Enter` na tela inicial
SHALL navegar para `/jogadores` sem recarregar a página.

#### Scenario: Clicar em Iniciar leva para a lista de jogadores
- **WHEN** o usuário clica no botão "Iniciar"
- **THEN** a aplicação navega para `/jogadores` sem recarregar a página

#### Scenario: Pressionar a tecla Enter na tela inicial leva para a lista de jogadores
- **WHEN** o usuário está na tela inicial e pressiona a tecla `Enter`
- **THEN** a aplicação navega para `/jogadores` sem recarregar a página

### Requirement: Seis cartões numerados com as etapas do sistema e navegação SPA
A tela inicial SHALL exibir seis cartões numerados (`01 Jogadores`, `02 Clubes`, `03 Compra`,
`04 Venda`, `05 Histórico` e `06 Liga`) descrevendo o fluxo completo do sistema, com ícone, número,
título e descrição curta. Clicar em um cartão SHALL navegar sem recarregar a página para a rota do
módulo correspondente (`/jogadores`, `/clubes` ou `/partidas`).

#### Scenario: Clicar no cartão 01 Jogadores navega para /jogadores
- **WHEN** o usuário clica no cartão "Jogadores" na tela inicial
- **THEN** a navegação muda para `/jogadores` sem recarregar a página

### Requirement: Barra de estatísticas alimentada diretamente pela API
A tela inicial SHALL exibir na seção hero a barra de indicadores com o total de jogadores
(`meta.total_items` de `GET /players`), total de jogadores livres (`meta.total_items` de
`GET /players?free=true`), total de clubes (`clubs.length` de `GET /clubs`), total de partidas
(`matches.length` de `GET /matches`) e o aviso `"Não precisa de login"`, sem recalcular nenhuma
regra de negócio no frontend.

#### Scenario: Contagem de jogadores e clubes reflete os dados da API
- **WHEN** a API retorna `total_items: 42` em `GET /players` e 3 clubes em `GET /clubs`
- **THEN** a tela inicial exibe `42` junto a `jogadores` e `3` junto a `clubes`
