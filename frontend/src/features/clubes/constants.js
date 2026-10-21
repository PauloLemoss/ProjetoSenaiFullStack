export const POSITIONS = [
  { value: 'GOL', label: 'Goleiro' },
  { value: 'ZAG', label: 'Zagueiro' },
  { value: 'LAT', label: 'Lateral' },
  { value: 'MEI', label: 'Meio-campo' },
  { value: 'ATA', label: 'Atacante' },
]

export const SORT_OPTIONS = [
  { value: 'name', label: 'Nome' },
  { value: 'net_worth_desc', label: 'Patrimônio (maior para menor)' },
  { value: 'net_worth_asc', label: 'Patrimônio (menor para maior)' },
]

/** Limite de clubes da liga (backend/src/mercado_jogadores/clubes/service.py, LIMITE_DE_CLUBES). */
export const MAX_CLUBS = 20
