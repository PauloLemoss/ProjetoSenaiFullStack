## Why

O usuário trouxe um roteiro de boas práticas de interface para telas de Cadastro/Visualização/
Edição/Exclusão (CRUD) e pediu para avaliar o que se aplica ao frontend já implementado
(`frontend-especificacao-inicial`, `frontend-redesign-tailwind`). A maior parte do roteiro já é
atendida pelo que existe hoje (ver análise abaixo); um ponto é uma lacuna real, de baixo risco e
alto valor, que esta change formaliza como requisito. Os demais pontos do roteiro foram avaliados e
descartados — alguns por já estarem cobertos ou por critério técnico, e a confirmação de
cancelamento por decisão explícita do usuário — com o motivo registrado em `design.md`, em vez de
implementados sem critério.

### O que já está conforme (sem mudança necessária)
- Botão de criar visível sem rolagem: "Novo jogador" e "Novo clube" já ficam no topo da tela
  (`PageHeader`), antes de qualquer conteúdo.
- Estado vazio claro: `DataTable` já mostra texto explícito ("Nenhum jogador encontrado.", etc.), não
  um erro genérico.
- Campo não editável com nota explicando o motivo: `PlayerEditModal` já mostra a dica "Jogador tem
  clube: a posição não pode ser alterada." quando o campo é desabilitado.
- Exclusão com confirmação e um único verbo ("Excluir") em todo o sistema: já é o padrão.
- Ordenação prévia da lista com a lógica adequada ao dado, e distinção clara entre busca (preenche a
  lista a partir do texto digitado) e filtro (restringe a lista já carregada): já é o comportamento
  das telas de lista.
- Navegação por teclado (Tab/Shift+Tab na ordem visual, Enter enviando o formulário a partir de
  qualquer campo de texto): já é o comportamento nativo do HTML nos formulários existentes, sem
  necessidade de `tabindex` customizado.

### Lacuna real, coberta por esta change
- **Paginação sem atalho para primeira/última página**: a listagem de jogadores só tem
  "Anterior"/"Próxima"; com várias páginas, ir da primeira à última exige clicar várias vezes.

### Pontos do roteiro avaliados e descartados (ver `design.md` para o raciocínio completo)
- Transformar os formulários de cadastro/edição em páginas inteiras com etapas, barra de progresso e
  rascunho salvo: os formulários atuais (até 11 campos, sem lógica entre etapas) não cruzam o limiar
  de complexidade que o próprio roteiro usa para recomendar isso, e mudar a arquitetura arriscaria
  regressão nos testes e no roteiro de correção do barema, que já valida o fluxo em modal.
- Ocultar colunas secundárias da tabela em telas pequenas: o projeto já tem uma solução aceita e
  cobrada pelo barema (F5) para 375px — rolagem horizontal só da tabela, sem rolagem da página — que
  cobre a mesma necessidade sem redesenhar as colunas por tela.
- Botão "Desfazer" depois de excluir: exigiria um endpoint de restauração no backend que não existe
  e não está previsto no enunciado do desafio; adicionar essa regra está fora do escopo desta change
  de frontend.
- **Confirmação ao cancelar formulário com dados digitados**: era uma lacuna real do roteiro, mas o
  usuário decidiu explicitamente não adicionar esse comportamento — não entra nesta change.

## What Changes

- Atalhos de ir para a primeira e a última página na listagem de jogadores, quando houver mais de 2
  páginas.
- Nenhuma regra de negócio, campo, endpoint ou validação de servidor muda — é só comportamento de
  interface.

## Capabilities

### New Capabilities
- `frontend-crud-usabilidade`: atalhos de primeira/última página na listagem de jogadores.

### Modified Capabilities
(nenhuma — as capabilities funcionais de `frontend-especificacao-inicial` não mudam; esta change só
adiciona comportamento de usabilidade por cima delas)

## Impact

- `frontend/src/features/jogadores/JogadoresPage.jsx` (paginação)
- Nenhum código de `backend/` é afetado.
