import { IconAlertCircle } from './Icon'

const SIZE_CLASSES = {
  md: 'max-w-lg',
  lg: 'max-w-3xl',
}

/**
 * Modal de confirmação pós-ação com uma lista de campo/valor (padrão visto no
 * Figma em M05 "Compra concluída" e V02 "Venda concluída"), e também usável
 * como confirmação antes do envio (ex.: excluir jogador, vender jogador).
 * Estilizado com Tailwind: sobreposição escurecida, cartão centralizado com
 * sombra e botão de fechar no canto superior (frontend-design-system).
 *
 * `error`: mensagem de recusa da API, mostrada como caixa vermelha no topo
 * da modal, antes do conteúdo (roeirotela.md, 4 "Estado de Erro — Visual em
 * Modais").
 */
export function Modal({
  title,
  description,
  fields,
  children,
  actions,
  onClose,
  error,
  size = 'md',
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md} max-h-[90vh] overflow-y-auto rounded-xl shadow-lg bg-surface p-6 relative`}
      >
        {onClose && (
          <button
            type="button"
            aria-label="Fechar"
            className="absolute top-3 right-3 rounded-md p-1.5 text-text-muted hover:bg-border hover:text-text transition-colors"
            onClick={onClose}
          >
            ×
          </button>
        )}
        <h2 id="modal-title" className="text-lg font-semibold text-text">
          {title}
        </h2>
        {description && <p className="mt-2 text-text-muted">{description}</p>}
        {error && (
          <p
            role="alert"
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md border border-danger bg-danger-bg text-danger text-sm font-medium"
          >
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </p>
        )}
        {fields && fields.length > 0 && (
          <dl className="mt-4 space-y-2">
            {fields.map((field) => (
              <div key={field.label} className="flex justify-between gap-4">
                <dt className="text-text-muted">{field.label}</dt>
                <dd className="text-text font-semibold">{field.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {children}
        {actions && (
          <div className="mt-5 flex flex-row-reverse gap-2">{actions}</div>
        )}
      </div>
    </div>
  )
}
