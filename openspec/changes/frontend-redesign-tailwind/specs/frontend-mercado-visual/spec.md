## Purpose

Define o redesign visual dos modais de compra e de venda de jogador sobre a base de
`frontend-design-system`, sem alterar nenhum requisito funcional já coberto por `F06` e `F08` em
`frontend-especificacao-inicial`.

## ADDED Requirements

### Requirement: Modal de compra com resultado destacado em cartão de sucesso (F06)
O modal de compra SHALL usar o componente de modal de `frontend-design-system`. O resultado da
compra (valor, taxa, custo total, fim da fidelidade e novo caixa do clube) SHALL aparecer como uma
lista de campo/valor dentro de um cartão com indicação visual de sucesso (ex.: borda ou ícone
verde), em vez de uma lista de definição sem destaque.

#### Scenario: Resultado da compra aparece em cartão de sucesso
- **WHEN** uma compra é concluída com sucesso
- **THEN** o modal mostra valor, taxa, custo total, fim da fidelidade e novo caixa dentro de um
  cartão com indicação visual de sucesso

### Requirement: Modal de venda com resultado destacado em cartão de sucesso (F08)
O modal de venda SHALL usar o componente de modal de `frontend-design-system`. O resultado da venda
(valor de compra, valor de venda, dias restantes, multa, lucro, comissão, crédito e novo caixa)
SHALL aparecer como uma lista de campo/valor dentro de um cartão com indicação visual de sucesso,
igual ao padrão usado no resultado da compra.

#### Scenario: Resultado da venda usa o mesmo padrão visual do resultado da compra
- **WHEN** o resultado da compra e o resultado da venda são comparados
- **THEN** os dois usam o mesmo cartão de sucesso e a mesma lista de campo/valor, com os campos
  próprios de cada operação
