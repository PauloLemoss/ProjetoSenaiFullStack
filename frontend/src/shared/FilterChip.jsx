/**
 * Etiqueta removível de um filtro aplicado, usada na "Área de Filtros
 * Ativos" das telas de lista (roeirotela.md, 2.1 "Filtros Ativos").
 */
export function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover filtro ${label}`}
        className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/20"
      >
        ×
      </button>
    </span>
  )
}
