## Purpose

Define as regras de qualidade de código, usabilidade e feedback que valem para **todas** as telas
do frontend (`frontend/`), independente do módulo (jogadores, clubes, mercado ou liga), conforme
F2 (qualidade do código) e F3 (usabilidade e feedback) do barema e a seção "🖥️ Frontend" do
enunciado. Depende das capabilities de backend para os campos, formatos e códigos de erro que a
tela consome.

## ADDED Requirements

### Requirement: Camada de serviço de API própria
Toda chamada à API REST (`/api/v1`) SHALL passar por uma camada própria do frontend (serviço,
cliente HTTP ou hooks de dados). Nenhum componente de tela, de lista, de formulário ou de outro
tipo SHALL chamar `fetch`, Axios ou equivalente diretamente (F2 "Acesso à API").

#### Scenario: Nenhum componente chama a API diretamente
- **WHEN** o código-fonte do frontend é inspecionado por busca de texto por `fetch(` e por
  chamadas de Axios fora da camada de serviço
- **THEN** nenhuma dessas chamadas aparece dentro de um componente React de tela

#### Scenario: Camada de serviço cobre os 4 módulos
- **WHEN** o código-fonte do frontend é inspecionado
- **THEN** existe uma camada de serviço/cliente/hooks com funções para jogadores, clubes, mercado
  (compra, venda, histórico, export) e liga (escalação, partidas, classificação), e todas as telas
  desses módulos usam essas funções para acessar a API

### Requirement: Componentes reutilizáveis sem duplicação entre telas
Tabela, formulário e mensagens de sucesso/erro SHALL ser implementados como componentes
compartilhados e reutilizados entre as telas; o mesmo trecho de marcação e lógica (cabeçalho e
linhas com os estados de carregamento/vazio/erro; campo com rótulo e mensagem de erro; aviso de
sucesso e de erro) SHALL não aparecer duplicado em duas ou mais telas em vez de vir de um
componente compartilhado (F2 "Componentes"). Usar o mesmo componente com colunas ou campos
diferentes não conta como duplicação.

#### Scenario: Tabela de lista é um componente único reaproveitado
- **WHEN** as 6 telas de lista (jogadores, clubes, elenco do clube, histórico de transações,
  histórico de partidas, classificação) são inspecionadas
- **THEN** todas usam o mesmo componente de tabela/lista, com colunas diferentes, em vez de cada
  uma reimplementar cabeçalho e estados de carregamento/vazio/erro

#### Scenario: Campo de formulário com mensagem de erro é um componente único
- **WHEN** os 7 formulários (cadastro de jogador, edição de jogador, alteração de condição,
  criação de clube, compra, escalação, nova partida) são inspecionados
- **THEN** todos usam o mesmo componente de campo com rótulo e mensagem de erro, em vez de cada
  formulário reimplementar essa marcação

### Requirement: Atualização de dados sem recarregar a página, sem recalcular regra de negócio
Depois de cada uma das 9 ações (cadastrar, editar e alterar a condição de um jogador; excluir;
criar clube; comprar; vender; escalar; jogar partida), a tela afetada SHALL mostrar os dados
atualizados devolvidos pela API, sem recarregar a página (F2 "Atualização e regras"). Nenhuma regra
de negócio que a API calcula — valor base, valor de mercado, overall, taxa, multa, comissão, lucro,
crédito, valor do elenco, patrimônio, dias restantes, percentual de multa, totais do `summary`,
placar, duelos ou classificação — SHALL ser recalculada na tela; somar valor e taxa para mostrar o
custo total de uma compra é a única soma permitida.

#### Scenario: Compra atualiza a lista de jogadores sem reload
- **WHEN** uma compra é concluída com sucesso
- **THEN** a lista de jogadores livres e a página do clube comprador mostram os dados novos (clube
  do jogador, caixa) sem a página recarregar

#### Scenario: Custo total soma valor e taxa, sem recalcular os demais valores
- **WHEN** a tela mostra o resultado de uma compra
- **THEN** o custo total exibido é a soma do `value` com o `fee` devolvidos pela API; nenhum outro
  valor (taxa, valor de mercado) é recalculado na tela

#### Scenario: Jogar partida atualiza o histórico e a classificação sem reload
- **WHEN** uma partida é jogada com sucesso
- **THEN** o histórico de partidas e a classificação mostram a partida nova sem a página recarregar

