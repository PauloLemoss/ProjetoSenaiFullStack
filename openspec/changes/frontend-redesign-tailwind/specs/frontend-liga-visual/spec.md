## Purpose

Define o redesign visual da tela de partida (criação, placar e duelos) e da classificação sobre a
base de `frontend-design-system`, sem alterar nenhum requisito funcional já coberto por `F13` e
`F14` em `frontend-especificacao-inicial`.

## ADDED Requirements

### Requirement: Resultado da partida com placar em destaque e duelos em cartão (F13)
O resultado de uma partida (mandante, visitante, placar e resultado) SHALL mostrar o placar em
destaque tipográfico maior que o restante da tela, com os nomes do mandante e do visitante ao lado
de cada marcador. Os seis duelos SHALL aparecer numa tabela ou lista de cartões, cada um mostrando
claramente o atacante, o defensor e se houve gol.

#### Scenario: Placar aparece em destaque tipográfico
- **WHEN** o resultado de uma partida é exibido
- **THEN** os números do placar aparecem em tamanho de fonte maior que os demais textos da tela,
  com o nome de cada clube ao lado do seu marcador

#### Scenario: Duelo com gol é destacado visualmente
- **WHEN** um dos seis duelos resulta em gol
- **THEN** esse duelo aparece com um destaque visual (ex.: ícone ou cor) que o diferencia dos duelos
  sem gol

### Requirement: Histórico de partidas e classificação com tabela estilizada (F14)
O histórico de partidas e a tela de classificação SHALL usar o componente de tabela com visual de
cartão de `frontend-design-system`. Na classificação, a primeira coluna (posição) SHALL ter
destaque visual sutil para as primeiras posições (ex.: borda ou cor de fundo diferenciada nas
primeiras linhas), sem alterar a ordem devolvida pela API.

#### Scenario: Primeiras posições da classificação têm destaque visual sutil
- **WHEN** a tela de classificação é exibida
- **THEN** as primeiras linhas da tabela (conforme a ordem devolvida pela API) têm um destaque
  visual sutil que as diferencia das demais, sem reordenar os dados
