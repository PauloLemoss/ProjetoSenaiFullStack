# frontend-erros-formulario Specification

## Purpose

Garante que, quando a API recusar um cadastro ou edição por erro de validação, o usuário veja
exatamente qual campo está errado e o que precisa corrigir, em vez de uma mensagem genérica única
que não indica o campo nem a causa.

## Requirements

### Requirement: Mapeamento de erros de campo da API no formulário
Os formulários de cadastro e edição de jogador e de clube SHALL exibir, junto ao campo
correspondente, a mensagem de erro específica devolvida pela API quando a recusa `400` incluir, na
lista `errors` do corpo da resposta, um item cujo `field` corresponda a um campo do formulário —
reaproveitando o mesmo componente de erro junto ao campo já usado pela validação local de um campo
só. Essa mensagem de campo SHALL substituir (não duplicar) qualquer mensagem de erro local já
mostrada naquele campo. Quando um item de `errors` tiver `field: null` (regra que depende de mais
de um campo), ou quando a recusa não tiver `errors` (ex.: `404`/`409`), a tela SHALL continuar
mostrando o `message` da API no aviso geral no topo do formulário — nunca um texto genérico que não
venha da API.

#### Scenario: Erro de faixa de campo aparece junto ao campo no cadastro de jogador
- **WHEN** o usuário tenta cadastrar um jogador com idade 10 e a API recusa com `400`, `errors`
  contendo `{"field": "age", "message": "Idade deve ser um número inteiro de 16 a 45."}`
- **THEN** essa mensagem aparece junto ao campo "Idade" do formulário, no mesmo lugar onde
  apareceria uma mensagem de validação local, e o botão "Salvar" permanece habilitado para nova
  tentativa

#### Scenario: Erro de regra cruzada atribuído a um campo aparece junto a esse campo
- **WHEN** o usuário tenta cadastrar o jogador "Paulo" com atributos técnicos `pace=20,
  shooting=35, passing=89, dribbling=90, defending=5, physical=80` e `potential=80`, e a API
  recusa com `400`, `errors` contendo `{"field": "potential", "message": "O potencial não pode ser
  menor que o maior atributo."}`
- **THEN** essa mensagem aparece junto ao campo "Potencial", e o aviso geral no topo do formulário
  não repete a mesma mensagem genérica de antes ("Dado ou parâmetro inválido.")

#### Scenario: Erro sem campo único aparece no aviso geral, com a mensagem real da API
- **WHEN** o usuário tenta cadastrar um jogador cuja soma dos seis atributos técnicos passa de 480
  e a API recusa com `400`, `errors` contendo um item com `field: null` e a mensagem "A soma dos
  seis atributos não pode passar de 480."
- **THEN** o aviso geral no topo do formulário mostra essa mensagem específica, não um texto
  genérico fixo

#### Scenario: Múltiplos campos com erro no cadastro de clube
- **WHEN** o usuário tenta cadastrar um clube com `name` contendo um dígito e `acronym` com 2
  letras, e a API recusa com `400` e `errors` com um item para `field: "name"` e outro para
  `field: "acronym"`
- **THEN** cada mensagem aparece junto ao campo correspondente ("Nome" e "Sigla"), ao mesmo tempo

#### Scenario: Recusa sem errors por campo continua no aviso geral
- **WHEN** o usuário tenta editar um clube com um nome já usado por outro clube e a API recusa com
  `409` e `message` (sem `errors`)
- **THEN** o aviso geral no topo do formulário mostra esse `message`, como já acontece hoje, sem
  nenhum campo marcado como erro

#### Scenario: Corrigir o campo e reenviar limpa o erro
- **WHEN** o usuário corrige o valor do campo que tinha erro de campo vindo da API e reenvia o
  formulário com sucesso
- **THEN** a mensagem de erro deixa de aparecer junto ao campo e o formulário mostra a confirmação
  de sucesso