### Requirement: Validação de um campo só nos 7 formulários antes do envio
Os 7 formulários (cadastro de jogador, edição de jogador, alteração de condição, criação de clube,
compra, escalação, nova partida) SHALL validar, antes de enviar à API, os campos obrigatórios de
cada um e os limites de um campo só: tamanho de texto (nome do jogador de 3 a 100 caracteres, nome
do clube de 3 a 60, sigla do clube com 3 letras) e faixas numéricas de um campo isolado (agilidade
de 1 a 100, idade de 16 a 45, os seis atributos e o potencial de 1 a 99); a mensagem de validação
SHALL aparecer junto ao campo (F2 "Formulários"). Regras que cruzam campos (soma dos seis
atributos, potencial em relação ao maior atributo, agilidade conforme a idade) e regras que
dependem do estado atual do banco (nome/sigla já usados, idade menor que a atual) podem ficar só na
API, que a tela mostra via `message`.

#### Scenario: Nome do jogador fora do tamanho é bloqueado antes do envio
- **WHEN** o usuário digita um nome de jogador com menos de 3 ou mais de 100 caracteres e tenta
  enviar o formulário de cadastro
- **THEN** o envio é bloqueado e a mensagem de validação aparece junto ao campo, sem chamar a API

#### Scenario: Agilidade fora da faixa é bloqueada antes do envio
- **WHEN** o usuário digita uma agilidade fora de 1 a 100 no cadastro ou na edição de jogador
- **THEN** o envio é bloqueado e a mensagem de validação aparece junto ao campo

#### Scenario: Escalação sem titular em uma das 5 vagas bloqueia o envio
- **WHEN** o usuário tenta salvar a escalação sem escolher um titular para uma das vagas da
  formação
- **THEN** o botão de salvar fica desabilitado ou o envio é bloqueado com mensagem, sem chamar a API

#### Scenario: Nova partida sem mandante ou sem visitante bloqueia o envio
- **WHEN** o usuário tenta jogar uma partida sem escolher o mandante ou o visitante
- **THEN** o envio é bloqueado com mensagem, sem chamar a API

### Requirement: Nenhum código morto ou fora do padrão de nomes
Nenhum arquivo do frontend SHALL conter código comentado, código sem uso (arquivo, componente,
função ou variável que nenhum outro trecho do projeto referencia) ou identificador fora do padrão
da linguagem — `camelCase` para funções e variáveis, `PascalCase` para componentes — ou escrito em
mais de um idioma (F2 "Código morto e padrão"). Nomes definidos pelo enunciado (campos e query
params da API em `snake_case`, valores de enum como `APTO` e `COMPRA`, e textos exibidos na tela)
SHALL não contar como fora do padrão.

#### Scenario: Busca por código comentado não encontra nada
- **WHEN** o código-fonte do frontend é inspecionado por blocos de código comentado
- **THEN** nenhum arquivo contém trecho de código desativado por comentário

#### Scenario: Todo componente e função exportados são referenciados
- **WHEN** o código-fonte do frontend é inspecionado por busca de uso de cada export
- **THEN** todo componente, função e variável exportados são referenciados em pelo menos um outro
  arquivo do projeto

### Requirement: Mensagens de sucesso e de recusa com proteção contra duplo clique
Cada uma das 9 ações SHALL mostrar uma mensagem de sucesso quando concluída e, quando a API
recusar (400, 404 ou 409), SHALL mostrar o `message` devolvido pela API, nunca uma mensagem
genérica no lugar dele (F3 "Mensagens"). Durante o envio de uma ação, o botão correspondente SHALL
ficar desabilitado, e um clique duplo SHALL resultar em no máximo um pedido à API.

#### Scenario: Clique duplo em "Jogar partida" gera só uma partida
- **WHEN** o usuário clica duas vezes seguidas no botão de jogar partida
- **THEN** apenas um pedido `POST /matches` é enviado, e o botão fica desabilitado entre os cliques

#### Scenario: Recusa de compra mostra o message da API
- **WHEN** uma compra é recusada pela API com `409` (ex.: custo total acima de 50% do caixa)
- **THEN** a tela mostra o `message` devolvido pela API, não um texto genérico

#### Scenario: Cadastro de jogador bem-sucedido mostra confirmação
- **WHEN** um jogador é cadastrado com sucesso
- **THEN** a tela mostra uma mensagem de sucesso, com o jogador já visível na lista

