import {
  IconChevronDown,
  IconCoin,
  IconFilter,
  IconSearch,
  IconShield,
  IconSort,
  IconUser,
} from '../../shared/Icon'
import { FilterChip } from '../../shared/FilterChip'
import {
  AGE_RANGES,
  CONDITIONS,
  POSITIONS,
  SORT_OPTIONS,
  VALUE_RANGES,
} from './constants'
import { usePlayersTabCounts } from './usePlayersTabCounts'

const POSITION_LABEL = Object.fromEntries(
  POSITIONS.map((position) => [position.value, position.label]),
)
const CONDITION_LABEL = Object.fromEntries(
  CONDITIONS.map((condition) => [condition.value, condition.label]),
)

const FREE_TABS = [
  { value: undefined, label: 'Todos', countKey: 'all' },
  { value: true, label: 'Livres', countKey: 'free' },
  { value: false, label: 'Em clubes', countKey: 'clubbed' },
]

/** Dropdown em formato de pill: ícone, `<select>` nativo e seta. */
function FilterPill({ icon: IconComp, children }) {
  return (
    <div className="relative inline-flex items-center gap-1.5 pl-3 pr-7 py-1.5 rounded-full border border-border bg-surface text-sm text-text">
      <IconComp className="w-4 h-4 text-text-muted shrink-0" />
      {children}
      <IconChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0 absolute right-2.5 pointer-events-none" />
    </div>
  )
}

const PILL_SELECT_CLASS =
  'appearance-none bg-transparent focus:outline-none text-sm max-w-[9.5rem] pr-1'

/**
 * Busca, filtros combináveis e ordenação da listagem de jogadores (F02).
 * "Livres" e o filtro por clube nunca ficam ativos ao mesmo tempo: escolher
 * "Livres" desabilita e limpa o clube (frontend-conventions, "Recusas
 * previsíveis podem ser impedidas antes do envio").
 * Barra de ferramentas em formato de pills com ícone (frontend-design-system)
 * e abas com contagem por total já devolvido pela API
 * (frontend-jogadores-visual, "Abas com contagem").
 */
