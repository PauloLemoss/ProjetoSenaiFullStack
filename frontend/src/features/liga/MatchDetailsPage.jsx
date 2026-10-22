import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '../../shared/useQuery'
import { formatDateTime } from '../../lib/formatDateTime'
import { getMatch } from './api'
import { MatchPitch } from './MatchPitch'
import { MatchDuels } from './MatchDuels'
import { IconAlertCircle } from '../../shared/Icon'

const RESULT_LABELS = {
  MANDANTE: 'Vitória do mandante',
  VISITANTE: 'Vitória do visitante',
  EMPATE: 'Empate',
}

/**
 * Detalhes da partida (roeirotela.md, 5.3 "Tela: Detalhes da Partida —
 * Duelos"): botão de voltar no topo esquerdo, placar gigante centralizado
 * com os nomes dos clubes e a data, campo em jogo com os dois clubes
 * espelhados, e a tabela de duelos dividida por clube atacante.
 */
export function MatchDetailsPage() {
  const { matchId } = useParams()
  const fetchMatch = useCallback(() => getMatch(matchId), [matchId])
  const { data: match, state, errorMessage } = useQuery(fetchMatch, [matchId])

  if (state === 'loading') {
    return (
      <section className="space-y-4">
        <div role="status" className="text-text-muted py-8 text-center">
          Carregando partida…
        </div>
      </section>
    )
  }

  if (state === 'error') {
    return (
      <section className="space-y-4">
        <div
          role="alert"
          className="text-danger py-8 text-center rounded-md border border-border bg-danger-bg p-4"
        >
          <p className="flex items-center justify-center gap-2 font-medium">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage || 'Não foi possível carregar a partida.'}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <Link
        to="/partidas"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        ← Voltar para partidas
      </Link>

      <div className="rounded-xl border border-border bg-surface p-6 text-center space-y-2">
        <p className="text-sm text-text-muted">
          {formatDateTime(match.played_at)}
        </p>
        <div className="flex items-center justify-center gap-6">
          <p className="text-lg font-semibold text-text flex-1 text-right">
            {match.home.club_name}
          </p>
          <p className="text-4xl font-bold text-text tabular-nums">
            {match.home.goals} × {match.away.goals}
          </p>
          <p className="text-lg font-semibold text-text flex-1 text-left">
            {match.away.club_name}
          </p>
        </div>
        <p className="text-sm text-text-muted">
          {RESULT_LABELS[match.result] ?? match.result}
        </p>
      </div>

      <MatchPitch
        duels={match.duels}
        homeClubId={match.home.club_id}
        homeClubName={match.home.club_name}
        awayClubId={match.away.club_id}
        awayClubName={match.away.club_name}
      />

      <MatchDuels
        duels={match.duels}
        homeClubId={match.home.club_id}
        homeClubName={match.home.club_name}
        awayClubName={match.away.club_name}
      />
    </section>
  )
}
