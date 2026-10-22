import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DataTable } from './DataTable'

const columns = [
  { key: 'name', header: 'Jogador' },
  { key: 'position', header: 'Posição' },
]

describe('DataTable', () => {
  it('mostra o estado de carregamento', () => {
    render(<DataTable columns={columns} rows={[]} state="loading" />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
  })

  it('mostra o estado de lista vazia', () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        emptyMessage="Nenhum jogador cadastrado"
      />,
    )
    expect(screen.getByText('Nenhum jogador cadastrado')).toBeInTheDocument()
  })

  it('mostra o estado de erro com botão de tentar de novo', () => {
    const onRetry = vi.fn()
    render(
      <DataTable
        columns={columns}
        rows={[]}
        state="error"
        errorMessage="Não foi possível carregar os jogadores"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os jogadores',
    )
    screen.getByRole('button', { name: 'Tentar de novo' }).click()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renderiza uma linha por item, usando o render da coluna quando houver', () => {
    const rows = [{ id: 1, name: 'João Silva', position: 'ATA' }]
    render(
      <DataTable
        columns={[
          ...columns,
          { key: 'label', header: 'Rótulo', render: (row) => `#${row.id}` },
        ]}
        rows={rows}
      />,
    )
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
  })
})
