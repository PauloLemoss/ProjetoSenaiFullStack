const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formata um valor em moeda com 2 casas decimais e vírgula decimal (F3 "Apresentação").
 * Nunca recalcula o valor: só formata o número que a API devolveu.
 */
export function formatCurrency(value) {
  const numericValue = typeof value === 'string' ? Number(value) : value
  if (
    numericValue === null ||
    numericValue === undefined ||
    Number.isNaN(numericValue)
  ) {
    return '-'
  }
  return currencyFormatter.format(numericValue)
}
