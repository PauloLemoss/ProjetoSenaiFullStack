## Purpose

Cria uma tela inicial de verdade para o frontend. Hoje a rota raiz (`/`) só redireciona para
`/jogadores` (`frontend/src/App.jsx`); esta capability define uma tela de entrada com
identidade visual própria e atalhos para os módulos do sistema, usando a base visual de
`frontend-design-system`.

## ADDED Requirements

### Requirement: Tela inicial própria na rota raiz
A rota raiz (`/`) SHALL renderizar uma tela inicial própria, em vez de redirecionar diretamente
para `/jogadores`. A tela inicial SHALL mostrar o nome do sistema e uma frase curta descrevendo o
propósito (mercado de jogadores de uma liga de futebol).

#### Scenario: Acessar a raiz mostra a tela inicial
- **WHEN** o usuário acessa `/`
- **THEN** a tela inicial é exibida, sem redirecionamento automático para `/jogadores`

### Requirement: Atalhos de navegação para os quatro módulos
A tela inicial SHALL mostrar quatro cartões de navegação, um para cada módulo do sistema
(Jogadores, Clubes, Partidas, Classificação), cada um com um título, uma descrição curta do que a
tela faz e um ícone ou elemento visual que o diferencie dos demais. Clicar em um cartão SHALL
navegar para a rota do módulo correspondente, sem recarregar a página.

#### Scenario: Cartão de Jogadores leva à listagem de jogadores
- **WHEN** o usuário clica no cartão "Jogadores" na tela inicial
- **THEN** a navegação muda para `/jogadores`, sem recarregar a página

#### Scenario: Os quatro módulos aparecem como cartões distintos
- **WHEN** a tela inicial é exibida
- **THEN** ela mostra quatro cartões, um para cada um de Jogadores, Clubes, Partidas e
  Classificação, cada um com título e descrição próprios

### Requirement: Indicadores rápidos sem nova regra de negócio
A tela inicial PODE mostrar contagens rápidas (ex.: total de jogadores, total de clubes) nos
cartões de Jogadores e Clubes. Quando mostrada, a contagem de jogadores SHALL vir diretamente do
campo de totalização já devolvido por `GET /players` (`meta.total_items`), sem filtro adicional; a
contagem de clubes SHALL vir da quantidade de itens da lista devolvida por `GET /clubs` (que não
pagina), sem nenhum outro cálculo ou agregação feita no frontend.

#### Scenario: Contagem de jogadores vem do total já devolvido pela API
- **WHEN** a tela inicial mostra um número de jogadores no cartão "Jogadores"
- **THEN** esse número é o `meta.total_items` devolvido por `GET /players`, sem soma nem filtro
  adicional calculado na tela

#### Scenario: Contagem de clubes vem da lista devolvida pela API
- **WHEN** a tela inicial mostra um número de clubes no cartão "Clubes"
- **THEN** esse número é a quantidade de itens da lista devolvida por `GET /clubs`, sem nenhum
  cálculo adicional na tela

### Requirement: Navegação lateral continua disponível na tela inicial
A tela inicial SHALL ser renderizada dentro do mesmo `AppShell` (sidebar e navegação) usado pelas
demais telas, mantendo a navegação lateral sempre acessível a partir da tela inicial.

#### Scenario: Sidebar aparece junto com a tela inicial
- **WHEN** a tela inicial é exibida
- **THEN** a sidebar de navegação (Jogadores, Clubes, Partidas, Classificação) continua visível ao
  lado ou acima do conteúdo, igual às demais telas
