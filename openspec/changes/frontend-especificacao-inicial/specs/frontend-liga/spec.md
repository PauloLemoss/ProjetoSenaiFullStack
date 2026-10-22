## Purpose

Define a escalação de titulares, a criação de partidas com placar e duelos, e o histórico de
partidas e a classificação da liga, conforme F12–F14 do barema. Depende da capability de backend
`liga` para os campos, cálculos e regras de negócio que essas telas consomem, e de
`frontend-conventions` para as regras transversais.

## ADDED Requirements

### Requirement: Escalação de titulares (F12)
Na aba Escalação da página do clube, a tela SHALL permitir escolher a formação (`3-1`, `2-2`,
`2-1-1` ou `1-2-1`) e um titular para cada vaga dela (1 goleiro e os jogadores de linha de cada
setor), entre os jogadores do elenco, sem `DOENTE` (`PUT /clubs/{id}/lineup`). Depois de salvar, a
tela SHALL mostrar a escalação devolvida pela API; com a escalação incompleta, a tela SHALL avisar
que o clube não pode jogar.

#### Scenario: Escalação válida é salva e reflete a API
- **WHEN** o usuário escolhe a formação `2-1-1` e um titular válido para cada uma das 5 vagas e
  salva
- **THEN** a tela mostra a escalação devolvida por `GET /clubs/{id}/lineup`, com `complete: true`

#### Scenario: Jogador DOENTE não pode ser escolhido como titular
- **WHEN** o usuário tenta escolher um jogador `DOENTE` para uma vaga da escalação
- **THEN** a tela impede a escolha, sem oferecer esse jogador como opção válida para a vaga

#### Scenario: Escalação incompleta avisa que o clube não pode jogar
- **WHEN** um titular é vendido ou fica `DOENTE` e a escalação do clube fica incompleta
- **THEN** a tela mostra um aviso de que o clube não pode jogar enquanto a escalação não for
  refeita

### Requirement: Nova partida com placar e duelos (F13)
A tela Partidas SHALL permitir escolher o mandante e o visitante (`POST /matches`), exigindo os
dois campos antes de habilitar o envio. O resultado SHALL mostrar o placar e os 6 duelos devolvidos
pela API (atacante, defensor, atributos, valores e gol), sem recalcular. Quando um dos clubes não
tiver escalação completa, a tela SHALL enviar o pedido normalmente e mostrar o `message` da API,
sem bloquear o envio antecipadamente.

#### Scenario: Partida jogada mostra placar e os 6 duelos
- **WHEN** uma partida é jogada com sucesso entre dois clubes com escalação completa
- **THEN** a tela mostra o placar e os 6 duelos (atacante, defensor, atributos, valores e gol)
  exatamente como devolvidos pela API

#### Scenario: Escalação incompleta de um clube mostra o message ao tentar jogar
- **WHEN** o usuário tenta jogar uma partida envolvendo um clube sem escalação completa
- **THEN** a tela envia o pedido e mostra o `message` devolvido pela API quando ela recusar com
  `409`

### Requirement: Histórico de partidas e classificação (F14)
A tela de histórico de partidas SHALL mostrar data e hora, mandante, placar e visitante, da mais
recente para a mais antiga (`GET /matches`), com filtro por clube; abrir uma partida SHALL mostrar
os 6 duelos (`GET /matches/{id}`). A tela de classificação SHALL mostrar posição, clube, jogos,
vitórias, empates, derrotas, gols marcados, gols sofridos, saldo e pontos, na ordem devolvida por
`GET /standings`, sem reordenar nem recalcular na tela.

#### Scenario: Histórico filtrado por clube
- **WHEN** o usuário filtra o histórico de partidas por um clube
- **THEN** a tabela mostra só as partidas em que esse clube foi mandante ou visitante

#### Scenario: Abrir uma partida mostra os 6 duelos
- **WHEN** o usuário abre uma partida do histórico
- **THEN** a tela mostra os 6 duelos dessa partida, na mesma ordem devolvida pela API

#### Scenario: Classificação reflete a ordem da API sem recalcular
- **WHEN** a tela de classificação é aberta
- **THEN** os clubes aparecem na mesma posição e ordem devolvidas por `GET /standings`, inclusive
  os que nunca jogaram, sem a tela recalcular pontos, saldo ou posição
