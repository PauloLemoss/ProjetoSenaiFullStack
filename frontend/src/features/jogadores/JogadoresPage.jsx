import { useMemo, useState } from 'react'
import { PageHeader } from '../../shared/PageHeader'
import { IconPlus, IconUsers } from '../../shared/Icon'
import { useClubsList } from '../clubes/useClubsList'
import { PlayerConditionModal } from './PlayerConditionModal'
import { PlayerCreateModal } from './PlayerCreateModal'
import { PlayerDetailsDrawer } from './PlayerDetailsDrawer'
import { DeletePlayerModal } from './DeletePlayerModal'
import { PlayerEditModal } from './PlayerEditModal'
import { BuyPlayerModal } from '../mercado/BuyPlayerModal'
import { PlayersFilters } from './PlayersFilters'
import { PlayersTable } from './PlayersTable'
import { PAGE_SIZE } from './constants'
import { usePlayersList } from './usePlayersList'

const INITIAL_FILTERS = { page: 1, limit: PAGE_SIZE }

export function JogadoresPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [modal, setModal] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const { players, meta, state, errorMessage, reload } = usePlayersList(filters)
  const { clubs } = useClubsList()
  const clubsById = useMemo(
    () => Object.fromEntries(clubs.map((club) => [club.id, club])),
    [clubs],
  )

  function updateFilters(partial) {
    setFilters((previous) => ({ ...previous, ...partial }))
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS)
  }

  function closeModal() {
    setModal(null)
  }

  function announceSuccess(message) {
    setSuccessMessage(message)
    reload()
  }

  const page = meta.page ?? filters.page ?? 1
  const totalPages = meta.total_pages ?? 0

  return (
    <section className="space-y-4">
      <PageHeader
        icon={<IconUsers className="w-6 h-6" />}
        title="Jogadores"
        description="Cadastre jogadores, acompanhe os indicadores e compre os que estão livres."
        action={
          <button
            type="button"
            onClick={() => setModal({ type: 'create' })}
            className="btn-primary gap-1.5"
          >
            <IconPlus className="w-4 h-4" />
            Novo jogador
          </button>
        }
      />

      {successMessage && (
        <p
          role="status"
          className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium bg-success-bg text-success"
        >
          {successMessage}
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            aria-label="Fechar mensagem"
            className="ml-2 rounded text-success hover:bg-success/20"
          >
            ×
          </button>
        </p>
      )}

      <PlayersFilters
        filters={filters}
        onChange={updateFilters}
        clubs={clubs}
        onClear={clearFilters}
      />

      <PlayersTable
        players={players}
        clubsById={clubsById}
        state={state}
        errorMessage={errorMessage}
        onRetry={reload}
        onEdit={(player) => setModal({ type: 'edit', player })}
        onChangeCondition={(player) => setModal({ type: 'condition', player })}
        onDelete={(player) => setModal({ type: 'delete', player })}
        onBuy={(player) => setModal({ type: 'buy', player })}
        onViewDetails={(player) => setModal({ type: 'details', player })}
        onClearFilters={clearFilters}
      />

      {state === 'ready' && players.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-text-muted">
          <p>
            Mostrando {(page - 1) * PAGE_SIZE + 1}–
            {(page - 1) * PAGE_SIZE + players.length} de {meta.total_items}{' '}
            jogadores
          </p>
          <div className="flex items-center gap-3">
            {totalPages > 2 && (
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => updateFilters({ page: 1 })}
                className="btn-secondary text-xs"
              >
                Primeira página
              </button>
            )}
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateFilters({ page: page - 1 })}
              className="btn-secondary text-xs"
            >
              Anterior
            </button>
            <span>
              Página {page} de {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => updateFilters({ page: page + 1 })}
              className="btn-secondary text-xs"
            >
              Próxima
            </button>
            {totalPages > 2 && (
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => updateFilters({ page: totalPages })}
                className="btn-secondary text-xs"
              >
                Última página
              </button>
            )}
          </div>
        </div>
      )}

      {modal?.type === 'create' && (
        <PlayerCreateModal
          onClose={closeModal}
          onCreated={() => announceSuccess('Jogador cadastrado com sucesso.')}
        />
      )}
      {modal?.type === 'edit' && (
        <PlayerEditModal
          player={modal.player}
          onClose={closeModal}
          onUpdated={() => announceSuccess('Jogador atualizado com sucesso.')}
        />
      )}
      {modal?.type === 'condition' && (
        <PlayerConditionModal
          player={modal.player}
          onClose={closeModal}
          onUpdated={() => announceSuccess('Condição alterada com sucesso.')}
        />
      )}
      {modal?.type === 'delete' && (
        <DeletePlayerModal
          player={modal.player}
          onClose={closeModal}
          onDeleted={() => announceSuccess('Jogador excluído com sucesso.')}
        />
      )}
      {modal?.type === 'buy' && (
        <BuyPlayerModal
          player={modal.player}
          clubs={clubs}
          onClose={closeModal}
          onBought={() => announceSuccess('Jogador comprado com sucesso.')}
        />
      )}
      {modal?.type === 'details' && (
        <PlayerDetailsDrawer
          playerId={modal.player.id}
          clubsById={clubsById}
          onClose={closeModal}
          onEdit={(player) => setModal({ type: 'edit', player })}
          onChangeCondition={(player) =>
            setModal({ type: 'condition', player })
          }
          onBuy={(player) => setModal({ type: 'buy', player })}
        />
      )}
    </section>
  )
}
