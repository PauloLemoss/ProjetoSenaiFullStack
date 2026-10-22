## Context

O frontend (`frontend/`, Vite 8 + React 19 + React Router 7) está funcionalmente completo, com CSS
puro por feature (`src/app/AppShell.css`, `src/features/{jogadores,clubes}/*.css`,
`src/shared/shared.css`) e um `src/index.css` que declara `color-scheme: light dark` e segue
`prefers-color-scheme` do sistema operacional — por isso a UI fica escura quando o SO do usuário
está em modo escuro, independente do que o app "deveria" mostrar. Não há Tailwind, PostCSS nem
nenhuma biblioteca de componentes de UI instalada hoje (ver `frontend/package.json`). Ver
`proposal.md` para a motivação completa e `specs/` para os requisitos desta change.

## Goals / Non-Goals

**Goals:**
- Definir como o Tailwind entra no projeto (versão, integração com Vite, onde ficam os tokens de
  tema) sem adicionar PostCSS nem build steps desnecessários.
- Definir a ordem de migração das telas, para que o app continue funcional (e os testes existentes
  continuem passando) a cada passo, em vez de uma reescrita completa de uma vez.
- Definir os poucos componentes de interação que hoje dependem de HTML nativo sem estilo (menu de
  ações com `<details>`/`<summary>`) e como substituí-los sem nenhuma biblioteca nova além do
  Tailwind.

**Non-Goals:**
- Não cobre a implementação em si (fica para `tasks.md` de uma change futura de execução).
- Não introduz nenhuma biblioteca de componentes de UI (ex.: Headless UI, Radix, MUI) — a decisão é
  usar só Tailwind + React simples, para não adicionar dependência fora do que o usuário pediu.
- Não muda nenhum contrato de API, campo, endpoint ou regra de negócio.
- Não persegue fidelidade pixel-a-pixel a um mockup de Figma — a referência visual é a qualidade
  profissional descrita nas specs (cartões, sombra, tipografia, paleta clara), não um layout exato.

## Decisions

### Tailwind CSS v4 via `@tailwindcss/vite`, sem PostCSS nem `tailwind.config.js`
O Tailwind entra pelo plugin oficial `@tailwindcss/vite` (adicionado em `vite.config.js`), com os
tokens de tema (paleta, tipografia, espaçamento, raio de borda) definidos em `@theme` dentro de
`src/index.css`, no formato CSS-first do Tailwind v4. `src/index.css` passa a ser só a diretiva
`@import "tailwindcss";` seguida do bloco `@theme` com os tokens e um pequeno reset global (sem
`color-scheme: light dark` nem `@media (prefers-color-scheme: dark)` — ver
`frontend-design-system`, "Tema claro fixo").

**Alternativa considerada:** Tailwind v3 clássico com `postcss.config.js` + `tailwind.config.js`
(globs de `content`) — mais documentação legada disponível, mas exige manter dois arquivos de
configuração extras e a dependência de PostCSS/Autoprefixer, sem ganho real para um projeto Vite
atual. Rejeitada em favor da integração nativa do Tailwind v4 com Vite.

### Paleta de tema claro
Tokens de cor (em `@theme`, nomeados por função, não por tom) para：
- `--color-bg` (fundo da página, branco), `--color-surface` (fundo de cartão, branco ou cinza
  muito claro), `--color-border` (cinza claro).
- `--color-text` (cinza bem escuro, não preto puro), `--color-text-muted` (cinza médio).
- `--color-primary` (azul, ação principal/links/foco), `--color-success`, `--color-warning`,
  `--color-danger` (cada um com uma variante de fundo claro para badges/avisos).

Esses tokens substituem as variáveis CSS hoje em `:root` (`--color-text`, `--color-bg`, etc.), sem
a variante de modo escuro. Os componentes usam as classes utilitárias geradas a partir desses
tokens (ex.: `bg-surface`, `text-text-muted`, `border-border`), nunca cor "hardcoded" fora do tema,
para manter consistência entre telas.

### Menu de ações da tabela de jogadores: componente controlado em vez de `<details>`
O menu de ações por linha (`PlayersTable.jsx`) hoje usa `<details>`/`<summary>` nativo, sem estilo e
sem fechar ao clicar fora. Passa a ser um componente React controlado (estado local de "menu
aberto", fechado ao clicar fora ou pressionar Escape), estilizado com Tailwind (posicionamento
absoluto, sombra, cantos arredondados) — igual ao padrão de qualquer outro menu suspenso da
aplicação, sem adicionar biblioteca de menu/popover.

**Alternativa considerada:** manter `<details>`/`<summary>` e só estilizar via CSS — mais simples,
mas o comportamento nativo (abre com qualquer clique, não fecha ao clicar fora, foco preso de forma
inconsistente entre navegadores) não combina com a aparência de menu de interface pedida nas specs.
Rejeitada.

