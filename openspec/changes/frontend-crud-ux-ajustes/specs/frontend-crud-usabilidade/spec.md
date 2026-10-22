## Purpose

Cobre um ajuste de usabilidade na listagem de jogadores, vindo de um roteiro de boas práticas de
interface revisado pelo usuário: atalhos de navegação na paginação. Não altera nenhum campo,
validação de servidor ou regra de negócio das capabilities funcionais já existentes
(`frontend-especificacao-inicial`) — só a navegação entre páginas.

> Nota: o roteiro original também cobria confirmação ao cancelar um formulário com dados não
> salvos; o usuário decidiu explicitamente não incluir esse comportamento (ver `design.md`), por
> isso não há requisito correspondente aqui.

## ADDED Requirements

### Requirement: Atalhos de primeira e última página na listagem de jogadores
A paginação da listagem de jogadores SHALL oferecer, além de "Anterior" e "Próxima", um atalho para
ir diretamente à primeira página e um atalho para ir diretamente à última página, visíveis quando
houver mais de 2 páginas de resultado.

#### Scenario: Atalhos aparecem com mais de 2 páginas
- **WHEN** a listagem de jogadores tem 3 ou mais páginas de resultado
- **THEN** os atalhos de "primeira página" e "última página" aparecem junto a "Anterior"/"Próxima"

#### Scenario: Atalho de última página mostra a última página
- **WHEN** o usuário clica no atalho de última página
- **THEN** a tabela mostra a última página de resultados, e o botão "Próxima" fica desabilitado

#### Scenario: Atalhos não aparecem com 1 ou 2 páginas
- **WHEN** a listagem de jogadores tem no máximo 2 páginas de resultado
- **THEN** os atalhos de primeira/última página não aparecem (ou ficam desabilitados), sem atrapalhar
  a navegação por "Anterior"/"Próxima"
