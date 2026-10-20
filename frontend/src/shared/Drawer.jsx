/**
 * Painel lateral direito (Drawer) usado para mostrar detalhes completos de um
 * item sem sair da tela de lista (roeirotela.md, seção 1 "Painel Lateral" e
 * 3.3 "Detalhes do Jogador"). Overlay escurecido + painel deslizante com
 * cabeçalho, corpo rolável e rodapé fixo opcional.
 */
export function Drawer({
  onClose,
  header,
  children,
  footer,
  widthClassName = 'max-w-md',
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`drawer-panel w-full ${widthClassName} h-full bg-surface shadow-lg flex flex-col`}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-border shrink-0">
          <div className="min-w-0 flex-1">{header}</div>
          {onClose && (
            <button
              type="button"
              aria-label="Fechar"
              onClick={onClose}
              className="shrink-0 rounded-md p-1.5 text-text-muted hover:bg-bg-muted hover:text-text transition-colors"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-border p-4 flex flex-row-reverse gap-2 bg-surface">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
