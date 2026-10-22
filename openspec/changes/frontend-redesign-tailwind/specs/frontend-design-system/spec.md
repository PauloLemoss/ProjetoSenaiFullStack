## Purpose

Define a base visual compartilhada por todas as telas do frontend: adoção do Tailwind CSS, tema
claro fixo e os requisitos de aparência dos componentes reutilizáveis (`src/shared`) usados pelas
seis telas de lista e pelos sete formulários. É a capability da qual todas as outras specs de
redesign (`frontend-index`, `frontend-jogadores-visual`, `frontend-clubes-visual`,
`frontend-mercado-visual`, `frontend-liga-visual`) dependem para ter uma aparência única e
consistente, em vez de cada tela estilizar do seu próprio jeito.

## ADDED Requirements

### Requirement: Tema claro fixo, independente da preferência do sistema operacional
Toda tela do frontend SHALL usar fundo e texto claros (fundo branco ou quase branco, texto escuro)
em qualquer combinação de sistema operacional e navegador, inclusive quando o sistema operacional
do usuário está configurado para modo escuro. Nenhuma folha de estilo SHALL ler
`prefers-color-scheme` para trocar cor de fundo, texto ou borda.

#### Scenario: Tela permanece clara com o sistema operacional em modo escuro
- **WHEN** o usuário abre qualquer tela do frontend com o sistema operacional ou o navegador
  configurado para modo escuro
- **THEN** a tela mostra fundo claro e texto escuro, igual ao que mostraria com o sistema em modo
  claro

#### Scenario: Nenhuma regra de estilo muda cor por preferência do sistema
- **WHEN** o código-fonte de estilos do frontend é inspecionado
- **THEN** não existe nenhuma regra `@media (prefers-color-scheme: dark)` nem `color-scheme: light
  dark` alterando cor de fundo, texto ou borda

### Requirement: Tailwind CSS como camada de estilo do frontend
O frontend SHALL usar Tailwind CSS, configurado com um tema compartilhado (paleta de cores,
tipografia, espaçamento e raio de borda), como a camada de estilo de todas as telas e componentes,
substituindo os arquivos de CSS por feature usados hoje (`AppShell.css`, `jogadores.css`,
`clubes.css`, `shared.css`).

#### Scenario: Build do frontend usa o Tailwind configurado
- **WHEN** o frontend é compilado (`npm run build`) ou executado em desenvolvimento (`npm run dev`)
- **THEN** as classes utilitárias do Tailwind são processadas pelo tema configurado do projeto, sem
  erro de build

#### Scenario: Nenhum arquivo de CSS por feature permanece com estilos próprios
- **WHEN** o código-fonte do frontend é inspecionado após o redesign
- **THEN** não existe mais nenhum arquivo `.css` por feature com regras de layout, cor ou
  espaçamento próprias; todo o estilo vem de classes utilitárias do Tailwind

### Requirement: Tipografia e hierarquia visual consistentes
Toda tela SHALL seguir a mesma escala tipográfica para título da página (`h1`), título de seção
(`h2`/`h3`), corpo de texto e texto secundário/auxiliar (ex.: legendas, dicas de campo), com peso e
tamanho de fonte consistentes entre telas equivalentes (ex.: o título "Jogadores" e o título
"Clubes" usam o mesmo tamanho e peso de `h1`).

#### Scenario: Títulos de página usam a mesma escala em telas diferentes
- **WHEN** a tela de Jogadores e a tela de Clubes são comparadas
- **THEN** o título principal de cada uma (`h1`) usa o mesmo tamanho de fonte e peso

### Requirement: Navegação lateral com destaque claro da rota ativa
A barra de navegação lateral (`AppShell`) SHALL destacar visualmente o link da rota atualmente
aberta (ex.: fundo preenchido ou borda de destaque, além do peso de fonte), de forma perceptível à
primeira vista, e SHALL mostrar a marca do sistema com identidade visual própria (não apenas texto
simples sem destaque).

#### Scenario: Link da rota ativa tem destaque visual forte
- **WHEN** o usuário está na tela de Clubes
- **THEN** o link "Clubes" na barra lateral aparece com um destaque visual claramente diferente dos
  demais links (ex.: fundo colorido ou borda lateral), não só peso de fonte

#### Scenario: Sidebar continua utilizável em 375px de largura
- **WHEN** a janela tem 375px de largura
- **THEN** a navegação lateral continua acessível (empilhada acima do conteúdo ou recolhível), sem
  causar rolagem horizontal da página

