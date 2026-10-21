/**
 * Validação de campo único do formulário de clube (frontend-conventions,
 * "Validação de um campo só nos 7 formulários antes do envio"). A regra que
 * cruza nome e sigla (sigla formada por letras do nome) fica na API — a tela
 * mostra o `message` dela, incluindo o 409 de nome/sigla repetidos, sem
 * bloquear o envio antecipadamente.
 */

export function validateClubName(name) {
  const trimmed = (name ?? '').trim()
  if (trimmed.length === 0) return 'Informe o nome.'
  if (trimmed.length < 3 || trimmed.length > 60) {
    return 'O nome deve ter de 3 a 60 caracteres.'
  }
  return null
}

export function validateClubAcronym(acronym) {
  const trimmed = (acronym ?? '').trim()
  if (trimmed.length === 0) return 'Informe a sigla.'
  if (!/^[A-Z]{3}$/.test(trimmed)) {
    return 'A sigla deve ter exatamente 3 letras maiúsculas, sem acento.'
  }
  return null
}
