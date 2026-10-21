import { ConditionBadge, DataTable } from '../../shared'
import { formatCurrency } from '../../lib/formatCurrency'
import { formatDateTime } from '../../lib/formatDateTime'
import { POSITIONS } from './constants'

const POSITION_LABEL = Object.fromEntries(
  POSITIONS.map((p) => [p.value, p.label]),
)

/**
 * Elenco do clube (F07): cada jogador mostra valor de mercado e as colunas do
 * contrato — fim da fidelidade, dias restantes e percentual de multa — todos
 * vindos da API, sem recalcular na tela.
 */
export function ClubSquadTable({ players, onSell }) {
  const columns = [
    { key: 'name', header: 'Jogador' },
    {
      key: 'position',
      header: 'Posição',
      render: (p) => POSITION_LABEL[p.position] ?? p.position,
    },
    {
      key: 'condition',
      header: 'Condição',
      render: (p) => <ConditionBadge condition={p.condition} />,
    },
    {
      key: 'market_value',
      header: 'Valor de mercado',
      render: (p) => formatCurrency(p.market_value),
    },
    {
      key: 'loyalty_until',
      header: 'Fim da fidelidade',
      render: (p) => formatDateTime(p.contract?.loyalty_until),
    },
    {
      key: 'remaining_days',
      header: 'Dias restantes',
      render: (p) => (p.contract ? p.contract.remaining_days : '-'),
    },
    {
      key: 'penalty_rate',
      header: '% multa',
      render: (p) => (p.contract ? `${p.contract.penalty_rate}%` : '-'),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (player) => (
        <button
          type="button"
          onClick={() => onSell(player)}
          disabled={!player.contract}
          className="btn-danger text-xs px-2 py-1"
        >
          {player.contract ? 'Vender' : 'Sem contrato'}
        </button>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={players}
      state="ready"
      emptyMessage="Este clube ainda não tem jogadores no elenco."
    />
  )
}
