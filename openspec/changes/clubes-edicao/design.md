## Context

`backend/src/mercado_jogadores/clubes/` já segue Router → Service (`ClubeService`) → Repository
(`ClubeRepository`, Protocol + implementação SQLAlchemy), com a validação de formato de
`name`/`acronym` e a correspondência sigla↔nome vivendo no schema `ClubeCreate`
(`clubes/schemas.py`) como função pura (`sigla_corresponde_ao_nome` em `clubes/validacao.py`), e as
regras que dependem de persistência (unicidade, limite de clubes) no `ClubeService.cadastrar`
(`clubes/service.py`). Ver `proposal.md` para a motivação.

## Goals / Non-Goals

**Goals:**
- Reaproveitar a validação de formato e de correspondência sigla↔nome já escrita para o cadastro,
  sem duplicar a lógica.
- Garantir que editar um clube sem mudar nome/sigla não falhe por "duplicidade consigo mesmo".

**Non-Goals:**
- Não adiciona exclusão de clube — a política de nunca deletar continua.
- Não permite editar `cash` nem o elenco por este endpoint.
- Não muda nenhum outro endpoint ou capability já existente.

## Decisions

### Schema de edição reaproveita os validadores do `ClubeCreate`
`ClubeCreate` já tem `name`/`acronym` com os validadores de formato (`_validar_nome_de_clube`,
`_validar_formato_basico_da_sigla`) e o `model_validator` de correspondência sigla↔nome. Como os
campos de edição são exatamente os mesmos do cadastro, a forma mais simples de não duplicar a
validação é fazer `ClubeUpdate` herdar de `ClubeCreate` (sem campos novos, só reaproveitando
herança), ou extrair os dois `field_validator` e o `model_validator` para funções/mixins
compartilhados entre `ClubeCreate` e um novo `ClubeUpdate`. Qualquer uma das duas é aceitável; a
tarefa de implementação decide qual é mais direta no código atual.

**Alternativa considerada:** copiar os validadores para um novo schema `ClubeUpdate` independente.
Rejeitada por duplicar regra de validação (RN10) em dois lugares, o que o próprio critério de
qualidade do backend do projeto já evita em outras capabilities.

### Unicidade excluindo o próprio clube: comparar o id do clube encontrado, não um método de repositório novo
`ClubeService.editar` chama os mesmos métodos já existentes (`obter_por_nome_normalizado`,
`obter_por_sigla`); se um deles encontrar um clube, o service só levanta `ConflitoError` quando o id
desse clube encontrado for diferente do id do clube sendo editado. Não precisa de um método novo no
`ClubeRepository` (`ClubeRepository` continua só com os métodos que já tem).

**Alternativa considerada:** adicionar `obter_por_nome_normalizado_exceto(nome, id)` e equivalente
para sigla no repositório. Rejeitada por ser complexidade extra no Protocol e na implementação
SQLAlchemy para um filtro que o service já consegue fazer comparando o id em memória — a tabela de
clubes tem no máximo 20 linhas (RN10), então não há preocupação de performance em buscar primeiro e
comparar depois.

### `PUT`, não `PATCH`: os dois campos são obrigatórios juntos
Segue a mesma convenção já usada em `PUT /players/{id}` (que exige os quatro campos editáveis juntos
mesmo que só um mude), em vez de um `PATCH` parcial. Mantém o padrão de edição consistente entre as
duas entidades que agora suportam edição.

## Risks / Trade-offs

- [Risco] Esquecer de excluir o próprio clube na checagem de unicidade faria qualquer edição que não
  muda nome/sigla falhar com `409` → Mitigação: o cenário "Salvar sem mudar nome e sigla não é
  recusado por duplicidade consigo mesmo" cobre exatamente esse caso; a tarefa de implementação deve
  ter um teste de unidade específico para ele antes de considerar a tarefa concluída.
- [Trade-off] Reaproveitar `ClubeCreate` via herança para `ClubeUpdate` acopla os dois schemas — se o
  cadastro ganhar um campo que a edição não deveria ter, alguém precisa lembrar de não herdar esse
  campo. Aceito, dado que hoje os dois schemas têm exatamente os mesmos dois campos e a alternativa
  (duplicar os validadores) já foi rejeitada acima.
