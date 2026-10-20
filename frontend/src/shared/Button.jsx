/**
 * Botão compartilhado com hierarquia visual de três estilos:
 * primário (ação principal), secundário (ação neutra) e perigo (destrutiva).
 * Usa classes utilitárias do Tailwind com os tokens de tema (frontend-design-system).
 */
export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    secondary:
      'bg-surface text-text border border-border hover:bg-bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    danger:
      'bg-danger text-white hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export { Button as default }
