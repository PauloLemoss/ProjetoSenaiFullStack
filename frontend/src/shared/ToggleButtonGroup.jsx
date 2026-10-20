/**
 * Seletor visual em formato de botões lado a lado (toggles), usado no lugar
 * de um `<select>` quando as opções são poucas e fixas — ex.: posição do
 * jogador (roeirotela.md, 2.2 "Seletores Visuais (Posição)").
 */
export function ToggleButtonGroup({
  name,
  ariaLabel,
  options,
  value,
  onChange,
  disabled,
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? name}
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              selected
                ? 'border-primary text-primary bg-primary/10'
                : 'border-border text-text bg-surface hover:bg-bg-muted'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
