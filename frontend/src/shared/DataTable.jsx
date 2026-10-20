import { IconAlertCircle, IconInbox } from './Icon'

const SKELETON_ROWS = 5

/**
 * Tabela genérica com os três estados exigidos nas 6 telas de lista
 * (frontend-conventions, F3 "Estados das telas"): carregando, vazio e erro.
 * Estilizada com Tailwind (frontend-design-system): cartão com sombra e
 * cantos arredondados, cabeçalho destacado.
 *
 * Carregando: skeleton loader com a mesma estrutura da tabela (cabeçalho
 * real + linhas cinza piscando), em vez de um spinner isolado. Vazio: área
 * com ícone, título em negrito, subtítulo opcional e botão secundário de
 * ação opcional (roeirotela.md, 4 "Estado Vazio" e "Estado de Carregamento").
 */
export function DataTable({
  columns,
  rows,
  state = 'ready',
  emptyMessage = 'Nenhum item encontrado.',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  errorMessage = 'Não foi possível carregar os dados.',
  onRetry,
  getRowKey = (row) => row.id,
}) {
  if (state === 'loading') {
    return (
      <div
        role="status"
        className="overflow-x-auto border border-border rounded-lg shadow-sm bg-surface"
      >
        <span className="sr-only">Carregando…</span>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-bg-muted"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, columnIndex) => (
                  <td key={column.key} className="px-3 py-3.5">
                    <div
                      className="h-3.5 rounded bg-bg-muted animate-pulse"
                      style={{
                        width: `${55 + ((rowIndex * 17 + columnIndex * 11) % 35)}%`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div
        className="text-danger py-8 text-center rounded-md border border-border bg-danger-bg p-4"
        role="alert"
      >
        <p className="flex items-center justify-center gap-2 font-medium">
          <IconAlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md border border-primary/20 transition-colors"
          >
            Tentar de novo
          </button>
        )}
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-2 py-12 px-4 rounded-lg border border-dashed border-border bg-bg-muted/50">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-surface text-text-muted border border-border">
          <IconInbox />
        </span>
        <p className="font-semibold text-text">{emptyMessage}</p>
        {emptyDescription && (
          <p className="text-sm text-text-muted max-w-xs">{emptyDescription}</p>
        )}
        {emptyActionLabel && onEmptyAction && (
          <button
            type="button"
            onClick={onEmptyAction}
            className="btn-secondary text-xs mt-2"
          >
            {emptyActionLabel}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg shadow-sm bg-surface">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-3 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-bg-muted"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-border hover:bg-bg-muted/50"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-2.5 text-text">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