### Requirement: Contador numérico por item de navegação
Cada item de navegação que representa uma lista (Jogadores, Clubes, Partidas, Classificação) SHALL
mostrar, ao lado do rótulo, a quantidade de itens correspondente, vinda diretamente de um total já
devolvido pela API (`meta.total_items` de `GET /players`, quantidade de itens de `GET /clubs`, `GET
/matches` e `GET /standings`), sem nenhum cálculo ou agregação feita no frontend.

#### Scenario: Contador de Jogadores vem do total da API
- **WHEN** a barra de navegação é exibida
- **THEN** o item "Jogadores" mostra, ao lado do rótulo, o `meta.total_items` devolvido por `GET
  /players`, sem nenhum filtro ou soma adicional

### Requirement: Diretório de clubes na barra lateral
A barra de navegação lateral SHALL mostrar uma seção própria com a lista de clubes cadastrados,
cada um com um avatar com a sigla do clube e o nome, navegando para a página daquele clube ao ser
clicado. Essa seção SHALL ter um botão para abrir o cadastro de clube diretamente pela barra
lateral, sem precisar ir até a tela de Clubes.

#### Scenario: Clicar num clube da barra lateral abre a página do clube
- **WHEN** o usuário clica no nome de um clube listado na barra lateral
- **THEN** a navegação muda para a página daquele clube, sem recarregar a página

#### Scenario: Botão da barra lateral abre o cadastro de clube
- **WHEN** o usuário clica no botão de novo clube da barra lateral
- **THEN** o formulário de cadastro de clube é aberto, e um clube criado por ele aparece na lista da
  barra lateral sem recarregar a página

### Requirement: Barra lateral recolhível
A barra de navegação lateral SHALL ter um controle para recolher e expandir, mostrando só os ícones
dos itens quando recolhida e o conteúdo completo (rótulos, contadores, nomes de clube) quando
expandida.

#### Scenario: Recolher a barra lateral mantém só os ícones
- **WHEN** o usuário aciona o controle de recolher a barra lateral
- **THEN** a barra lateral mostra só os ícones de navegação, sem os rótulos de texto, e o controle
  permite expandi-la de volta

### Requirement: Cabeçalho de página com chip de ícone
Toda tela de nível superior (Jogadores, Clubes, Partidas, Classificação) SHALL usar um cabeçalho
com um chip de ícone identificando o módulo, ao lado do título grande e do subtítulo descritivo; a
ação primária da tela, quando houver, SHALL ficar alinhada ao topo direito do cabeçalho.

#### Scenario: Cabeçalho mostra chip de ícone, título e subtítulo
- **WHEN** a tela de Jogadores é aberta
- **THEN** o cabeçalho mostra um chip de ícone ao lado do título "Jogadores" e do subtítulo
  descritivo, com o botão "Novo jogador" alinhado ao topo direito

### Requirement: Avatar com iniciais
As tabelas que listam jogadores ou clubes, e o diretório de clubes da barra lateral, SHALL
identificar cada linha com um avatar circular (pessoa) ou em selo quadrado (clube) mostrando as
iniciais do nome ou a sigla, com uma cor de fundo consistente para o mesmo item entre telas
diferentes.

#### Scenario: Mesmo jogador usa o mesmo avatar em telas diferentes
- **WHEN** um jogador aparece na listagem de jogadores e no elenco do clube
- **THEN** o avatar mostra as mesmas iniciais, com a mesma cor de fundo, nas duas telas

### Requirement: Barra de progresso por faixa de valor
Um atributo numérico de 0 a 100 mostrado em tabela (ex.: agilidade) SHALL ser representado por uma
barra de progresso colorida por faixa de valor (verde para valores altos, vermelho para valores
baixos, neutro para os intermediários), além do número, sem alterar o valor devolvido pela API.

#### Scenario: Agilidade alta mostra barra verde
- **WHEN** um jogador tem agilidade 80
- **THEN** a barra de progresso da coluna Agilidade aparece na cor de destaque de valor alto,
  proporcional a 80% da barra

### Requirement: Tabela de lista com visual de cartão e estados estilizados
O componente de tabela compartilhado (`DataTable`) SHALL ser exibido dentro de um cartão com borda
arredondada, sombra leve e cabeçalho com destaque visual (fundo diferente do corpo da tabela,
texto em caixa alta ou peso maior). Os três estados exigidos pela convenção de frontend —
carregando, vazio e erro — SHALL ter uma apresentação visual própria (ícone ou ilustração simples,
texto centralizado, botão "Tentar de novo" com destaque no estado de erro), em vez de texto solto
sem estilo.

#### Scenario: Tabela em estado pronto aparece como cartão com cabeçalho destacado
- **WHEN** qualquer uma das seis telas de lista termina de carregar com resultados
- **THEN** a tabela aparece dentro de um cartão com sombra e cantos arredondados, e o cabeçalho das
  colunas tem fundo ou peso de fonte diferente do corpo

