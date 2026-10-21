/**
 * Validação de campo único dos formulários de jogador (frontend-conventions,
 * "Validação de um campo só nos 7 formulários antes do envio"). Regras que
 * cruzam campos (soma dos atributos, potencial x maior atributo, agilidade
 * conforme a idade) ficam só na API — a tela mostra o `message` dela.
 */

export function validateRequired(value, label) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `Informe ${label}.`
  }
  return null
}

export function validatePlayerName(name) {
  const trimmed = (name ?? '').trim().replace(/\s+/g, ' ')
  if (trimmed.length === 0) return 'Informe o nome.'
  if (trimmed.length < 3 || trimmed.length > 100) {
    return 'O nome deve ter de 3 a 100 caracteres.'
  }
  return null
}

export function validateIntegerInRange(value, min, max) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return 'Informe um valor.'
  }
  const number = Number(value)
  if (!Number.isInteger(number) || number < min || number > max) {
    return `Informe um número inteiro de ${min} a ${max}.`
  }
  return null
}

export const validateAgility = (value) => validateIntegerInRange(value, 1, 100)
export const validateAge = (value) => validateIntegerInRange(value, 16, 45)
export const validateAttribute = (value) => validateIntegerInRange(value, 1, 99)