**Risco:** trocar `<details>` por um componente controlado muda a árvore DOM e a forma de interação
nos testes existentes de `PlayersTable`/`JogadoresPage` que hoje abrem o menu simulando o clique no
`<summary>`. Mitigação: ao migrar essa tela (tarefa própria em `tasks.md`), atualizar esses testes
no mesmo commit, mantendo as asserções sobre o comportamento (ex.: "Excluir" só aparece para jogador
livre), só trocando a forma de abrir o menu.

### Sem biblioteca de ícones — SVG inline em um componente `Icon` próprio
Os poucos ícones necessários (cartões da tela inicial, aviso de alerta na escalação, indicação de
sucesso/erro) usam SVGs inline simples, centralizados num pequeno componente `Icon` de
`src/shared`, em vez de uma biblioteca de ícones (ex.: lucide-react). Evita uma dependência nova só
para um punhado de ícones, mantendo a stack o mais próxima possível da atual (Vite + React +
Tailwind).

### Atalho para a tela inicial: item de navegação próprio, não só a marca clicável
O atalho de voltar à tela inicial (`frontend-design-system`, "Atalho para a tela inicial") entra
como um item de navegação próprio no topo da barra lateral (ícone `IconHome`, já criado e sem uso
até esta decisão), acima das seções "Mercado" e "Liga", em vez de depender só da marca "Passe" ser
clicável. Um item de navegação explícito é descoberto mais facilmente do que um logotipo clicável
(convenção nem sempre óbvia), e participa da mesma lógica de destaque de rota ativa já usada pelos
demais itens, sem exigir um caso especial.

**Alternativa considerada:** tornar somente a marca/logotipo da barra lateral clicável. Mais comum
em sites de marketing, mas menos descoberto numa aplicação interna, e exigiria tratar esse clique
fora do padrão de `NavLink` usado pelos demais itens (destaque de rota ativa, comportamento ao
recolher a barra). Rejeitada como único mecanismo; nada impede a implementação futura de também
tornar a marca clicável, de forma redundante e de baixo custo.

### Ordem de migração: base compartilhada → tela inicial → telas por módulo
A implementação futura (fora desta change) deve seguir esta ordem, para que o app funcione a cada
passo:
1. Configurar o Tailwind e os tokens de tema (`frontend-design-system`), sem tocar nas telas ainda.
2. Migrar `AppShell` (navegação) e os componentes compartilhados (`DataTable`, `FormField`,
   `Modal`, `ConditionBadge`, botões) para Tailwind, mantendo o comportamento atual.
3. Criar a tela inicial (`frontend-index`), já usando os componentes migrados.
4. Migrar as telas de jogadores, depois clubes, depois mercado, depois liga
   (`frontend-*-visual`), removendo o CSS por feature correspondente a cada uma.
5. Remover `AppShell.css`, `jogadores.css`, `clubes.css` e `shared.css` só depois que a última tela
   que os usa for migrada.

### Testes existentes continuam a base da verificação visual
Os testes de componente/integração existentes (Vitest + Testing Library) consultam por `role` e
texto acessível, não por classe CSS — a migração visual não deve quebrá-los, exceto onde a
interação muda de verdade (menu de ações, ver risco acima). Nenhum teste novo de "aparência" (ex.:
snapshot de CSS) é necessário; os requisitos visuais desta change são verificados por inspeção
manual da tela, como já é o padrão dos critérios de usabilidade do barema (F3).

## Risks / Trade-offs

- [Risco] Migrar todas as telas para Tailwind é um volume grande de mudança em arquivos já
  funcionando e testados → Mitigação: ordem de migração incremental (ver Decisões), uma capability
  (um grupo de telas) por vez, rodando a suíte de testes a cada etapa.
- [Risco] Trocar `<details>`/`<summary>` por um menu controlado muda o DOM que alguns testes
  simulam → Mitigação: atualizar os testes afetados na mesma tarefa que migra `PlayersTable`.
- [Risco] Remover `prefers-color-scheme` pode surpreender um usuário que prefere tema escuro no
  resto do sistema → Aceito deliberadamente: é o pedido explícito do usuário (fundo claro sempre);
  não há requisito do barema pedindo suporte a tema escuro.
- [Trade-off] Não usar nenhuma biblioteca de componentes (Headless UI/Radix) mantém a stack enxuta,
  mas exige implementar manualmente o fechamento do menu ao clicar fora e o foco preso no modal —
  aceito, dado o volume pequeno desses componentes (um menu, um modal).

## Migration Plan

Esta change não altera código (só planejamento). Quando uma change de implementação futura
executar as tasks, a migração segue a ordem da seção "Decisões" acima, uma capability por vez, com
a suíte de testes do frontend (`npm run test`) e os comandos de lint/format-check rodando (e
passando) ao final de cada etapa, antes de seguir para a próxima. Não há dado persistido nem
migração de banco envolvida — é só código de frontend.

## Open Questions

- Paleta exata (tons específicos de azul/verde/âmbar/vermelho) fica a critério de quem implementar,
  desde que respeite os papéis de cor definidos em "Paleta de tema claro" (primário, sucesso,
  aviso, perigo) e o contraste mínimo para leitura confortável; não é uma decisão que muda specs,
  tasks ou a abordagem desta change.
