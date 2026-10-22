## Context

O backend (`backend/`) está implementado e estável, com 4 módulos sob `/api/v1`. O frontend
(`frontend/`) ainda não tem código — só `frontend/front.md` (mapeamento inicial Figma → requisito →
endpoint) e `frontend/docs/` com os mockups do Figma, organizados em subpastas por módulo
(`telasjogadores/`, `telasclubes/`, `telascompras/`, `telasvendas/`, `telashistorico/`,
`telasligas/`, `telasestados/`). Uma amostra representativa dessas imagens foi revisada para esta
change (tela inicial, listagem/filtros de jogadores, elenco/escalação de clube, conclusão de
compra/venda, histórico com totais, duelos de partida, classificação, e o painel de estados das 6
listas), o suficiente para confirmar o fluxo e os padrões de UI que as specs descrevem — não o
conjunto completo de ~60 imagens.

O produto mostrado no mockup se chama "Passe": um app de página única com sidebar fixa (seção
Mercado: Jogadores/Clubes; seção Liga: Partidas/Classificação) e breadcrumb no topo, não telas
soltas. Ver proposal.md para o porquê desta change existir.

## Goals / Non-Goals

**Goals:**
- Registrar, em `openspec/specs/frontend-*`, o comportamento observável que cada tela do frontend
  deve ter, rastreável a F01–F14/F2/F3/F5 do barema e às RNs relevantes do enunciado.
- Deixar documentado, aqui em design.md, o mapeamento de telas para rotas e os padrões de UI
  recorrentes observados no Figma, para orientar a próxima change (scaffold do projeto React).

**Non-Goals:**
- Esta change não cria nenhum arquivo de código em `frontend/` (nenhum `package.json`, nenhum
  componente React). Isso é escopo da change de scaffold/implementação, feita depois.
- Esta change não escolhe a biblioteca de estilo, o cliente HTTP, a biblioteca de formulário nem o
  framework de testes — o enunciado deixa essas escolhas livres (front.md, seção 2), e a decisão
  não muda nenhuma requirement das specs (specs descrevem comportamento, não tecnologia). A seguir,
  há uma recomendação de framework/arquitetura para orientar a change de scaffold — não é uma
  decisão travada, e pode ser revista sem alterar nenhuma spec.
- Esta change não exige fidelidade pixel-perfect ao Figma; o mockup é referência de fluxo.

## Decisions

### Rotas sugeridas (uma por capability)
Mantendo o fluxo de negócio do enunciado (`Jogadores → Clubes → Compra → Venda → Histórico →
Escalação → Partidas → Classificação`) e a sidebar do mockup, a próxima change de scaffold deve
organizar as rotas por capability, não por mockup:
- `/jogadores` — `frontend-jogadores` (lista, cadastro, edição, condição, exclusão)
- `/clubes` e `/clubes/:id` — `frontend-clubes` (lista, criação, página do clube com abas Elenco /
  Escalação / Histórico)
- Compra e venda (`frontend-mercado`) não são rotas próprias: a compra abre a partir da lista de
  jogadores livres, e a venda a partir do elenco do clube, ambas como diálogo/painel sobre a tela
  atual — assim como o Figma mostra (`M01`–`M08`, `V01`–`V05` são todos modais sobre `/jogadores`
  ou `/clubes/:id`).
- O histórico de transações (`frontend-mercado`) e a escalação (`frontend-liga`) vivem como abas
  dentro de `/clubes/:id`, conforme a página do clube no Figma (`C05`–`C08`).
- `/partidas` e `/classificacao` — `frontend-liga`.

### Camada de API própria por domínio
`frontend-conventions` exige que nenhum componente chame `fetch`/Axios diretamente. O desenho
natural, alinhado às 6 specs criadas, é um módulo de serviço por domínio (jogadores, clubes,
mercado, liga), cada um expondo as funções que cobrem os endpoints daquele domínio — decisão de
nomenclatura concreta (arquivo único vs. hooks por tela) fica para a change de scaffold.

### Componentes compartilhados exigidos pelas specs
As specs de `frontend-conventions` e das 6 telas de lista (F3 "Estados das telas") implicam pelo
menos estes componentes reutilizáveis, comuns a várias telas do Figma:
- Tabela/lista genérica com os três estados (carregando, vazio, erro) — usada nas 6 telas de lista.
- Campo de formulário com rótulo e mensagem de erro — usado nos 7 formulários.
- Aviso de sucesso/erro pós-ação e modal de confirmação com tabela de valores (padrão visto em
  `M05`, `V02`: ambos mostram uma lista de campo/valor após a ação).
- Badge de condição física (Apto/Mal condicionado/Doente), reaproveitado em toda tela que lista
  jogadores (lista, elenco, escalação).

### Ordem de implementação sugerida
Seguir a ordem do roteiro F1 do barema (Jogadores → Clubes → Compra/Venda → Histórico → Liga),
como o próprio `front.md` já recomenda — cada etapa só depende das capabilities anteriores
(`frontend-mercado` depende de `frontend-jogadores` e `frontend-clubes` já existirem; `frontend-liga`
depende das três).

### Recomendação de stack para um perfil júnior: Vite + React Router, não Next.js App Router
Recomenda-se **Vite + React Router (modo biblioteca)** em vez de Next.js App Router. Este projeto
é uma SPA consumindo uma API REST externa (o backend FastAPI), sem necessidade de SSR, Server
Components ou API routes do próprio Next — então os conceitos que o App Router introduz para
resolver esses problemas (`layout`/`template`/`loading`/`error` por segmento de rota, Server vs.
Client Components, route groups, parallel e intercepted routes) não têm contrapartida de valor
aqui e só aumentam a curva de aprendizado para quem está começando. Vite dá o mesmo resultado
(SPA, build rápido) com menos conceitos novos: cada rota é um componente de página comum, sem
distinção server/client. Ambos continuam permitidos pelo enunciado (front.md, seção 2); esta é uma
recomendação para a change de scaffold, não uma trava.

