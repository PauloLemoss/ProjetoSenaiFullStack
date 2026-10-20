import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, ConditionBadge, DataTable, ProgressBar } from '../../shared'
import { formatCurrency } from '../../lib/formatCurrency'
import { IconDotsHorizontal } from '../../shared/Icon'
import { POSITIONS } from './constants'

const POSITION_LABEL = Object.fromEntries(
  POSITIONS.map((p) => [p.value, p.label]),
)

function MenuItem({ children, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-bg-muted ${
        danger ? 'text-danger' : 'text-text'
      }`}
    >
      {children}
    </button>
  )
}

/**
 * Menu "..." com todas as ações da linha (Ver detalhes, Editar, Alterar
 * condição, Comprar, Excluir), substituindo o `<details>`/`<summary>` nativo
 * por um menu suspenso controlado em React (roeirotela.md, 2.1 "Ações do
 * Jogador — Dropdown Menu (Kebab)"). Comprar e Excluir só aparecem para
 * jogador livre. Fecha ao clicar fora ou pressionar Escape.
 */
function ActionsMenu({
  player,
  onViewDetails,
  onEdit,
  onChangeCondition,
  onBuy,
  onDelete,
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const isFree = player.club_id === null

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function runAndClose(action) {
    setOpen(false)
    action(player)
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        aria-label="Mais ações"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((previous) => !previous)
        }}
        className="flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:bg-bg-muted hover:text-text"
      >
        <IconDotsHorizontal />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1.5 min-w-[180px] rounded-lg shadow-lg border border-border bg-surface z-10 py-1"
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          <MenuItem onClick={() => runAndClose(onViewDetails)}>
            Ver detalhes
          </MenuItem>
          <MenuItem onClick={() => runAndClose(onEdit)}>Editar</MenuItem>
          <MenuItem onClick={() => runAndClose(onChangeCondition)}>
            Alterar condição
          </MenuItem>
          {isFree && onBuy && (
            <MenuItem onClick={() => runAndClose(onBuy)}>Comprar</MenuItem>
          )}
          {isFree && (
            <MenuItem danger onClick={() => runAndClose(onDelete)}>
              Excluir
            </MenuItem>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Tabela de jogadores (F01) com todas as ações de linha concentradas num
 * menu kebab (F03, F04): ver detalhes, editar, alterar condição, comprar e
 * excluir (roeirotela.md, 2.1). Primeira coluna com avatar + nome + posição
 * por extenso; agilidade como barra de progresso; clube com selo de sigla
 * (frontend-jogadores-visual, "Tabela de jogadores").
 */
export function PlayersTable({
  players,
  clubsById,
  state,
  errorMessage,
  onRetry,
  onEdit,
  onChangeCondition,
  onDelete,
  onBuy,
  onViewDetails,
  onClearFilters,
}) {
  const columns = [
    {
      key: 'name',
      header: 'Jogador',
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar label={p.name} seed={p.id} />
          <div className="min-w-0">
            <p className="font-semibold text-text truncate">{p.name}</p>
            <p className="text-xs text-text-muted truncate">
              {POSITION_LABEL[p.position] ?? p.position}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'position', header: 'Posição' },
    {
      key: 'overall',
      header: 'Overall',
      render: (p) => (
        <span className="font-semibold text-text">{p.overall}</span>
      ),
    },
    {
      key: 'agility',
      header: 'Agilidade',
      render: (p) => <ProgressBar value={p.agility} />,
    },
    { key: 'age', header: 'Idade' },
    {
      key: 'condition',
      header: 'Condição',
      render: (p) => <ConditionBadge condition={p.condition} />,
    },
    {
      key: 'base_value',
      header: 'Valor base',
      render: (p) => formatCurrency(p.base_value),
    },
    {
      key: 'market_value',
      header: 'Valor de mercado',
      render: (p) => (
        <span className="font-semibold text-text">
          {formatCurrency(p.market_value)}
        </span>
      ),
    },
    {
      key: 'club',
      header: 'Clube',
      render: (p) =>
        p.club_id ? (
          <div className="flex items-center gap-2">
            <Avatar
              label={clubsById[p.club_id]?.acronym ?? '—'}
              seed={p.club_id}
              shape="square"
              size="xs"
            />
            <Link
              to={`/clubes/${p.club_id}`}
              className="text-primary hover:underline"
            >
              {clubsById[p.club_id]?.name ?? `Clube #${p.club_id}`}
            </Link>
          </div>
        ) : (
          <span className="text-text-muted">Livre</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (player) => (
        <div className="flex items-center justify-end">
          <ActionsMenu
            player={player}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onChangeCondition={onChangeCondition}
            onBuy={onBuy}
            onDelete={onDelete}
          />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={players}
      state={state}
      emptyMessage="Nenhum jogador encontrado."
      emptyDescription="Ajuste os filtros aplicados ou cadastre um novo jogador."
      emptyActionLabel={onClearFilters ? 'Limpar filtros' : undefined}
      onEmptyAction={onClearFilters}
      errorMessage={errorMessage || 'Não foi possível carregar os jogadores.'}
      onRetry={onRetry}
    />
  )
}
