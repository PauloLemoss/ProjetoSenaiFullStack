import { describe, expect, it } from 'vitest'
import { validateClubAcronym, validateClubName } from './validation'

describe('validateClubName', () => {
  it('recusa nome vazio ou só espaços', () => {
    expect(validateClubName('')).toBe('Informe o nome.')
    expect(validateClubName('   ')).toBe('Informe o nome.')
  })

  it('recusa nome fora de 3 a 60 caracteres', () => {
    expect(validateClubName('Ab')).not.toBeNull()
    expect(validateClubName('a'.repeat(61))).not.toBeNull()
    expect(validateClubName('Palmeiras')).toBeNull()
  })
})

describe('validateClubAcronym', () => {
  it('recusa sigla vazia', () => {
    expect(validateClubAcronym('')).toBe('Informe a sigla.')
  })

  it('recusa sigla que não são exatamente 3 letras maiúsculas', () => {
    expect(validateClubAcronym('pal')).not.toBeNull()
    expect(validateClubAcronym('PALM')).not.toBeNull()
    expect(validateClubAcronym('PA1')).not.toBeNull()
    expect(validateClubAcronym('PAL')).toBeNull()
  })
})
