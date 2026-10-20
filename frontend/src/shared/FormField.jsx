/**
 * Campo de formulário com rótulo e mensagem de erro, reaproveitado nos 7
 * formulários do frontend (frontend-conventions, "Validação de um campo só").
 * Estilizado com Tailwind: foco visível (anel ao redor) e erro em vermelho
 * junto ao campo (frontend-design-system).
 */
export function FormField({ id, label, error, hint, children }) {
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="form-field flex flex-col gap-1.5 mb-3">
      <label htmlFor={id} className="text-xs font-semibold text-text-muted">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-danger font-medium"
        >
          {error}
        </p>
      )}
    </div>
  )
}
