# Frontend — mercado-jogadores

Interface em React para o desafio técnico SENAI/PE (mercado de jogadores).
É uma SPA (aplicação de página única) que consome a API REST do backend, desenvolvida separadamente.

## 1. Pré-requisitos

> Esta seção assume que você nunca instalou Node.js antes. Se já tiver o Node 22+ instalado, pode
> pular direto para a seção 2.

O frontend exige **Node.js 22+** (que já vem com o **npm**, o gerenciador de pacotes do Node). O
motivo da versão: `vitest@5` com o `jsdom` mais recente não roda em Node 20 (erro de `TypeError`
dentro do `undici`), então a versão 22 é obrigatória para os testes passarem.

| Ferramenta | Versão usada no desenvolvimento |
| --- | --- |
| Node.js | 22 |
| npm | 10 (vem junto com o Node 22, não precisa instalar separado) |

### Verificar se já está instalado

No terminal, rode:

```bash
node --version
```

Se aparecer algo como `v22.x.x` (ou maior), já pode pular para a seção 2. Se der erro de
"comando não encontrado" ou mostrar uma versão menor que 22, siga a instalação abaixo.

### Instalando o Node.js 22

A forma mais simples é baixar o instalador oficial em
<https://nodejs.org> (escolha a versão **22.x LTS**) e seguir o assistente — funciona igual em
Windows, macOS e Linux.

Alternativa (recomendada se for trabalhar com várias versões de Node, ou estiver no WSL2/Linux),
usando o **nvm** (gerenciador de versões do Node):

```bash
# 1. Instala o nvm (uma vez só na máquina)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 2. Fecha e abre o terminal de novo, depois instala o Node 22
nvm install 22

# 3. Confirma
node --version   # deve mostrar v22.x.x
```

O arquivo `frontend/.nvmrc` já contém `22`, então, se usar o nvm, basta rodar `nvm use` dentro da
pasta `frontend/` para garantir que está na versão certa (útil quando a máquina tem mais de uma
versão de Node instalada).

> **Importante:** o frontend sozinho não mostra dados — ele consome a API do backend, que precisa
> estar rodando à parte (veja a raiz do repositório). A seção "C" abaixo explica isso melhor.

## 2. Passo a passo de instalação e execução

Todos os comandos abaixo rodam a partir da **raiz do repositório** (onde fica este repositório clonado), entrando na pasta `frontend/` quando indicado.

### A. Instalar dependências

```bash
# Na raiz do repositório
cd frontend
npm ci
```

O `npm ci` (em vez de `npm install`) é usado porque o `package-lock.json` está versionado no repositório, garantindo que as mesmas versões das dependências sejam instaladas em qualquer ambiente.

Esse comando baixa tudo que o projeto precisa para dentro de uma pasta `node_modules/` (pode
demorar um pouco na primeira vez). Se terminar sem nenhuma linha vermelha de erro, deu certo.

### B. Rodar em modo de desenvolvimento

```bash
# Na pasta frontend/
npm run dev
```

O servidor de desenvolvimento sobe em **http://localhost:5173**. Se tudo deu certo, o terminal
fica "preso" mostrando os logs do Vite (isso é esperado — é o servidor rodando; para parar, use
`Ctrl+C`). Abra <http://localhost:5173> no navegador para ver a aplicação; abra outro terminal
para rodar outros comandos enquanto esse fica aberto.

### C. Rodar o backend antes do frontend

O frontend consome a API do backend, que precisa estar rodando separadamente:

- **API backend:** `http://localhost:8000` (o próprio front adiciona o sufixo `/api/v1` nas chamadas)
- Veja o `README.md` da raiz do repositório para iniciar o backend (Docker ou Poetry local)

> O frontend **não funciona sozinho**: sem o backend rodando, as telas não carregam dados (os endpoints retornam erro de conexão).

### D. Build de produção e visualização local

