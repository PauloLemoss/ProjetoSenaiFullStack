import { IconLock } from './Icon'

/**
 * Campo bloqueado com ícone de cadeado, para valores calculados pela API
 * (ex.: valor base e overall do jogador) que não podem ser editados no
 * formulário (roeirotela.md, 2.2 "Valor base / Overall").
 */
export function LockedField({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border bg-surface">
      <span className="text-xs font-semibold text-text-muted">{label}</span>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-text">
        {value}
        <IconLock className="w-3.5 h-3.5 text-text-muted" />
      </span>
    </div>
  )
}
