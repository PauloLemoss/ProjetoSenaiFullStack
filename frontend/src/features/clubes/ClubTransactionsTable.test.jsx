import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ClubTransactionsTable } from './ClubTransactionsTable'

vi.mock('../mercado/api')

const TRANSACTIONS = [
  {
    id: 1,
    club_id: 1,
    player_id: 10,
    player_name: 'Jogador A',
    type: 'COMPRA',
    value: 100000,
    fee: 10000,
    penalty: 0,
    profit: null,
    cash_change: -110000,
    created_at: '2026-10-01T10:00:00-03:00',
  },
  {
    id: 2,
    club_id: 1,
    player_id: 11,
    player_name: 'Jogador B',
    type: 'VENDA',
    value: 80000,
    fee: 4000,
    penalty: 8000,
    profit: 12000,
    cash_change: 68000,
    created_at: '2026-10-02T14:30:00-03:00',
  },
]

function renderTable({
  transactions = TRANSACTIONS,
  summary = {
    total_spent: 100000,
    total_received: 80000,
    total_fees: 14000,
    total_penalties: 8000,
    total_profit: 12000,
  },
  state = 'ready',
  errorMessage = '',
} = {}) {
  return render(
    <ClubTransactionsTable
      transactions={transactions}
      summary={summary}
      state={state}
      errorMessage={errorMessage}
      onRetry={vi.fn()}
      filters={{}}
      onFiltersChange={vi.fn()}
    />,
  )
}

describe('ClubTransactionsTable', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra a tabela com data, tipo, jogador, valor, taxa/comissão, multa, lucro e variação do caixa com sinal', async () => {
    renderTable()

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'Jogador A' }),
      ).toBeInTheDocument(),
    )
    expect(screen.getByRole('cell', { name: 'Jogador B' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Compra' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Venda' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '100.000,00' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '80.000,00' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '10.000,00' })).toBeInTheDocument() // taxa da compra
    expect(screen.getByRole('cell', { name: '4.000,00' })).toBeInTheDocument() // comissão da venda
    expect(screen.getByRole('cell', { name: '0,00' })).toBeInTheDocument() // multa da compra
    expect(screen.getByRole('cell', { name: '8.000,00' })).toBeInTheDocument() // multa da venda
    expect(screen.getByRole('cell', { name: '-' })).toBeInTheDocument() // lucro da compra (null)
    expect(screen.getByRole('cell', { name: '12.000,00' })).toBeInTheDocument() // lucro da venda
    expect(
      screen.getByRole('cell', { name: '-110.000,00' }),
    ).toBeInTheDocument() // variação negativa
    expect(screen.getByRole('cell', { name: '+68.000,00' })).toBeInTheDocument() // variação positiva
    expect(screen.getByText('01/10/2026 10:00')).toBeInTheDocument()
    expect(screen.getByText('02/10/2026 14:30')).toBeInTheDocument()
  })

  it('mostra os totais do summary abaixo da tabela', async () => {
    renderTable()

    expect(
      screen.getByText('Totais (respeitando o filtro aplicado)'),
    ).toBeInTheDocument()
    expect(screen.getByText('Total gasto em compras')).toBeInTheDocument()

    const totalSpentLabel = screen.getByText('Total gasto em compras')
    const totalSpentValue = totalSpentLabel.parentElement?.querySelector('dd')
    expect(totalSpentValue?.textContent).toBe('100.000,00')

    expect(screen.getByText('Total recebido em vendas')).toBeInTheDocument()
    const totalReceivedLabel = screen.getByText('Total recebido em vendas')
    const totalReceivedValue =
      totalReceivedLabel.parentElement?.querySelector('dd')
    expect(totalReceivedValue?.textContent).toBe('80.000,00')

    expect(screen.getByText('Total de taxas e comissões')).toBeInTheDocument()
    const totalFeesLabel = screen.getByText('Total de taxas e comissões')
    const totalFeesValue = totalFeesLabel.parentElement?.querySelector('dd')
    expect(totalFeesValue?.textContent).toBe('14.000,00')

    expect(screen.getByText('Total de multas')).toBeInTheDocument()
    const totalPenaltiesLabel = screen.getByText('Total de multas')
    const totalPenaltiesValue =
      totalPenaltiesLabel.parentElement?.querySelector('dd')
    expect(totalPenaltiesValue?.textContent).toBe('8.000,00')

    expect(screen.getByText('Lucro total')).toBeInTheDocument()
    const totalProfitLabel = screen.getByText('Lucro total')
    const totalProfitValue = totalProfitLabel.parentElement?.querySelector('dd')
    expect(totalProfitValue?.textContent).toBe('12.000,00')
  })

  it('mostra traços quando o summary não tem valores', async () => {
    renderTable({ summary: {} })

    const totalSpentLabel = screen.getByText('Total gasto em compras')
    const totalSpentValue = totalSpentLabel.parentElement?.querySelector('dd')
    expect(totalSpentValue?.textContent).toBe('-')
  })

  it('filtra por tipo COMPRA apenas', async () => {
    const onFiltersChange = vi.fn()
    render(
      <ClubTransactionsTable
        transactions={TRANSACTIONS}
        summary={{}}
        state="ready"
        errorMessage=""
        onRetry={vi.fn()}
        filters={{}}
        onFiltersChange={onFiltersChange}
      />,
    )

    await waitFor(() =>
      expect(
        screen.getByRole('cell', { name: 'Jogador A' }),
      ).toBeInTheDocument(),
    )

    // marca a pílula de COMPRA (checkbox dentro do label com texto "Compra")
    await userEvent.click(screen.getByRole('checkbox', { name: /Compra/ }))

    expect(onFiltersChange).toHaveBeenCalledWith({ type: 'COMPRA' })
  })

  it('mostra estado de erro quando a API recusa o filtro', () => {
    renderTable({ state: 'error', errorMessage: 'Jogador não encontrado.' })
    expect(screen.getByText('Jogador não encontrado.')).toBeInTheDocument()
  })

  it('mostra estado de lista vazia quando não há transações', () => {
    renderTable({ transactions: [] })
    expect(
      screen.getByText('Nenhuma transação encontrada.'),
    ).toBeInTheDocument()
  })
})
