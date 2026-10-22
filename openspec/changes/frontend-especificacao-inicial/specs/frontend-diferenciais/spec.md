## Purpose

Cobre os diferenciais de interface do frontend (barema, seção F5) que não são regra de negócio de
nenhum módulo: responsividade em 375px, testes automatizados e os comandos de lint/formatação
informados no README do frontend.

## ADDED Requirements

### Requirement: Responsividade em 375px sem rolagem horizontal da página (F5)
A lista de jogadores e a página do clube (incluindo a aba de histórico de transações) SHALL
funcionar em 375px de largura sem rolagem horizontal da página inteira; tabelas internas podem
rolar dentro do próprio quadro. Todas as ações dessas telas SHALL continuar acessíveis nessa
largura.

#### Scenario: Lista de jogadores em 375px não tem rolagem horizontal da página
- **WHEN** a lista de jogadores é aberta numa janela de 375px de largura
- **THEN** a página não tem rolagem horizontal, e os filtros, a busca e as ações de cada linha
  continuam acessíveis

#### Scenario: Página do clube em 375px não tem rolagem horizontal da página
- **WHEN** a página do clube, com a aba de histórico aberta, é vista numa janela de 375px de
  largura
- **THEN** a página não tem rolagem horizontal; a tabela de histórico pode rolar dentro do próprio
  quadro

### Requirement: Testes automatizados do frontend (F5)
O comando de testes do frontend informado no README SHALL terminar sozinho, sem modo de
observação, em até 10 minutos, sem falhas, com pelo menos um teste de componente ou de ponta a
ponta.

#### Scenario: Comando de testes termina com sucesso
- **WHEN** o comando de testes do frontend informado no README é executado
- **THEN** ele termina sozinho, sem falhas, com pelo menos um teste de componente ou de ponta a
  ponta reportado

### Requirement: Comandos de lint e de verificação de formatação do frontend (F5)
O README SHALL informar um comando de lint do frontend que termina sem erros quando o código está
conforme, e um comando de verificação de formatação, distinto do comando que formata: o comando de
verificação SHALL apenas conferir se os arquivos já estão formatados, sem alterar nenhum arquivo no
processo.

#### Scenario: Comando de lint termina sem erros
- **WHEN** o comando de lint informado no README é executado sobre o código atual do frontend
- **THEN** o comando termina com código de saída `0`, sem relatar nenhum erro

#### Scenario: Comando de verificação de formatação não altera arquivos
- **WHEN** o comando de verificação de formatação informado no README é executado sobre o código já
  formatado
- **THEN** o comando termina com código de saída `0` e nenhum arquivo do repositório é alterado
