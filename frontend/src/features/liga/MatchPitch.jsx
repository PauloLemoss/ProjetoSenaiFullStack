import { Avatar } from '../../shared/Avatar'

const ATTRIBUTE_LABELS = {
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defending: 'Defesa',
}

/** Jogadores únicos de um clube que apareceram nos duelos (atacando ou defendendo). */
function collectSidePlayers(duels, clubId) {
  const seen = new Map()
  for (const duel of duels) {
    const isAttacker = duel.attacking_club_id === clubId
    const player = isAttacker ? duel.attacker : duel.defender
    if (!seen.has(player.player_id)) {
      seen.set(player.player_id, player)
    }
  }
  return Array.from(seen.values())
}

function PlayerChip({ player }) {
  return (
    <div className="flex flex-col items-center gap-1 w-20">
      <Avatar label={player.player_name} seed={player.player_id} size="sm" />
      <p className="text-xs text-white text-center leading-tight truncate w-full">
        {player.player_name}
      </p>
      <p className="text-[0.65rem] text-white/70 text-center leading-tight">
        {ATTRIBUTE_LABELS[player.attribute] ?? player.attribute} {player.value}
      </p>
    </div>
  )
}

/**
 * Campo em jogo: representação visual do campo com os jogadores das duas
 * equipas espelhados (mandante no topo, visitante embaixo) e a nota do
 * atributo usado por cada um nos duelos (roeirotela.md, 5.3 "Campo em
 * Jogo"). Mesma moldura (borda interna + círculo central) do campo usado na
 * escalação do clube (`ClubLineup.jsx`/`PitchPreview`), para as duas
 * representações de campo seguirem a mesma linguagem visual.
 */
export function MatchPitch({
  duels,
  homeClubId,
  homeClubName,
  awayClubId,
  awayClubName,
}) {
  const homePlayers = collectSidePlayers(duels, homeClubId)
  const awayPlayers = collectSidePlayers(duels, awayClubId)

  return (
    <div className="relative rounded-lg bg-emerald-800 border border-emerald-900 overflow-hidden">
      <div className="absolute inset-3 border border-white/25 rounded pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 border border-white/25 rounded-full pointer-events-none" />

      <div className="relative">
        <p className="px-3 pt-2 text-xs font-semibold text-white/80 uppercase tracking-wider">
          {homeClubName}
        </p>
        <div className="flex flex-wrap justify-center gap-3 p-3">
          {homePlayers.map((player) => (
            <PlayerChip key={player.player_id} player={player} />
          ))}
        </div>

        <div className="border-t border-white/30 mx-3" />

        <div className="flex flex-wrap justify-center gap-3 p-3">
          {awayPlayers.map((player) => (
            <PlayerChip key={player.player_id} player={player} />
          ))}
        </div>
        <p className="px-3 pb-2 text-xs font-semibold text-white/80 uppercase tracking-wider text-right">
          {awayClubName}
        </p>
      </div>
    </div>
  )
}
