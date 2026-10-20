/**
 * Barra de progresso colorida por faixa de valor (ex.: agilidade), usada nas
 * tabelas que mostram atributos numéricos de 0 a 100
 * (frontend-design-system, "Barra de progresso").
 */
export function ProgressBar({ value, max = 100 }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  const barColor =
    value >= 70 ? 'bg-success' : value < 30 ? 'bg-danger' : 'bg-text-muted/50'

  return (
    <div className="flex items-center gap-2 w-24">
      <span className="text-sm font-medium text-text w-6 text-right tabular-nums">
        {value}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Barra de progresso dupla: fundo cinza, uma barra azul clara até o limite
 * (potencial) e uma barra azul forte sobreposta até o valor atual
 * (roeirotela.md, 3.3 "Gráficos de Barras (Indicadores)").
 */
export function DualProgressBar({ value, limit, max = 99 }) {
  const valuePercent = Math.max(0, Math.min(100, (value / max) * 100))
  const limitPercent = Math.max(0, Math.min(100, (limit / max) * 100))

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="relative flex-1 h-2 rounded-full bg-bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/30"
          style={{ width: `${limitPercent}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: `${valuePercent}%` }}
        />
      </div>
      <span className="text-sm font-medium text-text w-7 text-right tabular-nums">
        {value}
      </span>
    </div>
  )
}