#### Scenario: Estado de erro mostra o botão de nova tentativa com destaque
- **WHEN** uma tela de lista está no estado de erro
- **THEN** a mensagem de erro aparece com um ícone ou cor de alerta, e o botão "Tentar de novo"
  (quando existir) tem destaque visual de botão primário

### Requirement: Campo de formulário com estado de foco e erro visíveis
O componente de campo de formulário compartilhado (`FormField`) SHALL mostrar um contorno de foco
visível ao navegar por teclado ou clicar no campo, e destacar em vermelho a borda do campo e o
texto da mensagem de erro quando houver erro de validação.

#### Scenario: Campo em foco mostra contorno visível
- **WHEN** o usuário navega até um campo de formulário pelo teclado (Tab)
- **THEN** o campo mostra um contorno (`outline` ou anel) visível ao redor dele

#### Scenario: Campo com erro mostra borda e mensagem em vermelho
- **WHEN** um campo de formulário tem uma mensagem de erro de validação
- **THEN** a borda do campo e o texto da mensagem aparecem em vermelho, junto ao campo

### Requirement: Modal com sobreposição e cartão centralizados
O componente de modal compartilhado SHALL exibir uma sobreposição (fundo escurecido semi-
transparente) atrás do cartão do modal, com o cartão centralizado na tela, cantos arredondados,
sombra e um botão de fechar visível no canto superior.

#### Scenario: Modal aberto mostra sobreposição e cartão centralizado
- **WHEN** qualquer modal do frontend é aberto (cadastro, edição, condição, exclusão, detalhes,
  compra, venda)
- **THEN** o conteúdo da tela por trás fica coberto por uma sobreposição escurecida, e o cartão do
  modal aparece centralizado, com sombra e cantos arredondados

### Requirement: Badge de condição e botões com hierarquia visual
O badge de condição física SHALL mostrar um ponto colorido seguido do texto da condição, os dois na
mesma cor de status (verde para `APTO`, amarelo/laranja para `MAL_CONDICIONADO`, vermelho para
`DOENTE`), consistente em todas as telas que o exibem. Os
botões do frontend SHALL seguir uma hierarquia visual de no mínimo três estilos — primário (ação
principal, ex.: salvar, comprar, jogar), secundário (ação neutra, ex.: cancelar, fechar) e de perigo
(ação destrutiva, ex.: excluir) — reutilizados em todas as telas e modais, com um estado visual de
desabilitado/carregando (ex.: opacidade reduzida) durante o envio.

#### Scenario: Badge de condição usa a mesma cor em telas diferentes
- **WHEN** um jogador `DOENTE` aparece na listagem de jogadores e no elenco do clube
- **THEN** o badge de condição usa a mesma cor vermelha nas duas telas

#### Scenario: Botão de ação destrutiva usa o estilo de perigo
- **WHEN** o botão "Excluir" (jogador) é exibido
- **THEN** ele usa o estilo de botão de perigo (cor vermelha), diferente do estilo do botão
  primário usado em "Salvar" ou "Comprar"

#### Scenario: Botão em envio mostra estado visual de carregando
- **WHEN** um formulário está enviando (ex.: "Comprando…", "Salvando…")
- **THEN** o botão correspondente mostra um estado visual diferente do estado normal (ex.: opacidade
  reduzida ou indicador de carregamento), além de ficar desabilitado

### Requirement: Atalho para a tela inicial, acessível em qualquer tela
A barra de navegação lateral (`AppShell`), presente em todas as telas do sistema, SHALL oferecer um
atalho visível para voltar à tela inicial (`frontend-index`, rota `/`), perceptível à primeira vista
e utilizável sem depender do botão "voltar" do navegador. Esse atalho SHALL aparecer destacado como
item ativo quando a tela inicial já estiver aberta, do mesmo jeito que os demais itens de navegação,
e SHALL continuar acessível (ao menos como ícone) quando a barra lateral estiver recolhida.

#### Scenario: Atalho leva de qualquer tela de volta à tela inicial
- **WHEN** o usuário está em qualquer tela do sistema (ex.: Jogadores, página de um clube, Partidas)
  e clica no atalho de voltar à tela inicial
- **THEN** a navegação muda para `/`, mostrando a tela inicial, sem recarregar a página

#### Scenario: Atalho aparece destacado quando já está na tela inicial
- **WHEN** a tela inicial (`/`) está aberta
- **THEN** o atalho de voltar à tela inicial aparece com o mesmo destaque visual de rota ativa usado
  nos demais itens de navegação

#### Scenario: Atalho continua acessível com a barra lateral recolhida
- **WHEN** a barra lateral está recolhida
- **THEN** o atalho de voltar à tela inicial continua visível, ao menos como ícone
