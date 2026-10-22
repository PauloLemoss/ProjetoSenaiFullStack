## Purpose

Define o redesign visual das telas de clubes (listagem, criação, página do clube com indicadores
financeiros, elenco, histórico de transações e escalação) sobre a base de
`frontend-design-system`, sem alterar nenhum requisito funcional já coberto por `F05`, `F07`,
`F09`–`F12` em `frontend-especificacao-inicial`.

## ADDED Requirements

### Requirement: Listagem de clubes com tabela de cartão e criação em destaque (F05)
A listagem de clubes SHALL usar o componente de tabela com visual de cartão de
`frontend-design-system`. O botão de criar clube SHALL ter destaque visual de botão primário,
posicionado de forma consistente com o botão "Novo jogador" da listagem de jogadores.

#### Scenario: Botão de criar clube tem o mesmo destaque do botão de novo jogador
- **WHEN** a listagem de clubes e a listagem de jogadores são comparadas
- **THEN** o botão "Novo clube" e o botão "Novo jogador" usam o mesmo estilo de botão primário, na
  mesma posição relativa da tela

### Requirement: Indicadores financeiros do clube como cartões de destaque (F07)
A página do clube SHALL mostrar caixa, valor do elenco e patrimônio como cartões de indicador
visualmente destacados (rótulo pequeno acima, valor em destaque tipográfico maior), lado a lado em
telas largas e empilhados em telas estreitas, em vez de texto corrido.

#### Scenario: Indicadores aparecem como cartões lado a lado em tela larga
- **WHEN** a página do clube é aberta numa tela larga
- **THEN** caixa, valor do elenco e patrimônio aparecem em três cartões lado a lado, cada um com
  rótulo e valor visualmente destacados

#### Scenario: Indicadores empilham em tela estreita sem rolagem horizontal
- **WHEN** a página do clube é aberta numa janela de 375px de largura
- **THEN** os três cartões de indicador empilham verticalmente, sem causar rolagem horizontal da
  página

### Requirement: Elenco e histórico de transações com tabela estilizada e totais destacados (F07, F09, F10)
O elenco do clube e o histórico de transações SHALL usar o componente de tabela com visual de
cartão de `frontend-design-system`, incluindo o botão "Vender" com a cor de perigo nas linhas do
elenco. Os totais do `summary` do histórico de transações SHALL aparecer em um cartão de resumo
visualmente separado da tabela, abaixo dela.

#### Scenario: Botão Vender usa a cor de perigo
- **WHEN** o elenco do clube é exibido
- **THEN** o botão "Vender" de cada linha usa o estilo de botão de perigo

#### Scenario: Totais do histórico aparecem em cartão de resumo separado
- **WHEN** o histórico de transações do clube é exibido com um filtro aplicado
- **THEN** os totais do `summary` aparecem num cartão visualmente separado da tabela, refletindo o
  filtro aplicado

### Requirement: Escalação com seleção visual de vagas e aviso de incompleta destacado (F12)
A escalação de titulares SHALL organizar a formação e as vagas (goleiro e jogadores de linha) em
um layout de cartão único, com cada vaga claramente rotulada pelo tipo de posição. Quando a
escalação estiver incompleta, o aviso de que o clube não pode jogar SHALL aparecer com destaque
visual de alerta (cor e ícone de aviso), não apenas texto simples.

#### Scenario: Aviso de escalação incompleta tem destaque visual de alerta
- **WHEN** a escalação do clube está incompleta
- **THEN** o aviso "este clube não pode jogar" aparece com cor e destaque visual de alerta,
  perceptível à primeira vista
