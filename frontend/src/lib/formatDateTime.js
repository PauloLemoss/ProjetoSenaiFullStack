const BRASILIA_TIME_ZONE = 'America/Sao_Paulo'

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BRASILIA_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/**
 * Formata uma data/hora devolvida pela API (sempre "-03:00") para exibição no
 * horário de Brasília, no formato DD/MM/AAAA HH:MM (F3 "Apresentação"). Monta
 * a string a partir das partes porque o Intl, em pt-BR, separa data e hora
 * com vírgula por padrão.
 */
export function formatDateTime(isoString) {
  if (!isoString) return '-'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '-'

  const parts = Object.fromEntries(
    dateTimeFormatter
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`
}

/**
 * Converte o valor de um <input type="datetime-local"> ("AAAA-MM-DDTHH:MM")
 * para o formato que a API exige (RN01): o mesmo valor, sempre com o sufixo
 * "-03:00", porque a tela interpreta toda data digitada como horário de
 * Brasília, independente do fuso do navegador (frontend-conventions,
 * "Formatação de moeda e data").
 */
export function parseDateTimeToBrasilia(localDateTimeValue) {
  if (!localDateTimeValue) return null
  return `${localDateTimeValue}-03:00`
}
