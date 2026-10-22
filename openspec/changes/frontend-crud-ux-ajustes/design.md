## Context

O usuário trouxe um roteiro genérico de boas práticas de CRUD (Create/Read/Update/Delete) e pediu
para avaliar item a item contra o frontend já implementado. Esta seção registra essa avaliação
completa — inclusive dos pontos que **não** viraram requisito — para que a decisão fique rastreável
e não precise ser refeita numa próxima revisão. Ver `proposal.md` para o resumo e os requisitos
cobertos ficam em `specs/frontend-crud-usabilidade/spec.md`.

Stack: React 19 + React Router 7 + Tailwind CSS v4 (ver `frontend-redesign-tailwind` para o design
system de componentes compartilhados já existente: `Modal`, `FormField`, `Button`, `DataTable`).

## Goals / Non-Goals

**Goals:**
- Cobrir a lacuna real identificada (paginação sem atalhos de extremos) na listagem de jogadores.
- Registrar o raciocínio de cada ponto do roteiro que não virou requisito, para a decisão não se
  perder.

**Non-Goals:**
- Não adiciona confirmação ao cancelar formulários — decisão explícita do usuário (ver
  "Cancelamento com confirmação" abaixo), não uma omissão.
- Não transforma nenhum formulário modal em página inteira, nem introduz wizard/etapas, barra de
  progresso ou rascunho salvo (ver "Página vs. Modal" abaixo).
- Não adiciona ocultação de colunas por tamanho de tela nas tabelas (ver "Grid responsivo" abaixo).
- Não adiciona um recurso de "desfazer" exclusão (ver "Desfazer" abaixo).
- Não muda nenhum campo, validação de servidor, endpoint ou regra de negócio.

## Avaliação ponto a ponto do roteiro

### 1. Cadastrar (Create)

- **Botão de criar visível sem rolagem** — já atende: `PageHeader` coloca "Novo jogador"/"Novo
  clube" no topo da tela, antes de qualquer outro conteúdo. Sem ação.
- **Página inteira vs. modal** — o roteiro recomenda página inteira para formulários "complexos e
  longos" e modal para os "simples e curtos". O maior formulário do sistema (cadastro de jogador) tem
  11 campos, todos de um único nível (sem lógica condicional entre eles, sem etapas naturais) e é
  preenchido em menos de um minuto — não cruza o limiar que o próprio roteiro usa para recomendar uma
  página dedicada. Os modais atuais já foram validados pelos testes de integração do projeto e pelo
  roteiro de correção do barema (que grava a tela preenchendo esse modal). Trocar a arquitetura agora
  arrisca regressão sem ganho de usabilidade proporcional. **Decisão: manter modal.**
- **Formulário em etapas, barra de progresso, rascunho** — consequência direta do ponto anterior: só
  faz sentido se o formulário virar página/wizard. **Não aplicável.**
- **Navegação por teclado (tabindex, Tab/Shift+Tab, Enter no último campo salva)** — os formulários
  usam elementos nativos (`<input>`, `<select>`) dentro de `<form onSubmit>`, sem `tabindex`
  customizado; a ordem do DOM já segue a ordem visual, e o Enter em qualquer campo de texto já
  aciona o `submit` nativo do formulário. **Já atende, sem mudança de código.**
- **Cancelamento com confirmação** — era uma lacuna real do roteiro (hoje "Cancelar" fecha o
  formulário direto, descartando dados digitados sem aviso), mas o usuário decidiu explicitamente
  não adicionar esse comportamento. **Decisão do usuário: não implementar.**

### 2. Visualizar (Read)

- **Título visível sem rolar, estado vazio claro ("não há registros")** — `PageHeader` e `DataTable`
  já atendem (`DataTable` mostra "Nenhum jogador encontrado.", "Nenhuma partida encontrada." etc., em
  vez de parecer um erro). Sem ação.
- **Grid com só colunas essenciais, dados complementares numa tela de detalhes** — já é o padrão: a
  tabela de jogadores mostra os indicadores e joga nome completo/posição por extenso para dentro da
  célula "Jogador" (avatar + subtítulo), e o modal de Detalhes cobre o resto. Sem ação.
