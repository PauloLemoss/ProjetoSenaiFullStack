import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormField } from '../../shared/FormField'
import { useQuery } from '../../shared/useQuery'
import { DataTable } from '../../shared/DataTable'
import { PageHeader } from '../../shared/PageHeader'
import { IconAlertCircle, IconCalendar, IconPlus } from '../../shared/Icon'
import { formatDateTime } from '../../lib/formatDateTime'
import { listMatches } from './api'
import { listClubs } from '../clubes/api'
import { NewMatchModal } from './NewMatchModal'

const RESULT_LABELS = {
  MANDANTE: 'Mandante',
  VISITANTE: 'Visitante',
  EMPATE: 'Empate',
}

/**
 * Partidas e histórico (F13/F14, roeirotela.md 5.1): botão "Nova partida"
 * abre a modal de criação (5.2); card grande com o placar da última
 * partida; filtro por clube; tabela de histórico com link "Ver duelos" para
 * a tela dedicada de cada partida (5.3).
 */
export function MatchPage() {
  const navigate = useNavigate()
  const fetchClubs = useCallback(() => listClubs(), [])
  const {
    data: clubs,
    state,
    errorMessage,
    reload: reloadClubs,
  } = useQuery(fetchClubs, [])
  const [creatingMatch, setCreatingMatch] = useState(false)

  const [historyFilter, setHistoryFilter] = useState('')
  const fetchMatches = useCallback(
    () => listMatches(historyFilter || undefined),
    [historyFilter],
  )
  const {
    data: matches,
    state: matchesState,
    errorMessage: matchesError,
    reload: reloadMatches,
  } = useQuery(fetchMatches, [historyFilter])

  function handleMatchCreated(match) {
    setCreatingMatch(false)
    reloadMatches()
    navigate(`/partidas/${match.id}`)
  }

  if (state === 'loading') {
    return (
      <section className="space-y-4">
        <div role="status" className="text-text-muted py-8 text-center">
          Carregando clubes…
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
            {errorMessage || 'Não foi possível carregar os clubes.'}
          </p>
          <button
            type="button"
            onClick={reloadClubs}
            className="btn-secondary mt-3"
          >
            Tentar de novo
          </button>
        </div>
      </section>
    )
  }

  const lastMatch =
    matchesState === 'ready' && matches && matches.length > 0
      ? matches[0]
      : null

  return (
    <section className="space-y-6">
      <PageHeader
        icon={<IconCalendar className="w-6 h-6" />}
        title="Partidas"
        description="Jogue partidas e acompanhe o histórico e os duelos de cada uma."
        action={
          <button
            type="button"
            onClick={() => setCreatingMatch(true)}
            className="btn-primary gap-1.5"
          >
            <IconPlus className="w-4 h-4" />
            Nova partida
          </button>
        }
      />

      {lastMatch && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center space-y-1">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Última partida
          </p>
          <div className="flex items-center justify-center gap-6">
            <p className="text-base font-semibold text-text flex-1 text-right">
              {lastMatch.home.club_name}
            </p>
            <p className="text-3xl font-bold text-text tabular-nums">
              {lastMatch.home.goals} × {lastMatch.away.goals}
            </p>
            <p className="text-base font-semibold text-text flex-1 text-left">
              {lastMatch.away.club_name}
            </p>
          </div>
          <p className="text-xs text-text-muted">
            {formatDateTime(lastMatch.played_at)}
          </p>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">
          Histórico de partidas
        </h2>

        <div className="w-full sm:w-auto">
          <FormField id="match-history-club" label="Filtrar por clube">
            <select
              id="match-history-club"
              value={historyFilter}
              onChange={(event) => setHistoryFilter(event.target.value)}
              className="input-field"
            >
              <option value="">Todos os clubes</option>
              {(clubs ?? []).map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <DataTable
          columns={[
            {
              key: 'played_at',
              header: 'Data/Hora',
              render: (row) => formatDateTime(row.played_at),
            },
            {
              key: 'home.club_name',
              header: 'Mandante',
              render: (row) => row.home.club_name,
            },
            {
              key: 'home.goals',
              header: 'Placar',
              render: (row) => `${row.home.goals} x ${row.away.goals}`,
            },
            {
              key: 'away.club_name',
              header: 'Visitante',
              render: (row) => row.away.club_name,
            },
            {
              key: 'result',
              header: 'Resultado',
              render: (row) => RESULT_LABELS[row.result] ?? row.result,
            },
            {
              key: 'action',
              header: '',
              render: (row) => (
                <Link
                  to={`/partidas/${row.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ver duelos ›
                </Link>
              ),
            },
          ]}
          rows={matches ?? []}
          state={matchesState}
          emptyMessage="Nenhuma partida encontrada."
          errorMessage={
            matchesError || 'Não foi possível carregar as partidas.'
          }
          onRetry={reloadMatches}
          getRowKey={(row) => row.id}
        />
      </section>

      {creatingMatch && (
        <NewMatchModal
          clubs={clubs ?? []}
          onClose={() => setCreatingMatch(false)}
          onCreated={handleMatchCreated}
        />
      )}
    </section>
  )
}