```bash
# Na pasta frontend/
npm run build     # gera os arquivos estáticos em dist/
npm run preview   # sobe o build de produção localmente (http://localhost:4173)
```

O `npm run build` gera a pasta `dist/` com os arquivos otimizados para produção. O `npm run preview` serve esses arquivos localmente para conferir o resultado antes de implantar.

---

## 3. Fluxo de uso da aplicação

> Esta seção assume que o backend e o frontend já estão rodando (seções 2 e "C" acima) e que você
> já abriu <http://localhost:5173> no navegador.

O banco de dados começa **vazio** — não existe nenhuma carga inicial de clubes ou jogadores. Para
testar o sistema de ponta a ponta (comprar jogador, escalar titulares, jogar uma partida), você
precisa cadastrar os dados na ordem abaixo, porque cada etapa depende da anterior: não dá pra
escalar um clube sem jogadores comprados, nem criar uma partida sem os dois clubes escalados.

### Ordem recomendada

| Passo | O que fazer | Depende de |
| --- | --- | --- |
| 1 | Cadastrar pelo menos 2 clubes | — |
| 2 | Cadastrar jogadores (pelo menos 10, cobrindo as posições certas) | — |
| 3 | Comprar os jogadores para os dois clubes | Passos 1 e 2 |
| 4 | Escalar os titulares de cada clube | Passo 3 |
| 5 | Criar uma partida entre os dois clubes | Passo 4 (os dois clubes) |
| 6 | Conferir o histórico de partidas e a classificação | Passo 5 |
| 7 *(opcional)* | Vender um jogador | Passo 3 |
| 8 *(opcional)* | Conferir o histórico de transações e exportar CSV | Passo 3 |

Cada passo, em detalhe:

#### 1. Cadastrar um clube
- **Onde:** menu lateral **Mercado → Clubes** (`/clubes`) → botão **"Novo clube"** (ou o ícone "+"
  ao lado de "Clubes", mais abaixo na própria barra lateral).
- **Campos:** Nome, Sigla.
- Repita até ter **pelo menos 2 clubes** — é o mínimo para criar uma partida mais adiante. O
  sistema aceita até 20 clubes no total.
- É possível editar nome e sigla depois (botão "Editar" na listagem de clubes).

#### 2. Cadastrar jogadores
- **Onde:** menu lateral **Mercado → Jogadores** (`/jogadores`) → botão **"Novo jogador"**.
- **Campos:** Nome, Posição (Goleiro, Zagueiro, Lateral, Meio-campo ou Atacante), Idade (16 a 45),
  Agilidade (1 a 100), os seis atributos técnicos — Velocidade, Finalização, Passe, Drible, Defesa
  e Físico (1 a 99 cada) — e Potencial (1 a 99, teto de evolução). Valor base e Overall são
  calculados pela API depois de salvar; não há o que preencher neles.
- **Quantidade mínima:** escalar um clube exige 5 titulares — 1 Goleiro + 4 de linha nas posições
  da formação escolhida (ver passo 4). Como isso vale para os dois clubes, cadastre **pelo menos
  10 jogadores livres** (ainda sem clube) cobrindo Goleiro, Zagueiro/Lateral, Meio-campo e Atacante
  antes de passar para a compra.
- Um jogador recém-cadastrado começa sempre livre (sem clube) — é assim que ele aparece disponível
  para compra no passo 3.

#### 3. Comprar jogadores para os clubes
- **Onde:** na tabela de Jogadores, no menu "⋯" da linha de um jogador **livre** (sem clube) →
  **"Comprar"**. (Esse botão só aparece para jogadores sem clube.)
- **Campos:** Clube comprador (select) e Fim da fidelidade — data e hora, em horário de Brasília.
- Repita a compra até cada um dos dois clubes ter pelo menos 5 jogadores cobrindo as posições
  necessárias para a formação que você vai escolher no próximo passo.

