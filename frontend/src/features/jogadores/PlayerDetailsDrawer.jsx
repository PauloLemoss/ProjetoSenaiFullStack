import { useCallback } from 'react'
import { Drawer } from '../../shared/Drawer'
import { Avatar } from '../../shared/Avatar'
import { ConditionBadge } from '../../shared/ConditionBadge'
import { ProgressBar, DualProgressBar } from '../../shared/ProgressBar'
import { useQuery } from '../../shared/useQuery'
import { formatCurrency } from '../../lib/formatCurrency'
import { getPlayer } from './api'
import { POSITIONS } from './constants'

const POSITION_LABEL = Object.fromEntries(
  POSITIONS.map((p) => [p.value, p.label]),
)

const TECHNICAL_ATTRIBUTES = [
  { key: 'pace', label: 'Velocidade' },
  { key: 'shooting', label: 'Finalização' },
  { key: 'passing', label: 'Passe' },
  { key: 'dribbling', label: 'Drible' },
  { key: 'defending', label: 'Defesa' },
  { key: 'physical', label: 'Físico' },
]

function SummaryCard({ label, value }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-surface">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-lg font-bold text-text">{value}</p>
    </div>
  )
}

/**
 * Drawer lateral direito com os detalhes completos do jogador (roeirotela.md,
 * 3.3 "Detalhes do Jogador"): avatar grande + badges, grid 2x2 de resumo,
 * barras duplas (valor atual sobre o teto de potencial) por indicador
 * técnico e rodapé fixo com as ações (Editar, Alterar condição, Comprar).
 */
export function PlayerDetailsDrawer({
  playerId,
  clubsById,
  onClose,
  onEdit,
  onChangeCondition,
  onBuy,
}) {
  const fetchFn = useCallback(() => getPlayer(playerId), [playerId])
  const { data: player, state, errorMessage } = useQuery(fetchFn, [playerId])

  if (state === 'loading') {
    return (
      <Drawer
        onClose={onClose}
        header={
          <h2 className="text-lg font-semibold text-text">
            Detalhes do jogador
          </h2>
        }
      >
        <p role="status" className="text-text-muted">
          Carregando…
        </p>
      </Drawer>
    )
  }

  if (state === 'error') {
    return (
      <Drawer
        onClose={onClose}
        header={
          <h2 className="text-lg font-semibold text-text">
            Detalhes do jogador
          </h2>
        }
      >
        <p role="alert" className="text-danger">
          {errorMessage}
        </p>
      </Drawer>
    )
  }

  const club = player.club_id ? clubsById?.[player.club_id] : null
  const isFree = player.club_id === null

  return (
    <Drawer
      onClose={onClose}
      header={
        <div className="flex items-center gap-3">
          <Avatar label={player.name} seed={player.id} size="md" />
          <h2 className="text-xl font-bold text-text truncate">
            {player.name}
          </h2>
        </div>
      }
      footer={
        <>
          {isFree && onBuy && (
            <button
              type="button"
              onClick={() => onBuy(player)}
              className="btn-primary"
            >
              Comprar
            </button>
          )}
          <button
            type="button"
            onClick={() => onChangeCondition(player)}
            className="btn-secondary"
          >
            Alterar condição
          </button>
          <button
            type="button"
            onClick={() => onEdit(player)}
            className="btn-secondary"
          >
            Editar
          </button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-bg-muted text-xs font-semibold text-text">
          {POSITION_LABEL[player.position] ?? player.position}
        </span>
        <ConditionBadge condition={player.condition} />
        <span className="text-xs text-text-muted">
          {club ? club.name : 'Jogador livre'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Valor de mercado"
          value={formatCurrency(player.market_value)}
        />
        <SummaryCard
          label="Valor base"
          value={formatCurrency(player.base_value)}
        />
        <SummaryCard label="Overall" value={player.overall} />
        <SummaryCard label="Potencial" value={player.potential} />
      </div>

      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Agilidade
        </p>
        <ProgressBar value={player.agility} max={100} />
      </div>

      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Indicadores técnicos
        </p>
        <div className="space-y-3">
          {TECHNICAL_ATTRIBUTES.map((attr) => (
            <div key={attr.key} className="flex items-center gap-3">
              <span className="text-xs text-text-muted w-24 shrink-0">
                {attr.label}
              </span>
              <DualProgressBar
                value={player[attr.key]}
                limit={player.potential}
                max={99}
              />
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  )
}
