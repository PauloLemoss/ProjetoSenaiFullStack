import { describe, expect, it } from 'vitest'
import { formatDateTime, parseDateTimeToBrasilia } from './formatDateTime'

describe('formatDateTime', () => {
  it('formata uma data/hora -03:00 da API para DD/MM/AAAA HH:MM', () => {
    expect(formatDateTime('2026-11-04T15:45:00-03:00')).toBe('04/11/2026 15:45')
  })

  it('devolve um traço quando não há data', () => {
    expect(formatDateTime(null)).toBe('-')
    expect(formatDateTime(undefined)).toBe('-')
  })
})

describe('parseDateTimeToBrasilia', () => {
  it('adiciona o sufixo -03:00 ao valor digitado no formulário', () => {
    expect(parseDateTimeToBrasilia('2027-03-02T10:15')).toBe(
      '2027-03-02T10:15-03:00',
    )
  })

  it('devolve null quando não há valor', () => {
    expect(parseDateTimeToBrasilia('')).toBeNull()
    expect(parseDateTimeToBrasilia(null)).toBeNull()
  })
})
