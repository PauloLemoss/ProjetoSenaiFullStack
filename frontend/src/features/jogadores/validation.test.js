import { describe, expect, it } from 'vitest'
import {
  validateAge,
  validateAgility,
  validateAttribute,
  validateIntegerInRange,
  validatePlayerName,
  validateRequired,
} from './validation'

describe('validatePlayerName', () => {
  it('recusa nome com menos de 3 caracteres', () => {
    expect(validatePlayerName('Lu')).toMatch('3 a 100')
  })

  it('recusa nome com mais de 100 caracteres', () => {
    expect(validatePlayerName('a'.repeat(101))).toMatch('3 a 100')
  })

  it('aceita um nome dentro do limite', () => {
    expect(validatePlayerName('João Silva')).toBeNull()
  })
})

describe('validateAgility / validateAge / validateAttribute', () => {
  it('agilidade fora de 1 a 100 é recusada', () => {
    expect(validateAgility(0)).not.toBeNull()
    expect(validateAgility(101)).not.toBeNull()
    expect(validateAgility(50)).toBeNull()
  })

  it('idade fora de 16 a 45 é recusada', () => {
    expect(validateAge(15)).not.toBeNull()
    expect(validateAge(46)).not.toBeNull()
    expect(validateAge(30)).toBeNull()
  })

  it('atributo fora de 1 a 99 é recusado', () => {
    expect(validateAttribute(0)).not.toBeNull()
    expect(validateAttribute(100)).not.toBeNull()
    expect(validateAttribute(80)).toBeNull()
  })
})

describe('validateIntegerInRange', () => {
  it('recusa valor com parte fracionária', () => {
    expect(validateIntegerInRange('50.5', 1, 99)).not.toBeNull()
  })

  it('recusa valor vazio', () => {
    expect(validateIntegerInRange('', 1, 99)).not.toBeNull()
  })
})

describe('validateRequired', () => {
  it('recusa valor vazio ou só espaços', () => {
    expect(validateRequired('   ', 'a posição')).toBe('Informe a posição.')
    expect(validateRequired(undefined, 'o clube')).toBe('Informe o clube.')
  })

  it('aceita valor preenchido', () => {
    expect(validateRequired('GOL', 'a posição')).toBeNull()
  })
})
