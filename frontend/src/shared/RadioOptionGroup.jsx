/**
 * Lista selecionável (radio group) com texto de ajuda por opção — ex.:
 * alterar condição física do jogador (roeirotela.md, 2.3 "Radio Button
 * Group... Inclui texto de ajuda em cada opção").
 */
export function RadioOptionGroup({
  name,
  ariaLabel,
  options,
  value,
  onChange,
  disabledValues = [],
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? name}
      className="flex flex-col gap-2"
    >
      {options.map((option) => {
        const selected = option.value === value
        const isDisabled = disabledValues.includes(option.value)
        return (
          <label
            key={option.value}
            className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
              selected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-bg-muted'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name={name}
              aria-label={option.label}
              value={option.value}
              checked={selected}
              disabled={isDisabled}
              onChange={() => onChange(option.value)}
              className="mt-0.5"
            />
            <span>
              <span className="block text-sm font-medium text-text">
                {option.label}
              </span>
              {option.help && (
                <span className="block text-xs text-text-muted mt-0.5">
                  {option.help}
                </span>
              )}
            </span>
          </label>
        )
      })}
    </div>
  )
}