**Alternativa considerada:** Next.js 14+ em modo App Router — descartada para este perfil porque a
documentação oficial (nextjs.org/docs/app/getting-started/project-structure) já deixa claro que
boa parte das suas convenções (slots `@folder`, rotas interceptadas `(.)folder`/`(..)folder`,
múltiplos root layouts) resolve necessidades de aplicações com SSR/múltiplas seções de produto —
nenhuma presente neste desafio.

### Responsabilidade única (SOLID-S) aplicada à arquitetura de telas
Cada tela SHALL ser composta de três camadas com uma responsabilidade cada, para que mudar uma não
force mudar as outras:
1. **Serviço de API** (já decidido acima: um módulo por domínio) — única responsabilidade: montar a
   chamada HTTP e devolver o dado ou o erro, sem lógica de tela.
2. **Hook de dados** (ex.: `usePlayers`, `useClub`) — única responsabilidade: orquestrar
   carregamento/erro/vazio e chamar o serviço; é aqui que mora o estado de carregamento/erro que
   `frontend-conventions` exige nas 6 telas de lista.
3. **Componente de apresentação** — única responsabilidade: renderizar o que o hook devolve e
   emitir eventos (clique, envio de formulário); não decide como buscar dado, não valida regra de
   negócio.
Essa separação é o que torna verificável, por leitura de código, o requirement de
`frontend-conventions` "nenhum componente chama `fetch`/Axios diretamente": a chamada HTTP só pode
existir na camada 1.

### Estrutura de pastas por feature (uma por capability)
Para alguém júnior, a pergunta "onde eu mexo para isso" deve ter resposta óbvia. Recomenda-se
organizar `frontend/src/` por feature, espelhando as 6 capabilities desta change (inspirado na
estratégia "split project files by feature or route" que a documentação do Next.js também
descreve, adaptada para um projeto Vite sem roteamento por pastas):
```
src/
  features/
    jogadores/   (frontend-jogadores: components/, hooks/, api.ts)
    clubes/      (frontend-clubes)
    mercado/     (frontend-mercado: compra, venda, histórico — usados dentro de jogadores/ e clubes/)
    liga/        (frontend-liga: escalação, partidas, classificação)
  shared/        (Table, FormField, Modal, Badge de condição — frontend-conventions)
  lib/           (formatação de moeda e data, cliente HTTP base)
```

### Regras do React como padrão de qualidade de código
As "Rules of React" (react.dev/reference/rules) — componentes e hooks puros, nada de efeito
colateral durante a renderização, hooks chamados só no nível superior — SHALL ser tratadas como
padrão de qualidade na change de scaffold, reforçadas por `eslint-plugin-react-hooks` e React
Strict Mode no comando de lint que `frontend-diferenciais` já exige (F5). Violar essas regras não é
uma requirement de nenhuma spec, mas alimenta diretamente o requirement de "código sem uso ou fora
do padrão" de `frontend-conventions` (F2): um hook condicional ou um efeito colateral em render
tende a virar o tipo de bug que essa seção do barema penaliza.

## Risks / Trade-offs

- **Amostra parcial do Figma** → as specs descrevem comportamento observável (o que front.md e o
  barema já determinam), não a disposição visual exata; a fidelidade pixel-perfect não é exigida
  (enunciado, seção 🖥️ Frontend), então uma lacuna visual não invalida nenhuma requirement. A
  revisão completa das imagens acontece na change de scaffold, quando o design visual for
  implementado.
- **Stack em aberto** → adiar a escolha de biblioteca/framework evita retrabalho nas specs, mas
  significa que a change de scaffold precisa tomar essa decisão antes de codificar. Mitigação:
  este design.md já lista as restrições do enunciado (sem Remix, sem React Router modo framework,
  sem CRA, sem Angular/Vue) para orientar essa escolha.
- **Recusas previsíveis vs. não previsíveis** → a lista de quatro casos que a tela pode bloquear
  (`frontend-conventions`) é específica e pequena; implementar bloqueio além dela (ex.: impedir
  nome de clube duplicado na tela) não é proibido, mas não pontua e pode divergir do `message` da
  API se a regra mudar. Mitigação: as specs citam a lista exata do enunciado, para a implementação
  não inventar bloqueios extras.
- **Toolchain exige Node.js 22+** → descoberto no scaffold: `vitest@5` e o `jsdom` mais recente não
  rodam em Node 20 (`TypeError: Cannot read properties of undefined (reading 'bind')` dentro do
  `undici`, usado pelo jsdom). Mitigação: `.nvmrc` com `22` em `frontend/`, e o README do frontend
  (tarefa 6.4) deve listar Node.js 22 como pré-requisito — coerente com o próprio exemplo do
  enunciado ("ex.: Node.js 22") em "📘 Requisitos do README.md".
- **Recomendação de stack pode não ser seguida** → se a change de scaffold optar por Next.js App
  Router mesmo assim, nenhuma spec precisa mudar (specs não citam framework); só a seção "Estrutura
  de pastas por feature" deste design.md precisaria ser adaptada para convenções de rota do Next
  (`app/jogadores/page.tsx` em vez de `features/jogadores/`), mantendo a mesma separação por
  capability.
