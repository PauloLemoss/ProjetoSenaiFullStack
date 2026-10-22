## Purpose

Define o redesign visual das telas de jogadores (listagem, filtros e os cinco modais) sobre a base
de `frontend-design-system`, sem alterar nenhum requisito funcional já coberto por `F01`–`F04` em
`frontend-especificacao-inicial` (os campos, filtros, validações e chamadas à API continuam os
mesmos — só a aparência muda).

## ADDED Requirements

### Requirement: Barra de ferramentas em pills, com abas de contagem e ordenação (F02)
Os filtros da listagem de jogadores (busca, posição, condição, clube, faixa de idade, faixa de
valor de mercado) SHALL aparecer dentro de um cartão visualmente separado da tabela: a busca como
um campo largo com ícone de lupa, e os demais filtros de valor único (posição, condição, clube)
como dropdowns em formato de "pill" (ícone, texto e seta), em vez dos `<select>`/`<input>` soltos
sem rótulo visível de hoje. Abaixo dos filtros, as abas Todos/Livres/Em clubes SHALL aparecer como
um controle segmentado, cada aba mostrando a quantidade de jogadores que atende aos demais filtros
aplicados, e a ordenação SHALL aparecer como uma pill própria alinhada à direita dessa mesma linha.

#### Scenario: Filtros aparecem em cartão com busca e pills de ícone
- **WHEN** a tela de Jogadores é aberta
- **THEN** o campo de busca aparece largo com um ícone de lupa, e os filtros de posição, condição e
  clube aparecem como pills com ícone e seta, dentro de um cartão distinto da tabela

#### Scenario: Abas mostram a contagem de cada grupo
- **WHEN** 23 jogadores atendem aos filtros aplicados, sendo 7 livres e 16 em clubes
- **THEN** as abas mostram "Todos 23", "Livres 7" e "Em clubes 16", com a aba ativa destacada

#### Scenario: Aba ativa do filtro "Todos/Livres/Em clubes" tem destaque visual
- **WHEN** o usuário seleciona a aba "Livres"
- **THEN** a aba "Livres" aparece com um estilo visualmente distinto das outras duas (ex.: fundo
  preenchido), sem que o filtro de clube pareça apenas "apagado" por estar desabilitado

### Requirement: Tabela de jogadores com avatar, progresso e ações por linha (F01, F03, F04)
A tabela de jogadores SHALL usar o componente de tabela com visual de cartão de
`frontend-design-system`. A coluna "Jogador" SHALL mostrar um avatar com as iniciais do nome, o
nome em negrito e a posição por extenso como subtítulo; a coluna "Agilidade" SHALL usar a barra de
progresso de `frontend-design-system`; a coluna "Clube" SHALL mostrar um selo com a sigla do clube
ao lado do nome. As ações da linha SHALL mostrar um botão "Comprar" visível para jogador livre, e um
menu "..." separado com as demais ações (Detalhes, Editar, Alterar condição e, só para jogador
livre, Excluir), substituindo o elemento `<details>`/`<summary>` sem estilo usado antes; a ação
"Excluir" dentro do menu SHALL usar a cor de perigo definida em `frontend-design-system`.

#### Scenario: Coluna Jogador mostra avatar, nome e posição por extenso
- **WHEN** a tabela de jogadores termina de carregar
- **THEN** cada linha mostra um avatar com as iniciais do jogador, o nome em negrito e a posição por
  extenso (ex.: "Goleiro") como subtítulo

#### Scenario: Botão Comprar aparece fora do menu para jogador livre
- **WHEN** um jogador livre é exibido na tabela
- **THEN** o botão "Comprar" aparece visível na linha, fora do menu "...", e o menu "..." continua
  mostrando as demais ações

#### Scenario: Menu "..." abre como um menu estilizado
- **WHEN** o usuário clica no botão "..." de uma linha da tabela de jogadores
- **THEN** um menu suspenso com sombra e cantos arredondados aparece, listando as ações
  disponíveis para aquele jogador

#### Scenario: Ação Excluir usa a cor de perigo dentro do menu
- **WHEN** o jogador da linha é livre (`club_id` nulo) e o menu "..." é aberto
- **THEN** a opção "Excluir" aparece destacada com a cor de perigo, diferente das demais opções do
  menu

### Requirement: Modais de jogador com visual consistente (F04)
Os modais de cadastro, edição, alteração de condição, exclusão e detalhes de jogador SHALL usar o
componente de modal de `frontend-design-system`, com os campos organizados em grade responsiva
(mais de uma coluna em telas largas, uma coluna em telas estreitas) no cadastro e na edição. O
modal de confirmação de exclusão SHALL usar o botão de perigo para a ação de confirmar.

#### Scenario: Modal de cadastro organiza os campos em grade
- **WHEN** o modal de cadastro de jogador é aberto numa tela larga
- **THEN** os sete indicadores e os demais campos aparecem organizados em mais de uma coluna,
  dentro do cartão do modal

#### Scenario: Confirmação de exclusão usa o botão de perigo
- **WHEN** o modal de confirmação de exclusão de um jogador livre é aberto
- **THEN** o botão que confirma a exclusão usa o estilo de botão de perigo (cor vermelha)
