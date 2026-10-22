import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { DataTable } from '../../shared/DataTable'
import { PageHeader } from '../../shared/PageHeader'
import { IconAlertCircle, IconTrophy } from '../../shared/Icon'
import { useQuery } from '../../shared/useQuery'
import { formatDateTime } from '../../lib/formatDateTime'
import { getStandings, listMatches } from './api'

const ORDER_CRITERIA = [
  'Pontos (Pts)',
  'Saldo de gols (SG)',
  'Gols marcados (GM)',
  'Nome do clube (ordem alfabética)',
]

/**
 * Classificação da liga (F14, roeirotela.md 5.4): layout dividido — tabela
 * principal à esquerda (70%) e coluna lateral à direita (30%) com as
 * últimas partidas e a ordem de desempate. Só o 1º colocado ganha destaque
 * circular azul. Mostra posição, clube, jogos, vitórias, empates, derrotas,
 * gols marcados, gols sofridos, saldo e pontos, na ordem devolvida por
 * GET /standings — sem reordenar nem recalcular nada na tela.
 */
export function StandingPage() {
  const fetchStandings = useCallback(() => getStandings(), [])
  const {
    data: standings,
    state,
    errorMessage,
    reload,
  } = useQuery(fetchStandings, [])

  const fetchMatches = useCallback(() => listMatches(), [])
  const { data: matches, state: matchesState } = useQuery(fetchMatches, [])

  if (state === 'loading') {
    return (
      <section className="space-y-4">
        <div role="status" className="text-text-muted py-8 text-center">
          Carregando classificação…
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
            {errorMessage || 'Não foi possível carregar a classificação.'}
          </p>
          <button type="button" onClick={reload} className="btn-secondary mt-3">
            Tentar de novo
          </button>
        </div>
      </section>
    )
  }

  const recentMatches = (matchesState === 'ready' ? matches : []) ?? []

  return (
    <section className="space-y-4">
      <PageHeader
        icon={<IconTrophy className="w-6 h-6" />}
        title="Classificação"
        description="Acompanhe jogos, saldo e pontos de cada clube, na ordem devolvida pela API."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <DataTable
          columns={[
            {
              key: 'position',
              header: '#',
              render: (row) =>
                row.position === 1 ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white bg-primary">
                    {row.position}
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium text-text-muted bg-bg-muted">
                    {row.position}
                  </span>
                ),
            },
            {
              key: 'club_name',
              header: 'Clube',
              render: (row) => (
                <Link
                  to={`/clubes/${row.club_id}`}
                  className="text-primary hover:underline"
                >
                  {row.club_name}
                </Link>
              ),
            },
            { key: 'played', header: 'J' },
            { key: 'wins', header: 'V' },
            { key: 'draws', header: 'E' },
            { key: 'losses', header: 'D' },
            { key: 'goals_for', header: 'GP' },
            { key: 'goals_against', header: 'GC' },
            { key: 'goal_difference', header: 'SG' },
            { key: 'points', header: 'Pts' },
          ]}
          rows={standings ?? []}
          state="ready"
          emptyMessage="Nenhuma classificação encontrada."
          getRowKey={(row) => row.club_id}
        />

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <h2 className="text-sm font-semibold text-text">
              Últimas partidas
            </h2>
            {recentMatches.length === 0 ? (
              <p className="text-sm text-text-muted">
                Nenhuma partida registrada ainda.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentMatches.slice(0, 5).map((match) => (
                  <li
                    key={match.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-text truncate">
                      {match.home.club_name} {match.home.goals}×
                      {match.away.goals} {match.away.club_name}
                    </span>
                    <span className="text-xs text-text-muted shrink-0">
                      {formatDateTime(match.played_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
            <h2 className="text-sm font-semibold text-text">Ordem da tabela</h2>
            <p className="text-xs text-text-muted">
              Critérios de desempate, na ordem usada pela API:
            </p>
            <ol className="list-decimal list-inside text-sm text-text space-y-1">
              {ORDER_CRITERIA.map((criterion) => (
                <li key={criterion}>{criterion}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
