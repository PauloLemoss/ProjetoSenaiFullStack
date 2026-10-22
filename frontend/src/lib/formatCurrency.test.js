import { describe, expect, it } from 'vitest'
import { formatCurrency } from './formatCurrency'

describe('formatCurrency', () => {
  it('formata um número com 2 casas e vírgula decimal', () => {
    expect(formatCurrency(40)).toBe('40,00')
  })

  it('formata um valor vindo como string', () => {
    expect(formatCurrency('48.3')).toBe('48,30')
  })

  it('mantém 2 casas mesmo com mais dígitos decimais', () => {
    expect(formatCurrency(1234.5)).toBe('1.234,50')
  })

  it('devolve um traço para valor nulo ou indefinido', () => {
    expect(formatCurrency(null)).toBe('-')
    expect(formatCurrency(undefined)).toBe('-')
  })
})