#### 4. Escalar os titulares de cada clube
- **Onde:** **Clubes → "Ver clube" no clube desejado → aba "Escalação"**.
- **Pré-requisito:** o clube precisa ter jogadores comprados no elenco — os seletores de cada vaga
  só mostram jogadores que já pertencem a esse clube, e um jogador **Doente** nunca aparece como
  opção.
- Escolha uma **Formação** (3-1, 2-2, 2-1-1 ou 1-2-1) e, para cada vaga, um titular elegível pela
  posição (Goleiro só aceita GOL; Defesa aceita ZAG ou LAT; Meio-campo aceita MEI; Ataque aceita
  ATA). O botão **"Salvar escalação"** só habilita quando as 5 vagas estão preenchidas.
- Repita para o segundo clube — sem os dois escalados, o próximo passo (criar partida) é recusado.

#### 5. Criar uma partida
- **Onde:** menu lateral **Liga → Partidas** (`/partidas`) → botão **"Nova partida"**.
- **Campos:** Mandante e Visitante (dois clubes diferentes).
- **Pré-requisito:** os dois clubes precisam ter a escalação completa (5 titulares cada); se um
  deles não tiver, a API recusa com a mensagem "O clube {nome} não tem escalação completa.".
- Depois de criar, a tela abre automaticamente o placar e os duelos da partida (quem atacou, quem
  defendeu, e se houve gol).

#### 6. Conferir histórico de partidas e classificação
- **Histórico de partidas:** na própria tela de Partidas (`/partidas`), com filtro por clube.
- **Classificação:** menu lateral **Liga → Classificação** (`/classificacao`) — posição, jogos,
  vitórias, empates, derrotas, saldo de gols e pontos de todos os clubes, na ordem devolvida pela
  API (critério de desempate: pontos → saldo de gols → gols marcados → nome do clube).

#### 7. (Opcional) Vender um jogador
- **Onde:** **Clubes → "Ver clube" → aba "Elenco"** → botão **"Vender"** na linha do jogador (só
  habilita se o jogador tiver contrato ativo).
- O modal mostra um resumo (valor de mercado, % de multa, dias restantes de fidelidade) e pede só
  uma confirmação — depois de confirmar, mostra valor de venda, multa, lucro, comissão e o novo
  caixa do clube.

#### 8. (Opcional) Histórico de transações e exportação CSV
- **Onde:** **Clubes → "Ver clube" → aba "Histórico"**.
- Mostra todas as compras e vendas do clube, com filtro por tipo (Compra/Venda) e por jogador, e
  totais no rodapé que respeitam o filtro aplicado.
- Botão **"Exportar CSV"** no topo da tabela baixa o histórico filtrado em um arquivo
  `historico-clube-{id}.csv`.

---

## 4. Variáveis de ambiente

O frontend lê a URL da API através da variável de ambiente **`VITE_API_BASE_URL`**.

O arquivo `frontend/.env.example` já existe com o conteúdo correto:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Antes de rodar o frontend, copie este arquivo para `.env`:

```bash
# Na pasta frontend/
cp .env.example .env
```

Apenas copie se precisar alterar a URL da API (por exemplo, se o backend estiver rodando em outro host/porta). Caso contrário, o valor padrão já está correto para o desenvolvimento local com o backend rodando em `http://localhost:8000`.

> O próprio front acrescenta o sufixo `/api/v1` nas chamadas, então a variável deve conter a URL base da API (ex.: `http://localhost:8000/api/v1`), já incluindo o `/api/v1`.

---

## 5. Estrutura de pastas e bibliotecas

### Estrutura de pastas

O projeto está organizado por **feature** (capability), espelhando as capacidades do desafio:

