/**
 * Badge de condição física: ponto colorido + texto colorido (verde/âmbar/
 * vermelho), reaproveitado em toda tela que lista jogadores
 * (frontend-design-system, "Badge de condição").
 */
const LABEL_BY_CONDITION = {
  APTO: 'Apto',
  MAL_CONDICIONADO: 'Mal condicionado',
  DOENTE: 'Doente',
}

const DOT_CLASS_BY_CONDITION = {
  APTO: 'bg-success',
  MAL_CONDICIONADO: 'bg-warning',
  DOENTE: 'bg-danger',
}

const TEXT_CLASS_BY_CONDITION = {
  APTO: 'text-success',
  MAL_CONDICIONADO: 'text-warning',
  DOENTE: 'text-danger',
}

export function ConditionBadge({ condition }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${TEXT_CLASS_BY_CONDITION[condition] ?? 'text-text-muted'}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${DOT_CLASS_BY_CONDITION[condition] ?? 'bg-text-muted'}`}
      />
      {LABEL_BY_CONDITION[condition] ?? condition}
    </span>
  )
}
