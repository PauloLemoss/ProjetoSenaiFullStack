import { Link } from 'react-router-dom'
import { Avatar, DataTable } from '../../shared'
import { formatCurrency } from '../../lib/formatCurrency'
import { IconChevronRight, IconPencil } from '../../shared/Icon'

/**
 * Tabela de clubes (F05): coluna Clube com escudo (avatar da sigla) + nome,
 * sigla, caixa, valor do elenco e, na última coluna, o link "Ver clube" e o
 * ícone de editar (roeirotela.md, 3.1 "Lista de Clubes"). Patrimônio não
 * aparece aqui — fica nos cartões da página de detalhes do clube.
 */
export function ClubesTable({ clubs, state, errorMessage, onRetry, onEdit }) {
  const columns = [
    {
      key: 'name',
      header: 'Clube',
      render: (club) => (
        <div className="flex items-center gap-3">
          <Avatar
            label={club.acronym}
            seed={club.id}
            shape="square"
            size="sm"
          />
          <p className="font-semibold text-text">{club.name}</p>
        </div>
      ),
    },
    { key: 'acronym', header: 'Sigla' },
    {
      key: 'cash',
      header: 'Caixa',
      render: (club) => formatCurrency(club.cash),
    },
    {
      key: 'squad_value',
      header: 'Valor do elenco',
      render: (club) => formatCurrency(club.squad_value),
    },
    {
      key: 'actions',
      header: '',
      render: (club) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/clubes/${club.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver clube
            <IconChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            aria-label="Editar"
            onClick={() => onEdit(club)}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-surface text-text hover:bg-primary hover:text-white transition-colors"
            title="Editar"
          >
            <IconPencil className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={clubs}
      state={state}
      emptyMessage="Nenhum clube cadastrado."
      errorMessage={errorMessage || 'Não foi possível carregar os clubes.'}
      onRetry={onRetry}
    />
  )
}
