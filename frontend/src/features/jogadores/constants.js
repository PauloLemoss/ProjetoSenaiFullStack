export const POSITIONS = [
  { value: 'GOL', label: 'Goleiro' },
  { value: 'ZAG', label: 'Zagueiro' },
  { value: 'LAT', label: 'Lateral' },
  { value: 'MEI', label: 'Meio-campo' },
  { value: 'ATA', label: 'Atacante' },
]

export const CONDITIONS = [
  { value: 'APTO', label: 'Apto' },
  { value: 'MAL_CONDICIONADO', label: 'Mal condicionado' },
  { value: 'DOENTE', label: 'Doente' },
]

export const SORT_OPTIONS = [
  { value: '', label: 'Nome' },
  { value: 'value_desc', label: 'Maior valor de mercado' },
  { value: 'value_asc', label: 'Menor valor de mercado' },
  { value: 'age_asc', label: 'Menor idade' },
  { value: 'age_desc', label: 'Maior idade' },
  { value: 'position', label: 'Posição' },
]

export const PAGE_SIZE = 10

/**
 * Faixas de idade do filtro (roeirotela.md, 2.1 "Filtro: Idade — Select").
 * Cobrem o intervalo de cadastro válido (16 a 45 anos).
 */
export const AGE_RANGES = [
  { value: '16-20', label: '16 a 20 anos', min_age: 16, max_age: 20 },
  { value: '21-25', label: '21 a 25 anos', min_age: 21, max_age: 25 },
  { value: '26-30', label: '26 a 30 anos', min_age: 26, max_age: 30 },
  { value: '31-35', label: '31 a 35 anos', min_age: 31, max_age: 35 },
  { value: '36-45', label: '36 a 45 anos', min_age: 36, max_age: 45 },
]

/**
 * Faixas de valor de mercado do filtro (roeirotela.md, 2.1 "Filtro: Valor —
 * Select"), cobrindo a escala real de valores calculados pelo backend
 * (jogadores/calculos.py, `calcular_valor_base`).
 */
export const VALUE_RANGES = [
  { value: '0-50', label: 'Até 50', min_value: 0, max_value: 50 },
  { value: '50-100', label: '50 a 100', min_value: 50, max_value: 100 },
  { value: '100-150', label: '100 a 150', min_value: 100, max_value: 150 },
  { value: '150-200', label: '150 a 200', min_value: 150, max_value: 200 },
  {
    value: '200-',
    label: 'Acima de 200',
    min_value: 200,
    max_value: undefined,
  },
]