### Requirement: Recusas previsíveis podem ser impedidas antes do envio; as demais mostram o message da API
Nas recusas que a tela consegue prever pelos dados já carregados — combinar "só livres" com o
filtro por clube, alterar a condição de `DOENTE` direto para `APTO`, mudar a posição de um jogador
que já tem clube, e informar idade menor que a atual na edição — a tela SHALL impedir a ação
mostrando o motivo, ou enviar o pedido e mostrar o `message` da API. As escolhas inválidas de
escalação (jogador `DOENTE`, fora do elenco, posições que não fecham a formação) também SHALL ser
impedidas na tela. Toda outra recusa de regra de negócio ou de recurso inexistente (`409`/`404`) —
nome ou sigla repetidos, limite de 20 clubes, compra acima de 50% do caixa, elenco cheio, recompra,
clube sem escalação completa na partida, dados que mudaram depois de a tela abrir — SHALL ser
enviada normalmente à API, mostrando o `message` dela, nunca bloqueada antecipadamente pela tela
(seção "🖥️ Frontend" → "Mensagens e apresentação").

#### Scenario: free=true com club_id é impedido ou mostra o message
- **WHEN** o usuário tenta combinar o filtro "só livres" com um filtro de clube na lista de
  jogadores
- **THEN** a tela impede a combinação mostrando o motivo, ou envia o pedido e mostra o `message`
  da API

#### Scenario: Transição DOENTE para APTO é impedida ou mostra o message
- **WHEN** o usuário tenta alterar a condição de um jogador `DOENTE` direto para `APTO`
- **THEN** a tela impede a ação mostrando o motivo, ou envia o pedido e mostra o `message` da API

#### Scenario: Compra acima do limite de caixa não é bloqueada na tela
- **WHEN** o usuário confirma uma compra cujo custo total passaria de 50% do caixa do clube
- **THEN** a tela envia o pedido normalmente e mostra o `message` devolvido pela API quando ela
  recusar com `409`, sem bloquear o envio antecipadamente

#### Scenario: Escalação com jogador DOENTE é impedida na tela
- **WHEN** o usuário tenta escolher um jogador `DOENTE` como titular na escalação
- **THEN** a tela impede a escolha, sem permitir que esse jogador seja selecionado para a vaga

### Requirement: Estados de carregamento, lista vazia e erro nas 6 telas de lista
As 6 telas de lista — jogadores, clubes, elenco do clube, histórico de transações, histórico de
partidas e classificação — SHALL mostrar três estados distintos: carregamento (enquanto a
requisição está em andamento), lista vazia (requisição concluída sem itens) e erro (requisição
falhou), com uma opção de tentar de novo no estado de erro, mostrando o `message` da API quando
ela tiver respondido (F3 "Estados das telas").

#### Scenario: Lista de jogadores mostra carregamento, vazio e erro
- **WHEN** a lista de jogadores está sendo buscada, depois é buscada sem resultados (banco
  recém-criado) e depois falha por o backend estar parado
- **THEN** a tela mostra, em cada um desses três momentos, o estado de carregamento, o estado de
  lista vazia e o estado de erro, respectivamente

#### Scenario: Elenco de um clube recém-criado mostra lista vazia
- **WHEN** a página de um clube recém-criado (sem jogadores comprados) é aberta
- **THEN** a aba de elenco mostra o estado de lista vazia, não um erro nem uma tabela em branco

### Requirement: Formatação de moeda e data
Todo valor monetário SHALL ser exibido com 2 casas decimais e vírgula como separador decimal (ex.:
`40,00`); toda data e hora SHALL ser exibida no horário de Brasília; datas digitadas pelo usuário
(como o fim da fidelidade na compra) SHALL ser interpretadas no horário de Brasília e enviadas à
API no formato `AAAA-MM-DDTHH:MM-03:00` (F3 "Apresentação", RN01).

#### Scenario: Valor de mercado é exibido com vírgula decimal
- **WHEN** a API devolve `market_value: 40.00`
- **THEN** a tela exibe `40,00`

#### Scenario: Fim da fidelidade digitado é enviado em horário de Brasília
- **WHEN** o usuário digita o fim da fidelidade como `02/03/2027 10:15` no formulário de compra
- **THEN** a tela envia `loyalty_until` como `2027-03-02T10:15-03:00`

#### Scenario: Data devolvida pela API é exibida no horário de Brasília
- **WHEN** a API devolve `created_at: "2026-11-04T15:45:00-03:00"`
- **THEN** a tela exibe a data e a hora nesse horário, sem conversão para outro fuso