```
frontend/
├── src/
│   ├── app/                # AppShell (sidebar + navegação principal) e rota raiz
│   ├── features/
│   │   ├── jogadores/      # tela de jogadores (listagem, busca, filtros, cadastro, edição, condição, exclusão, detalhes)
│   │   ├── clubes/         # tela de clubes (listagem ordenada, criação, página do clube com indicadores, elenco e histórico de transações)
│   │   ├── mercado/        # fluxos de compra e venda, histórico de transações e exportação CSV
│   │   └── liga/           # escalação de titulares, criação de partida com placar e duelos, histórico de partidas e classificação
│   ├── shared/             # componentes reutilizáveis (DataTable, FormField, Modal, ConditionBadge) e hooks genéricos (useQuery, useAsyncAction)
│   ├── lib/                # cliente HTTP (httpClient), formatação de moeda (formatCurrency) e data/hora (formatDateTime)
│   ├── App.jsx             # roteamento (React Router)
│   ├── index.css           # variáveis CSS e estilos globais
│   └── main.jsx            # ponto de entrada do React
├── .env.example            # variável de ambiente VITE_API_BASE_URL
├── .nvmrc                  # Node.js 22
├── package.json            # dependências e scripts
├── package-lock.json       # lockfile das dependências (versionado)
├── vite.config.js          # configuração do Vite e do Vitest
└── README.md               # este arquivo
```

### Bibliotecas principais

| Biblioteca | Por que |
| --- | --- |
| `react` / `react-dom` | Biblioteca de interface e renderização no DOM (stack obrigatória do enunciado) |
| `react-router-dom` | Roteamento SPA no modo biblioteca (navegação entre telas sem recarregar a página) |
| `vite` / `@vitejs/plugin-react` | Servidor de desenvolvimento, bundler de produção e integração do React com Vite |
| `tailwindcss` / `@tailwindcss/vite` | Estilização utilitária e responsividade das telas e componentes |
| `vitest` / `jsdom` | Framework de testes automatizados e ambiente DOM simulado para execução no terminal (diferencial F5) |
| `@testing-library/react` | Testes de componente com renderização e consultas acessíveis |
| `@testing-library/user-event` | Simulação realista de interações do usuário (cliques, digitação) nos testes |
| `@testing-library/jest-dom` | Matchers semânticos de asserção sobre o DOM nos testes automatizados |
| `oxlint` | Análise estática (lint) do código do frontend (diferencial técnico F5) |
| `prettier` | Verificação e padronização de formatação de código (diferencial técnico F5) |

A escolha de **Vite + React Router (modo biblioteca)** deve-se ao fato de o projeto ser uma SPA consumindo uma API REST externa, sem necessidade de SSR ou Server Components, onde o Next.js App Router introduziria complexidade adicional sem benefício real para este caso de uso.

---

## 6. Comandos de desenvolvimento

Todos rodam dentro da pasta `frontend/`:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento em http://localhost:5173 |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run test` | Roda a suíte de testes do Vitest (termina sozinho) |
| `npm run lint` | Roda o oxlint (análise estática de código) |
| `npm run format` | Aplica formatação com Prettier (modifica arquivos) |
| `npm run format:check` | Verifica a formatação com Prettier (só verifica, não altera arquivos) |

O comando `npm run test` (vitest) é o comando do diferencial F5 — termina sozinho, sem falhas. O `npm run format:check` só verifica a formatação, sem alterar arquivos; já o `npm run format` aplica a formatação de fato. Os dois comandos estão listados separadamente no README porque têm propósitos diferentes: um para verificar, outro para aplicar.

---

## 7. Como testar de verdade

Para confirmar que tudo funciona a partir de um estado limpo:

```bash
# Na raiz do repositório
cd frontend

# Instala as dependências exatamente como travadas no lockfile
npm ci

# Executa todos os testes (deve terminar sozinho, sem falhas)
npm run test

# Gera o build de produção
npm run build

# Valida a formatação sem alterar arquivos
npm run format:check

# Analisa o código com o linter
npm run lint
```

O `package-lock.json` está versionado no repositório, então `npm ci` instala exatamente as mesmas versões usadas no desenvolvimento.

---