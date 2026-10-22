## Purpose

Define os fluxos de compra e venda de jogadores, o histórico de transações do clube com filtros e
totais, e a exportação em CSV, conforme F06 e F08–F11 do barema. Depende da capability de backend
`mercado` para os campos, cálculos e regras de negócio que essas telas consomem, e de
`frontend-conventions` para as regras transversais.

## ADDED Requirements

### Requirement: Compra de jogador livre (F06)
A partir da lista de jogadores livres, a tela SHALL oferecer um fluxo de compra com escolha do
clube e do fim da fidelidade (data e hora, interpretados no horário de Brasília e enviados no
formato `-03:00`), com confirmação antes do `POST /players/{id}/buy`. Depois da compra, a tela
SHALL mostrar o valor, a taxa, o custo total (valor + taxa), o fim da fidelidade e o novo caixa do
clube; a lista de jogadores SHALL passar a mostrar o clube do jogador comprado, o filtro por esse
clube SHALL encontrá-lo, e o filtro "só livres" SHALL deixar de mostrá-lo — tudo sem recarregar a
página.

#### Scenario: Compra concluída mostra o resultado completo
- **WHEN** uma compra é concluída com sucesso
- **THEN** a tela mostra valor, taxa, custo total, fim da fidelidade e o novo caixa do clube,
  todos vindos da resposta da API

#### Scenario: Depois da compra, o filtro por clube encontra o jogador
- **WHEN** o usuário filtra a lista de jogadores pelo clube que acabou de comprar um jogador
- **THEN** o jogador comprado aparece no resultado filtrado

#### Scenario: Depois da compra, o filtro "só livres" não mostra mais o jogador
- **WHEN** o usuário aplica o filtro "só livres" depois da compra
- **THEN** o jogador comprado não aparece mais nesse filtro

#### Scenario: Recusa de compra por regra de negócio não é bloqueada na tela
- **WHEN** uma compra é recusada pela API com `409` (limite de 50% do caixa, elenco cheio ou
  recompra do próprio clube)
- **THEN** a tela envia o pedido normalmente e mostra o `message` devolvido pela API, sem bloquear
  o envio antecipadamente

### Requirement: Venda de jogador (F08)
A página do clube SHALL oferecer um botão Vender em cada jogador do elenco, com confirmação antes
do `POST /players/{id}/sell` (sem corpo). Depois da venda, a tela SHALL mostrar o valor de compra,
o valor de venda, os dias restantes, a multa, o lucro, a comissão, o crédito e o novo caixa do
clube.

#### Scenario: Venda com fidelidade cumprida mostra contrato encerrado sem multa
- **WHEN** o jogador vendido já tinha a fidelidade cumprida no momento da venda
- **THEN** a tela mostra multa 0,00 e o contrato como encerrado, conforme a resposta da API

#### Scenario: Venda com fidelidade pendente mostra multa e contrato rescindido
- **WHEN** o jogador vendido ainda tinha dias restantes de fidelidade
- **THEN** a tela mostra a multa calculada pela API e o contrato como rescindido

#### Scenario: Recusa de venda não é bloqueada na tela
- **WHEN** uma venda é recusada pela API com `409` (jogador sem clube)
- **THEN** a tela envia o pedido normalmente e mostra o `message` devolvido pela API

### Requirement: Histórico de transações com filtros (F09)
A página do clube SHALL mostrar uma aba de histórico (`GET /clubs/{id}/transactions`) com data e
hora (horário de Brasília), tipo (compra ou venda), jogador, valor, taxa ou comissão, multa, lucro
e a variação do caixa com sinal ("+" para entrada e "-" para saída). A tela SHALL oferecer filtro
por um ou mais tipos e por jogador (escolhido entre os jogadores que aparecem no histórico do
clube); quando a API recusar o filtro (ex.: jogador excluído logicamente), a tela SHALL mostrar o
`message` dela.

#### Scenario: Histórico combina filtro de tipo e de jogador
- **WHEN** o usuário filtra o histórico por tipo "Venda" e por um jogador específico
- **THEN** a tabela mostra só as transações que atendem aos dois filtros combinados

#### Scenario: Filtro por jogador excluído mostra o message da API
- **WHEN** o usuário filtra o histórico por um jogador que foi excluído logicamente
- **THEN** a tela mostra o `message` devolvido pela API quando ela recusar o filtro com `404`

#### Scenario: Histórico sem transações mostra o estado de lista vazia
- **WHEN** a aba de histórico de um clube sem compras nem vendas é aberta
- **THEN** a tela mostra o estado de lista vazia definido em `frontend-conventions`

### Requirement: Totais do histórico respeitando o filtro (F10)
Abaixo da tabela de histórico, a tela SHALL mostrar os totais do `summary` devolvido pela API —
total pago em compras, total recebido em vendas, total de taxas e comissões, total de multas e
lucro total — sempre refletindo o filtro de tipo e de jogador aplicado, sem somar ou recalcular
esses totais na tela.

#### Scenario: Totais mudam ao aplicar filtro de tipo
- **WHEN** o usuário aplica o filtro "só vendas" no histórico
- **THEN** os totais exibidos passam a ser os do `summary` devolvido pela API para esse filtro, com
  o total pago em compras em 0,00

### Requirement: Exportação do histórico em CSV (F11)
A aba de histórico SHALL oferecer um botão Exportar CSV que baixa o arquivo devolvido por
`GET /clubs/{id}/transactions/export`, aplicando os mesmos filtros de tipo e de jogador que estão
ativos na tela.

#### Scenario: Exportar com filtro de tipo aplicado
- **WHEN** o usuário aplica o filtro "só vendas" e clica em Exportar CSV
- **THEN** o arquivo baixado é pedido com `type=VENDA`, refletindo o filtro ativo na tela
