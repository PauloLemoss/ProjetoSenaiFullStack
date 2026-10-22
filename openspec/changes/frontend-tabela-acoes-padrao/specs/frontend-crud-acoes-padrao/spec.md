## Purpose

Define o padrão de ações de Editar/Excluir pedido pelo usuário para telas de listagem, aplicado às
entidades cuja API suporta essas operações: jogadores (edição e exclusão, `PUT`/`DELETE
/players/{id}`) e clubes (só edição, `PUT /clubs/{id}` de `clubes-edicao`).

> Nota: o pedido original descrevia esse padrão como universal, para todas as listagens (Partidas e
> Classificação inclusas, além do histórico de transações). Essas outras entidades não têm e não vão
> ganhar endpoint de edição nem de exclusão nesta change — partidas e transações são logs imutáveis
> (RN17, RN20); classificação é uma view calculada, sem identidade própria. Mudar isso contrariaria
> regra de negócio fechada pelo enunciado do desafio — ver `design.md`. Por isso os requisitos
> abaixo cobrem só jogadores e clubes.

## ADDED Requirements

### Requirement: Ícones de Editar, Alterar condição e Excluir sempre visíveis na tabela de jogadores
A tabela de jogadores SHALL mostrar, numa coluna final fixa, um ícone de Editar, um ícone de Alterar
condição e um ícone de Excluir para cada linha, sem exigir abrir um menu para alcançá-los. O ícone
de Excluir SHALL aparecer só nas linhas de jogador livre (`club_id` nulo); nas linhas de jogador com
clube, o espaço do ícone de Excluir SHALL ficar vazio ou desabilitado, nunca escondido atrás de um
menu. A ação "Detalhes" continua no menu "..." (não faz parte deste padrão).

#### Scenario: Editar, Alterar condição e Excluir aparecem sem abrir menu
- **WHEN** a tabela de jogadores termina de carregar
- **THEN** cada linha mostra os ícones de Editar e de Alterar condição visíveis diretamente na
  coluna de ações, sem precisar clicar em nenhum menu para vê-los

#### Scenario: Excluir não aparece para jogador com clube
- **WHEN** um jogador tem `club_id` não nulo
- **THEN** a linha dele não mostra o ícone de Excluir ativo (fica ausente ou desabilitado)

### Requirement: Edição carrega o formulário preenchido e não navega para outra tela
Clicar no ícone de Editar SHALL abrir o formulário de edição já preenchido com os dados atuais do
jogador (nome, posição, agilidade, idade). Salvar com sucesso SHALL fechar o formulário e atualizar
a mesma tabela de jogadores de onde a edição foi aberta, sem navegar para nenhuma outra rota.

#### Scenario: Formulário de edição abre preenchido
- **WHEN** o usuário clica em Editar num jogador chamado "João Silva", 24 anos
- **THEN** o formulário abre com "João Silva" e 24 já preenchidos nos campos de nome e idade

#### Scenario: Salvar a edição atualiza a listagem sem navegar
- **WHEN** o usuário salva uma edição com sucesso
- **THEN** o formulário fecha, a tabela de jogadores mostra o dado atualizado, e a URL continua a
  mesma (a listagem de jogadores)

### Requirement: Alterar condição abre o formulário sem navegar, com a transição recusada já impedida
Clicar no ícone de Alterar condição SHALL abrir o formulário já com a condição atual do jogador
selecionada. Salvar com sucesso SHALL fechar o formulário e atualizar a mesma tabela de jogadores,
sem navegar para nenhuma outra rota. A transição direta de `DOENTE` para `APTO` (RN08) continua
impedida no cliente antes do envio, mostrando o motivo junto ao campo, como já é hoje.

#### Scenario: Formulário de condição abre com o valor atual selecionado
- **WHEN** o usuário clica no ícone de Alterar condição de um jogador `MAL_CONDICIONADO`
- **THEN** o formulário abre com "Mal condicionado" já selecionado

#### Scenario: Salvar a alteração atualiza a listagem sem navegar
- **WHEN** o usuário salva uma alteração de condição com sucesso
- **THEN** o formulário fecha e a tabela de jogadores mostra a condição nova, sem navegar para
  outra rota

### Requirement: Exclusão nunca é imediata e mostra o motivo quando recusada
Clicar no ícone de Excluir SHALL sempre abrir uma confirmação antes de excluir — nunca excluir
direto no clique. Se a API recusar a exclusão por qualquer motivo (ex.: o jogador passou a ter
vínculo com um clube entre o carregamento da tabela e o clique), a confirmação SHALL mostrar a
mensagem de erro devolvida pela API, sem fechar sozinha.

#### Scenario: Clique em Excluir abre confirmação, não exclui direto
- **WHEN** o usuário clica no ícone de Excluir de um jogador livre
- **THEN** uma confirmação aparece perguntando se ele quer mesmo excluir, e nenhuma chamada
  `DELETE` é feita antes de ele confirmar

#### Scenario: Recusa da API aparece como mensagem clara
- **WHEN** o usuário confirma a exclusão e a API recusa (ex.: `409`)
- **THEN** a confirmação mostra o `message` devolvido pela API, sem fechar sozinha, permitindo o
  usuário cancelar a ação

### Requirement: Ícone de Editar sempre visível na tabela de clubes, sem ícone de Excluir
A tabela de clubes SHALL mostrar, numa coluna final fixa, um ícone de Editar para cada linha, sem
exigir abrir um menu para alcançá-lo. A tabela de clubes SHALL NOT mostrar nenhum ícone de Excluir —
a exclusão de clube não existe no sistema (política de nunca deletar um clube).

#### Scenario: Editar aparece sem abrir menu
- **WHEN** a tabela de clubes termina de carregar
- **THEN** cada linha mostra o ícone de Editar visível diretamente na coluna de ações, sem precisar
  clicar em nenhum menu para vê-lo

#### Scenario: Nenhum ícone de Excluir aparece
- **WHEN** a tabela de clubes é exibida
- **THEN** nenhuma linha mostra um ícone ou botão de excluir clube

### Requirement: Edição de clube carrega o formulário preenchido e não navega para outra tela
Clicar no ícone de Editar de um clube SHALL abrir o formulário de edição já preenchido com o `name`
e o `acronym` atuais do clube. Salvar com sucesso SHALL fechar o formulário e atualizar a mesma
tabela de clubes de onde a edição foi aberta, sem navegar para nenhuma outra rota. Se a API recusar
a edição (nome ou sigla duplicados, ou sigla que não corresponde ao novo nome), a mensagem de erro
devolvida SHALL aparecer junto ao formulário, que permanece aberto com os dados digitados.

#### Scenario: Formulário de edição de clube abre preenchido
- **WHEN** o usuário clica em Editar num clube chamado "Águias FC", sigla "AGU"
- **THEN** o formulário abre com "Águias FC" e "AGU" já preenchidos

#### Scenario: Salvar a edição atualiza a listagem sem navegar
- **WHEN** o usuário salva uma edição de clube com sucesso
- **THEN** o formulário fecha, a tabela de clubes mostra o nome/sigla atualizados, e a URL continua a
  mesma (a listagem de clubes)

#### Scenario: Recusa da API aparece junto ao formulário
- **WHEN** o usuário tenta salvar um nome que já pertence a outro clube
- **THEN** o formulário continua aberto, mostrando o `message` devolvido pela API, sem perder os
  dados digitados
