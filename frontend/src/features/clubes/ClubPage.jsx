import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ClubSquadTable } from './ClubSquadTable'
import { ClubTransactionsTable } from './ClubTransactionsTable'
import { ClubLineup } from './ClubLineup'
import { useClub } from './useClub'
import { useClubTransactions } from './useClubTransactions'
import { useClubLineup } from './useClubLineup'
import { SellPlayerModal } from '../mercado/SellPlayerModal'
import { formatCurrency } from '../../lib/formatCurrency'
import { Tabs } from '../../shared/Tabs'
import { IconAlertCircle } from '../../shared/Icon'

const TABS = [
  { value: 'elenco', label: 'Elenco' },
  { value: 'escalacao', label: 'Escalação' },
  { value: 'historico', label: 'Histórico' },
]

function SummaryCard({ label, value }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-surface">
      <p className="text-xs font-semibold text-text-muted">{label}</p>
      <p className="text-base font-semibold text-text">{value}</p>
    </div>
  )
}

/**
 * Visão geral do clube com navegação interna em abas — Elenco, Escalação e
 * Histórico (roeirotela.md, 3.3 "Detalhes do Clube"). Os indicadores (grid
 * 2x2: Caixa, Valor do elenco, Patrimônio, Elenco) e o aviso de escalação
 * incompleta ficam visíveis em qualquer aba.
 */
export function ClubPage() {
  const { clubId } = useParams()
  const { club, state, errorMessage, reload } = useClub(clubId)
  const [modal, setModal] = useState(null)
  const [transactionFilters, setTransactionFilters] = useState({})
  const [activeTab, setActiveTab] = useState('elenco')

  const {
    transactions,
    summary,
    state: txState,
    errorMessage: txError,
    reload: txReload,
  } = useClubTransactions(clubId, transactionFilters)

  const {
    lineup,
    state: lineupState,
    errorMessage: _lineupError,
    reload: lineupReload,
  } = useClubLineup(clubId)

  function closeModal() {
    setModal(null)
  }

  function handleSell(player) {
    setModal({ type: 'sell', player })
  }

  function updateTransactionFilters(partial) {
    setTransactionFilters((previous) => ({ ...previous, ...partial }))
  }

  if (state === 'loading') {
    return (
      <section className="space-y-6">
        <div role="status" className="text-text-muted py-8 text-center">
          Carregando…
        </div>
      </section>
    )
  }

  if (state === 'error') {
    return (
      <section className="space-y-6">
        <div
          role="alert"
          className="text-danger py-8 text-center rounded-md border border-border bg-danger-bg p-4"
        >
          <p className="flex items-center justify-center gap-2 font-medium">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage || 'Não foi possível carregar o clube.'}
          </p>
          <button type="button" onClick={reload} className="btn-secondary mt-3">
            Tentar de novo
          </button>
        </div>
      </section>
    )
  }

  if (!club) {
    return (
      <section className="space-y-6">
        <div role="status" className="text-text-muted py-8 text-center">
          Clube não encontrado.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          to="/clubes"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          ← Voltar aos clubes
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">{club.name}</h1>
          <p className="text-text-muted">Sigla: {club.acronym}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="Caixa" value={formatCurrency(club.cash)} />
        <SummaryCard
          label="Valor do elenco"
          value={formatCurrency(club.squad_value)}
        />
        <SummaryCard
          label="Patrimônio"
          value={formatCurrency(club.net_worth)}
        />
        <SummaryCard label="Elenco" value={(club.players ?? []).length} />
      </div>

      {lineupState === 'ready' && lineup && !lineup.complete && (
        <p
          role="status"
          className="p-3 rounded-md border border-warning bg-warning-bg text-warning"
        >
          Este clube não pode jogar: a escalação está incompleta. Escale
          titulares para todas as vagas e salve.
        </p>
      )}

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'elenco' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">Elenco</h2>
          <ClubSquadTable players={club.players ?? []} onSell={handleSell} />
        </div>
      )}

      {activeTab === 'escalacao' && (
        <>
          {lineupState === 'loading' && (
            <p role="status" className="text-text-muted py-4 text-center">
              Carregando escalação…
            </p>
          )}

          {lineupState === 'error' && (
            <div
              role="alert"
              className="text-danger py-4 text-center rounded-md border border-border bg-danger-bg p-4"
            >
              <p className="flex items-center justify-center gap-2 font-medium">
                <IconAlertCircle className="w-4 h-4 shrink-0" />
                {_lineupError || 'Não foi possível carregar a escalação.'}
              </p>
            </div>
          )}

          {lineupState === 'ready' && (
            <ClubLineup
              clubId={clubId}
              players={club.players ?? []}
              lineup={lineup}
              reload={lineupReload}
            />
          )}
        </>
      )}

      {activeTab === 'historico' && (
        <ClubTransactionsTable
          clubId={clubId}
          transactions={transactions}
          summary={summary}
          state={txState}
          errorMessage={txError}
          onRetry={txReload}
          filters={transactionFilters}
          onFiltersChange={updateTransactionFilters}
        />
      )}

      {modal?.type === 'sell' && (
        <SellPlayerModal
          player={modal.player}
          onClose={closeModal}
          onSold={() => {
            closeModal()
            reload()
          }}
        />
      )}
    </section>
  )
}
