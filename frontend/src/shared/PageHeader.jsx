/**
 * Cabeçalho de página: chip de ícone, título, subtítulo e, opcionalmente, uma
 * ação primária alinhada ao topo direito (frontend-design-system,
 * "Cabeçalho de página").
 */
export function PageHeader({ icon, title, description, action }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          {description && <p className="text-text-muted mt-1">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