export function PlayersFilters({ filters, onChange, clubs, onClear }) {
  const counts = usePlayersTabCounts(filters)
  const isFreeTabActive = (value) => filters.free === value

  function handleFreeTabClick(value) {
    onChange({
      free: value,
      club_id: value === true ? undefined : filters.club_id,
      page: 1,
    })
  }

  function handleFieldChange(field, value) {
    onChange({ [field]: value === '' ? undefined : value, page: 1 })
  }

  function handleAgeRangeChange(value) {
    const range = AGE_RANGES.find((item) => item.value === value)
    onChange({ min_age: range?.min_age, max_age: range?.max_age, page: 1 })
  }

  function handleValueRangeChange(value) {
    const range = VALUE_RANGES.find((item) => item.value === value)
    onChange({
      min_value: range?.min_value,
      max_value: range?.max_value,
      page: 1,
    })
  }

  const selectedAgeRange =
    AGE_RANGES.find(
      (range) =>
        String(range.min_age) === String(filters.min_age ?? '') &&
        String(range.max_age ?? '') === String(filters.max_age ?? ''),
    )?.value ?? ''

  const selectedValueRange =
    VALUE_RANGES.find(
      (range) =>
        String(range.min_value) === String(filters.min_value ?? '') &&
        String(range.max_value ?? '') === String(filters.max_value ?? ''),
    )?.value ?? ''

  const hasActiveFilters =
    filters.search ||
    filters.position ||
    filters.condition ||
    filters.free !== undefined ||
    filters.club_id ||
    filters.min_age ||
    filters.max_age ||
    filters.min_value ||
    filters.max_value

  const selectedClubName = clubs.find(
    (club) => String(club.id) === String(filters.club_id),
  )?.name

  const chips = []
  if (filters.search) {
    chips.push({
      key: 'search',
      label: `Busca: ${filters.search}`,
      onRemove: () => onChange({ search: undefined, page: 1 }),
    })
  }
  if (filters.position) {
    chips.push({
      key: 'position',
      label: `Posição: ${POSITION_LABEL[filters.position] ?? filters.position}`,
      onRemove: () => onChange({ position: undefined, page: 1 }),
    })
  }
  if (filters.condition) {
    chips.push({
      key: 'condition',
      label: `Condição: ${CONDITION_LABEL[filters.condition] ?? filters.condition}`,
      onRemove: () => onChange({ condition: undefined, page: 1 }),
    })
  }
  if (filters.club_id) {
    chips.push({
      key: 'club',
      label: `Clube: ${selectedClubName ?? filters.club_id}`,
      onRemove: () => onChange({ club_id: undefined, page: 1 }),
    })
  }
  if (filters.min_age || filters.max_age) {
    const range = AGE_RANGES.find((item) => item.value === selectedAgeRange)
    chips.push({
      key: 'age',
      label: `Idade: ${range?.label ?? `${filters.min_age || '—'} a ${filters.max_age || '—'}`}`,
      onRemove: () =>
        onChange({ min_age: undefined, max_age: undefined, page: 1 }),
    })
  }
  if (filters.min_value || filters.max_value) {
    const range = VALUE_RANGES.find((item) => item.value === selectedValueRange)
    chips.push({
      key: 'value',
      label: `Valor: ${range?.label ?? `${filters.min_value || '—'} a ${filters.max_value || '—'}`}`,
      onRemove: () =>
        onChange({ min_value: undefined, max_value: undefined, page: 1 }),
    })
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <IconSearch className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar por nome"
            aria-label="Buscar por nome"
            value={filters.search ?? ''}
            onChange={(event) =>
              handleFieldChange('search', event.target.value)
            }
            className="w-full pl-9 pr-3 py-2 rounded-full border border-border bg-surface text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterPill icon={IconFilter}>
            <select
              aria-label="Posição"
              value={filters.position ?? ''}
              onChange={(event) =>
                handleFieldChange('position', event.target.value)
              }
              className={PILL_SELECT_CLASS}
            >
              <option value="">Posição</option>
              {POSITIONS.map((position) => (
                <option key={position.value} value={position.value}>
                  {position.label}
                </option>
              ))}
            </select>
          </FilterPill>

          <FilterPill icon={IconFilter}>
            <select
              aria-label="Condição"
              value={filters.condition ?? ''}
              onChange={(event) =>
                handleFieldChange('condition', event.target.value)
              }
              className={PILL_SELECT_CLASS}
            >
              <option value="">Condição</option>
              {CONDITIONS.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </FilterPill>

          <FilterPill icon={IconShield}>
            <select
              aria-label="Clube"
              value={filters.club_id ?? ''}
              disabled={filters.free === true}
              title={
                filters.free === true
                  ? 'Não é possível filtrar por clube com "Livres"'
                  : undefined
              }
              onChange={(event) =>
                handleFieldChange('club_id', event.target.value)
              }
              className={`${PILL_SELECT_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <option value="">Clube</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </FilterPill>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterPill icon={IconUser}>
          <select
            aria-label="Idade"
            value={selectedAgeRange}
            onChange={(event) => handleAgeRangeChange(event.target.value)}
            className={PILL_SELECT_CLASS}
          >
            <option value="">Idade</option>
            {AGE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </FilterPill>

        <FilterPill icon={IconCoin}>
          <select
            aria-label="Valor"
            value={selectedValueRange}
            onChange={(event) => handleValueRangeChange(event.target.value)}
            className={PILL_SELECT_CLASS}
          >
            <option value="">Valor</option>
            {VALUE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </FilterPill>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              onRemove={chip.onRemove}
            />
          ))}
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-primary hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border">
        <div
          className="inline-flex gap-1 p-1 rounded-full bg-bg-muted"
          role="tablist"
          aria-label="Filtrar por clube ou livre"
        >
          {FREE_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={isFreeTabActive(tab.value)}
              onClick={() => handleFreeTabClick(tab.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isFreeTabActive(tab.value)
                  ? 'bg-surface text-text shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {tab.label}
              {counts[tab.countKey] !== null && (
                <span className="ml-1.5 tabular-nums">
                  {counts[tab.countKey]}
                </span>
              )}
            </button>
          ))}
        </div>

        <FilterPill icon={IconSort}>
          <select
            aria-label="Ordenar"
            value={filters.sort ?? ''}
            onChange={(event) => handleFieldChange('sort', event.target.value)}
            className={PILL_SELECT_CLASS}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Ordenar: {option.label}
              </option>
            ))}
          </select>
        </FilterPill>
      </div>
    </div>
  )
}
