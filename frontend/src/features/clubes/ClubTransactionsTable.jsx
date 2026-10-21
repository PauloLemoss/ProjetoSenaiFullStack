import { useMemo, useState } from 'react'
import { DataTable } from '../../shared/DataTable'
import { useAsyncAction } from '../../shared/useAsyncAction'
import { formatCurrency } from '../../lib/formatCurrency'
import { formatDateTime } from '../../lib/formatDateTime'
import { exportClubTransactions } from '../mercado/api'

const TYPE_LABELS = {
  COMPRA: 'Compra',
  VENDA: 'Venda',
}

const TYPE_BADGE_CLASS = {
  COMPRA: 'bg-primary/10 text-primary',
  VENDA: 'bg-purple-100 text-purple-700',
}

function TypeBadge({ type }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        TYPE_BADGE_CLASS[type] ?? 'bg-bg-muted text-text-muted'
      }`}
    >
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

/**
 * Histórico de transações do clube (F09/F11): tabela com data/hora, tipo, jogador,
 * valor, taxa/comissão, multa, lucro e variação do caixa com sinal, totais do summary
 * e botão de exportação CSV.
 * Aceita filtro por tipo (um ou mais) e por jogador (apenas os que aparecem
 * no histórico do clube).
 * Estilizado com Tailwind (frontend-design-system).
 */
export function ClubTransactionsTable({
  clubId,
  transactions,
  summary,
  state,
  errorMessage,
  onRetry,
  filters,
  onFiltersChange,
}) {
  const [selectedTypes, setSelectedTypes] = useState(
    filters.type ? filters.type.split(',') : [],
  )
  const [selectedPlayerId, setSelectedPlayerId] = useState(
    filters.player_id ?? '',
  )

  const { run, isPending } = useAsyncAction((exportFilters) =>
    exportClubTransactions(clubId, exportFilters),
  )

  const players = useMemo(() => {
    const seen = new Set()
    return transactions.filter((t) => {
      if (seen.has(t.player_id)) return false
      seen.add(t.player_id)
      return true
    })
  }, [transactions])

  function handleTypeChange(type, checked) {
    const next = checked
      ? [...selectedTypes, type]
      : selectedTypes.filter((t) => t !== type)
    setSelectedTypes(next)
    onFiltersChange({ type: next.length > 0 ? next.join(',') : undefined })
  }

  function handlePlayerChange(event) {
    const value = event.target.value
    setSelectedPlayerId(value)
    onFiltersChange({ player_id: value === '' ? undefined : value })
  }

  async function handleExportCsv() {
    const blob = await run(filters)
    if (!(blob instanceof Blob)) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `historico-clube-${clubId}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      key: 'created_at',
      header: 'Data/Hora',
      render: (t) => formatDateTime(t.created_at),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (t) => <TypeBadge type={t.type} />,
    },
    { key: 'player_name', header: 'Jogador' },
    {
      key: 'value',
      header: 'Valor',
      render: (t) => formatCurrency(t.value),
    },
    {
      key: 'fee',
      header: 'Taxa / Comissão',
      render: (t) => formatCurrency(t.fee),
    },
    {
      key: 'penalty',
      header: 'Multa',
      render: (t) => formatCurrency(t.penalty),
    },
    {
      key: 'profit',
      header: 'Lucro',
      render: (t) =>
        t.profit !== null && t.profit !== undefined
          ? formatCurrency(t.profit)
          : '-',
    },
    {
      key: 'cash_change',
      header: 'Variação do caixa',
      render: (t) => {
        const formatted = formatCurrency(t.cash_change)
        return t.cash_change > 0 ? `+${formatted}` : formatted
      },
    },
  ]

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-text">
        Histórico de transações
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="club-transactions-filters flex flex-col sm:flex-row gap-3">
          <div className="club-transactions-filter-group flex items-center gap-2">
            <label className="text-xs font-semibold text-text-muted">
              Tipo
            </label>
            <div className="club-transactions-type-pills inline-flex gap-1">
              {['COMPRA', 'VENDA'].map((type) => (
                <label
                  key={type}
                  className={
                    selectedTypes.includes(type)
                      ? 'club-transactions-pill club-transactions-pill--active btn-primary text-xs px-2.5 py-1.5'
                      : 'club-transactions-pill btn-secondary text-xs px-2.5 py-1.5'
                  }
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={(event) =>
                      handleTypeChange(type, event.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <span className="peer-checked:font-semibold">
                    {TYPE_LABELS[type]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="club-transactions-filter-group flex flex-col sm:flex-row items-end gap-2">
            <label
              htmlFor="transactions-player"
              className="text-xs font-semibold text-text-muted"
            >
              Jogador
            </label>
            <select
              id="transactions-player"
              value={selectedPlayerId}
              onChange={handlePlayerChange}
              className="input-field"
            >
              <option value="">Todos os jogadores</option>
              {players.map((player) => (
                <option key={player.player_id} value={player.player_id}>
                  {player.player_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={isPending}
          className="btn-secondary text-sm"
        >
          {isPending ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={transactions}
        state={state}
        emptyMessage="Nenhuma transação encontrada."
        errorMessage={errorMessage || 'Não foi possível carregar o histórico.'}
        onRetry={onRetry}
      />

      <div className="sticky bottom-0 z-10 p-4 rounded-lg border border-border bg-surface shadow-[0_-2px_8px_rgba(0,0,0,0.04)] mt-4">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Totais (respeitando o filtro aplicado)
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <div className="club-transactions-summary-item flex justify-between">
            <dt className="text-xs text-text-muted">Total gasto em compras</dt>
            <dd className="text-sm font-semibold text-text">
              {formatCurrency(summary.total_spent)}
            </dd>
          </div>
          <div className="club-transactions-summary-item flex justify-between">
            <dt className="text-xs text-text-muted">
              Total recebido em vendas
            </dt>
            <dd className="text-sm font-semibold text-text">
              {formatCurrency(summary.total_received)}
            </dd>
          </div>
          <div className="club-transactions-summary-item flex justify-between">
            <dt className="text-xs text-text-muted">
              Total de taxas e comissões
            </dt>
            <dd className="text-sm font-semibold text-text">
              {formatCurrency(summary.total_fees)}
            </dd>
          </div>
          <div className="club-transactions-summary-item flex justify-between">
            <dt className="text-xs text-text-muted">Total de multas</dt>
            <dd className="text-sm font-semibold text-text">
              {formatCurrency(summary.total_penalties)}
            </dd>
          </div>
          <div className="club-transactions-summary-item flex justify-between">
            <dt className="text-xs text-text-muted">Lucro total</dt>
            <dd className="text-sm font-semibold text-text">
              {formatCurrency(summary.total_profit)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