- **Ocultar colunas secundárias em telas pequenas, mostrar mais em monitores grandes** — o projeto já
  tem uma solução aceita e cobrada pelo barema (F5, 375px): a tabela rola horizontalmente dentro do
  próprio quadro, sem rolar a página inteira. Ocultar colunas por `breakpoint` resolveria o mesmo
  problema de um jeito mais trabalhoso (decidir "o que é secundário" coluna a coluna, manter duas
  versões de cada linha) sem necessidade, já que a solução atual já é aprovada pelo critério de
  correção. **Decisão: não adicionar.**
- **Lista pré-ordenada com lógica adequada ao dado** — já atende: jogadores por nome (padrão),
  clubes por nome/patrimônio, classificação e partidas na ordem devolvida pela API. Sem ação.
- **Paginação com indicação de página atual, total de páginas e atalhos de início/fim; total de
  registros sempre visível** — a listagem de jogadores já mostra "Página X de Y" e "Mostrando N–M de
  T jogadores", mas só tem "Anterior"/"Próxima". Lacuna real; vira requisito ("Atalhos de primeira e
  última página").
- **Busca vs. Filtro** — a distinção do roteiro (buscar preenche a lista a partir do texto digitado;
  filtrar restringe uma lista já carregada) já corresponde ao comportamento implementado: `search`
  busca por nome, e os demais campos (posição, condição, clube, idade, valor) filtram o resultado,
  todos combináveis. Sem ação.

### 3. Editar (Update)

- **Reaproveitar a interface de cadastro, com os campos já preenchidos** — parcialmente aplicável:
  `PlayerEditModal` reaproveita o mesmo componente de campo (`FormField`) e o mesmo padrão visual do
  cadastro, mas mostra só os 4 campos editáveis (nome, posição, agilidade, idade), não os 11 do
  cadastro — isso é uma regra de negócio do enunciado (F04: só esses 4 campos podem ser alterados),
  não uma escolha de interface a revisar. **Já atende, pela regra do domínio.**
- **Campos não editáveis visíveis, bloqueados, com nota do motivo** — já atende: o campo "Posição" em
  `PlayerEditModal` fica desabilitado quando o jogador tem clube, com a dica "Jogador tem clube: a
  posição não pode ser alterada." Sem ação.

### 4. Excluir (Delete)

- **Um único verbo em todo o sistema** — já atende: "Excluir" é o único verbo usado (jogador,
  cancelamento de confirmação, etc.). Sem ação.
- **Confirmação obrigatória antes de excluir** — já atende: `DeletePlayerModal` pergunta "Tem certeza
  que deseja excluir {nome}? Esta ação não pode ser desfeita." antes de confirmar. Sem ação.
- **Feedback de sucesso e botão "Desfazer"** — o feedback de sucesso já existe (mensagem de banner
  depois da exclusão). O "Desfazer" exigiria restaurar um jogador com exclusão lógica já aplicada
  (`excluido_em` preenchido), o que precisa de um endpoint de restauração que não existe no backend e
  não está previsto no enunciado do desafio (RN09 só define a exclusão lógica, não uma reversão).
  Adicionar essa regra está fora do escopo de uma change de frontend, e inventar um comportamento de
  backend não especificado contraria a diretriz do projeto de não propor regra que o enunciado não
  traz. **Decisão: não adicionar "Desfazer" nesta change;** se o usuário quiser, é uma change própria
  que mexe em `backend/`.

## Decisions

### Atalhos de paginação: botões "Primeira"/"Última" ao lado de "Anterior"/"Próxima"
Dois botões adicionais na mesma barra de paginação de `JogadoresPage.jsx`, habilitados/desabilitados
pela mesma lógica que já desabilita "Anterior" na página 1 e "Próxima" na última página. Só os outras
telas de lista (clubes, elenco, histórico de transações, histórico de partidas, classificação) não
usam paginação hoje (mostram a lista inteira) — o requisito cobre só a listagem de jogadores, que é a
única com paginação de verdade no momento.

## Risks / Trade-offs

- [Trade-off] Não ocultar colunas por tamanho de tela mantém uma única versão da tabela para manter,
  ao custo de a rolagem horizontal interna ser menos elegante que colunas ocultas — aceito, dado que
  a solução atual já é a exigida/aprovada pelo critério de correção (F5).
